import Fastify from 'fastify';
import { buildProject, buildProjectStreaming } from './builder.js';
import { BuildCache, hashRequest } from './cache.js';
import type { BuildRequest, BuildResponse } from './types.js';

const PORT = Number.parseInt(process.env.PORT ?? '8788', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    bodyLimit: 10 * 1024 * 1024, // 10MB — enough for any Solana project
});

const cache = new BuildCache();

app.get('/health', async () => ({ ok: true, cached: cache.size() }));

app.post<{ Body: BuildRequest }>('/build', async (req, reply) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Body must be a BuildRequest' });
    }
    if (!body.manifestPath || !body.files) {
        return reply.code(400).send({ error: 'manifestPath and files are required' });
    }

    const key = hashRequest(body.files, body.manifestPath);
    const hit = cache.get(key);
    if (hit) {
        req.log.info({ key, durationMs: hit.durationMs }, 'cache hit');
        return reply.header('X-Cache', 'HIT').send(hit);
    }

    let result: BuildResponse;
    try {
        result = await buildProject(body);
    } catch (err) {
        req.log.error({ err }, 'build failed');
        return reply.code(500).send({
            ok: false,
            diagnostics: [{
                severity: 'error',
                message: err instanceof Error ? err.message : String(err),
                file: body.manifestPath,
            }],
            durationMs: 0,
        } satisfies BuildResponse);
    }

    if (result.ok) {
        cache.set(key, result);
    }
    req.log.info({ key, ok: result.ok, durationMs: result.durationMs }, 'build complete');
    return reply.header('X-Cache', 'MISS').send(result);
});

/**
 * SSE streaming endpoint: POST /build/stream
 *
 * Same request body as POST /build, but responds with:
 *   Content-Type: text/event-stream
 *
 * Event types emitted during the build:
 *   event: log     - a single line of raw cargo/anchor output
 *   event: result  - the final BuildResponse JSON (last event before close)
 *
 * The client can render log lines immediately so there is visible feedback
 * during the 1-3 minute cold build, rather than a frozen spinner.
 *
 * Cache hits respond immediately with a single "result" event.
 */
app.post<{ Body: BuildRequest }>('/build/stream', async (req, reply) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'Body must be a BuildRequest' });
    }
    if (!body.manifestPath || !body.files) {
        return reply.code(400).send({ error: 'manifestPath and files are required' });
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const send = (event: string, data: string) => {
        reply.raw.write(`event: ${event}\ndata: ${data}\n\n`);
    };

    const key = hashRequest(body.files, body.manifestPath);
    const hit = cache.get(key);
    if (hit) {
        req.log.info({ key }, 'stream: cache hit');
        send('log', 'Build cache hit — returning cached result.');
        send('result', JSON.stringify(hit));
        reply.raw.end();
        return reply;
    }

    let result: BuildResponse;
    try {
        result = await buildProjectStreaming(body, (line) => send('log', line));
    } catch (err) {
        req.log.error({ err }, 'stream: build failed');
        const errResult: BuildResponse = {
            ok: false,
            diagnostics: [{
                severity: 'error',
                message: err instanceof Error ? err.message : String(err),
                file: body.manifestPath,
            }],
            durationMs: 0,
        };
        send('result', JSON.stringify(errResult));
        reply.raw.end();
        return reply;
    }

    if (result.ok) {
        cache.set(key, result);
    }
    req.log.info({ key, ok: result.ok, durationMs: result.durationMs }, 'stream: build complete');
    send('result', JSON.stringify(result));
    reply.raw.end();
    return reply;
});

const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

app
    .listen({ port: PORT, host: HOST })
    .then((addr) => app.log.info(`build-service listening on ${addr}`))
    .catch((err) => {
        app.log.error(err);
        process.exit(1);
    });
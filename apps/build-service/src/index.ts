import Fastify from 'fastify';
import { buildProject } from './builder.js';
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
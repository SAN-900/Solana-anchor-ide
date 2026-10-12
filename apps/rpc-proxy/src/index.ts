interface Env {
    HELIUS_API_KEY: string;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_PER_MINUTE: string;
}

const UPSTREAM: Record<string, string> = {
    devnet: 'https://devnet.helius-rpc.com/',
    'mainnet-beta': 'https://mainnet.helius-rpc.com/',
};

// Best-effort per-isolate rate limit. Cloudflare may spin up multiple
// isolates, so this is a soft cap, not a hard guarantee.
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitOk(ip: string, perMinute: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || now >= bucket.resetAt) {
        buckets.set(ip, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (bucket.count >= perMinute) return false;
    bucket.count++;
    return true;
}

function corsHeaders(origin: string, allowed: string): Record<string, string> {
    const allowOrigin = allowed === '*' ? '*' : allowed.split(',').map((s) => s.trim()).includes(origin) ? origin : 'null';
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
    };
}

function errorJson(status: number, code: string, message: string, cors: Record<string, string>): Response {
    return new Response(JSON.stringify({ error: { code, message } }), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors },
    });
}

export default {
    async fetch(req: Request, env: Env): Promise<Response> {
        const url = new URL(req.url);
        const origin = req.headers.get('Origin') ?? '';
        const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

        // Route: /devnet or /mainnet-beta
        const cluster = url.pathname.replace(/^\/+/, '');
        const upstreamBase = UPSTREAM[cluster];

        if (req.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }

        if (req.method !== 'POST') {
            return errorJson(405, 'METHOD_NOT_ALLOWED', 'Only POST is supported', cors);
        }

        if (!upstreamBase) {
            return errorJson(404, 'UNKNOWN_CLUSTER', `Unknown cluster: ${cluster || '(empty)'}`, cors);
        }

        if (!env.HELIUS_API_KEY) {
            return errorJson(500, 'PROXY_MISCONFIGURED', 'Helius API key not configured', cors);
        }

        // Rate limit by client IP (Cloudflare sets CF-Connecting-IP).
        const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
        const limit = Number.parseInt(env.RATE_LIMIT_PER_MINUTE, 10) || 60;
        if (!rateLimitOk(ip, limit)) {
            return errorJson(429, 'RATE_LIMITED', `Exceeded ${limit} requests/minute`, cors);
        }

        // Read body once. Enforce a sane size cap.
        const body = await req.text();
        if (body.length > 1_000_000) {
            return errorJson(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds 1MB', cors);
        }

        const upstreamUrl = `${upstreamBase}?api-key=${encodeURIComponent(env.HELIUS_API_KEY)}`;

        let upstreamRes: Response;
        try {
            upstreamRes = await fetch(upstreamUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });
        } catch {
            return errorJson(502, 'UPSTREAM_UNREACHABLE', 'Failed to reach upstream RPC', cors);
        }

        const text = await upstreamRes.text();

        // Pass through only the headers that matter; drop upstream's Set-Cookie etc.
        return new Response(text, {
            status: upstreamRes.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
                ...cors,
            },
        });
    },
};
import dns from 'node:dns';

// 1. Force Node.js to resolve IPv4 first (fixes Render IPv6 connection hangs)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// 2. Set reliable public DNS resolvers (Cloudflare & Google) on the synchronous module
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (err) {
    console.warn('Failed to set custom DNS servers:', err.message);
}
import dns from "node:dns/promises";

// Force a reliable DNS resolver (Cloudflare) for SRV/TXT lookups
// required by mongodb+srv connection strings.
dns.setServers(["1.1.1.1"]);

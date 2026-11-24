import dns from "dns"

// 1. Prefer IPv4 DNS resolution first to avoid connect timeouts on Windows / Node 18+
try {
  dns.setDefaultResultOrder("ipv4first")
} catch {
  // Ignore if unsupported
}

// 2. Set reliable public DNS servers (Google & Cloudflare) to ensure cloud DBs (Neon tech, AWS) resolve
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])
} catch (e) {
  console.warn("Could not set custom DNS servers:", e)
}

// 3. Fallback DNS lookup hook for hostnames that fail local OS getaddrinfo (common on Windows with Neon AWS domains)
const origLookup = dns.lookup
;(dns as any).lookup = function (hostname: any, options: any, callback: any) {
  if (typeof options === "function") {
    callback = options
    options = {}
  }

  origLookup(hostname, options, (err: any, address: any, family: any) => {
    if (err && typeof hostname === "string" && (hostname.includes("neon.tech") || hostname.includes("aws") || hostname.includes("cloud"))) {
      dns.resolve4(hostname, (rErr, addresses) => {
        if (!rErr && addresses && addresses.length > 0) {
          if (options && options.all) {
            return callback(
              null,
              addresses.map((a) => ({ address: a, family: 4 }))
            )
          }
          return callback(null, addresses[0], 4)
        }
        callback(err, address, family)
      })
    } else {
      callback(err, address, family)
    }
  })
}

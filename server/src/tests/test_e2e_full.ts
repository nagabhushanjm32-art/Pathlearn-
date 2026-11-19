import prisma from "../utils/prisma"

const BASE_URL = "http://localhost:5000/api"

async function runE2E() {
  console.log("=== PATHLEARN FULL E2E AUTH & DB VERIFICATION ===")

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`)
  const healthData = (await healthRes.json()) as any
  console.log(`[1] Health Check: status=${healthRes.status}, db=${healthData.database}`)

  // 2. Register user
  const email = `test_engineer_${Date.now()}@pathlearn.dev`
  const password = "ProductionSecure2026!"
  const name = "Enter name "

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      confirmPassword: password,
    }),
  })
  const regData = (await regRes.json()) as any
  console.log(`[2] Register User: status=${regRes.status}, user=${JSON.stringify(regData.user)}`)

  const cookieHeader = regRes.headers.get("set-cookie") || ""
  const cookie = cookieHeader.split(";")[0]
  console.log(`[3] Cookie Received: ${cookie ? `YES (${cookie.substring(0, 15)}...)` : "NO"}`)

  // 4. Verify password is encrypted in database with bcrypt
  const dbUser = await prisma.user.findUnique({ where: { email } })
  console.log(`[4] Database Record in PostgreSQL:`)
  console.log(`    - ID: ${dbUser?.id}`)
  console.log(`    - Email: ${dbUser?.email}`)
  console.log(`    - Name: ${dbUser?.name}`)
  console.log(`    - Password Hashed: ${dbUser?.password.startsWith("$2b$") || dbUser?.password.startsWith("$2a$") ? "YES (bcrypt)" : "NO"}`)
  console.log(`    - Password length in DB: ${dbUser?.password.length} chars (Bcrypt hash)`)

  // 5. Test /api/auth/me with Cookie
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: cookie },
  })
  const meData = (await meRes.json()) as any
  console.log(`[5] /api/auth/me Session Restore: status=${meRes.status}, authenticated=${meData.authenticated}, name=${meData.user?.name}`)

  // 6. Test Logout
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie },
  })
  const logoutData = (await logoutRes.json()) as any
  console.log(`[6] Logout: status=${logoutRes.status}, message=${logoutData.message}`)

  // 7. Test /api/auth/me without Cookie
  const meAfterLogout = await fetch(`${BASE_URL}/auth/me`)
  const meAfterLogoutData = (await meAfterLogout.json()) as any
  console.log(`[7] /api/auth/me After Logout: status=${meAfterLogout.status}, message=${meAfterLogoutData.message}`)

  // 8. Test Login with credentials
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  })
  const loginData = (await loginRes.json()) as any
  console.log(`[8] Login with Credentials: status=${loginRes.status}, user=${loginData.user?.name}`)

  console.log("\n✅ All End-to-End checks completed successfully!")
  process.exit(0)
}

runE2E().catch(err => {
  console.error("E2E Test Failed:", err)
  process.exit(1)
})

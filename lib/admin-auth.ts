const ADMIN_STORAGE_KEY = "Tunitest_admin_auth"

// Mock admin users
const ADMIN_USERS = [
  { username: "admin", password: "chiraz@Tunitest2026" },
  { username: "owner", password: "owner123" },
]

export function validateAdminCredentials(username: string, password: string): boolean {
  return ADMIN_USERS.some((user) => user.username === username && user.password === password)
}

export function setAdminSession(username: string): void {
  const token = encodeBase64(`${username}:${Date.now()}`)
  sessionStorage.setItem(ADMIN_STORAGE_KEY, token)
}

export function getAdminSession(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(ADMIN_STORAGE_KEY)
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(ADMIN_STORAGE_KEY)
}

export function isAdminAuthenticated(): boolean {
  const session = getAdminSession()
  return isValidAdminSessionToken(session)
}

export function getAdminApiHeaders(): HeadersInit {
  const session = getAdminSession()
  return session ? { "x-admin-session": session } : {}
}

export function isAdminRequest(request: Request): boolean {
  return isValidAdminSessionToken(request.headers.get("x-admin-session"))
}

export function isValidAdminSessionToken(token: string | null): boolean {
  if (!token) return false

  const decoded = decodeBase64(token)
  if (!decoded) return false

  const [username, issuedAt] = decoded.split(":")
  const timestamp = Number(issuedAt)

  return ADMIN_USERS.some((user) => user.username === username) && Number.isFinite(timestamp) && timestamp > 0
}

function encodeBase64(value: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(value)
  }

  return Buffer.from(value).toString("base64")
}

function decodeBase64(value: string): string | null {
  try {
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return window.atob(value)
    }

    return Buffer.from(value, "base64").toString("utf8")
  } catch {
    return null
  }
}

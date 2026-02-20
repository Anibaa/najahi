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
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")
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
  return !!session
}

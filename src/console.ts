export function success(message: string): string {
  return `🟩 ${message}`
}

export function warning(message: string): string {
  return `🟨 ${message}`
}

export function error(message: string): string {
  return `🟥 ${message}`
}

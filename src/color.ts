import chalk from 'chalk'

export function colorTargetName(targetName: string): string {
  return chalk.cyan(targetName)
}

export function colorFilePath(filePath: string): string {
  return chalk.yellow(filePath)
}

export function colorSourceFilePath(filePath: string): string {
  return chalk.italic.green(filePath)
}

export function colorTargetFilePath(message: string): string {
  return chalk.italic.magenta(message)
}

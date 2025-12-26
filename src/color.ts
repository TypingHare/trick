import chalk from 'chalk'

export function colorTargetName(targetName: string): string {
  return chalk.cyan(targetName)
}

export function colorFilePath(filePath: string): string {
  return chalk.yellow(filePath)
}

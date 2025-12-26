import { error, warning } from './console.js'

/**
 * Thrown when the root directory is not found.
 */
export class RootDirectoryNotFoundError extends Error {
  public constructor() {
    super('Root directory not found')
  }
}

/**
 * Thrown when fail to write the configuration file.
 */
export class WriteConfigError extends Error {
  public constructor(err: any) {
    super(`Fail to write the configuration file. ${err}`)
  }
}

/**
 * Thrown when fail to read the configuration file.
 */
export class ReadConfigError extends Error {
  public constructor(err: any) {
    super(`Fail to read the configuration file: ${err}`)
  }
}

/**
 * Thrown when the specified target is not found in the configuration.
 */
export class TargetNotFoundError extends Error {
  public constructor(public readonly targetName: string) {
    super(`Target not found: ${targetName}`)
  }
}

/**
 * Thrown when fail to encrypt the source file.
 */
export class FailToEncryptFileError extends Error {
  public constructor(
    public readonly srcFilePath: string,
    public readonly opensslErrMessage?: string
  ) {
    super(`Fail to encrypt source file: ${srcFilePath}`)
  }
}

/**
 * Thrown when fail to decrypt the source file.
 */
export class FailToDecryptFileError extends Error {
  public constructor(
    public readonly destFilePath: string,
    public readonly opensslErrMessage?: string
  ) {
    super(`Fail to decrypt destination file: ${destFilePath}`)
  }
}

/**
 * Thrown when the passphrase file is not found.
 */
export class PassphraseFileNotFoundError extends Error {
  public constructor(public readonly passphraseFilePath: string) {
    super(`Passphrase file not found: ${passphraseFilePath}`)
  }
}

export function resolveError(err: any): void {
  if (!(err instanceof Error)) {
    console.error(error(`Unknown error: ${err}`))
    process.exit(2)
  }

  if (err.message) {
    console.error(error(err.message))
  }

  if (err instanceof PassphraseFileNotFoundError) {
    console.error(warning(`Use the "set-passphrase" command to set the passphrase file.`))
  }

  if (err instanceof FailToEncryptFileError || err instanceof FailToDecryptFileError) {
    if (err.opensslErrMessage) {
      console.error(error(err.opensslErrMessage))
    }

    console.error(warning('Make sure the file exists and you have enough permission to access it.'))
  }

  process.exit(1)
}

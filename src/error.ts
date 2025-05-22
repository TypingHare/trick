import chalk from 'chalk'

export class WriteConfigError extends Error {
    public constructor(err: any) {
        super(`Fail to write the configuration file. ${err}`)
    }
}

export class ReadConfigError extends Error {
    public constructor(err: any) {
        super(`Fail to read the configuration file: ${err}`)
    }
}

export class TargetNotFoundError extends Error {
    public constructor(public readonly secretName: string) {
        super(`Target not found: ${secretName}`)
    }
}

export class FailToEncryptFileError extends Error {
    public constructor(
        public readonly srcFilePath: string,
        public readonly opensslErrMessage?: string
    ) {
        super(`Fail to encrypt source file: ${srcFilePath}`)
    }
}

export class FailToDecryptFileError extends Error {
    public constructor(
        public readonly destFilePath: string,
        public readonly opensslErrMessage?: string
    ) {
        super(`Fail to decrypt destination file: ${destFilePath}`)
    }
}

export class PassphraseFileNotFoundError extends Error {
    public constructor(public readonly passphraseFilePath: string) {
        super(`Passphrase file not found: ${passphraseFilePath}`)
    }
}

export class PassphraseNotFoundError extends Error {
    public constructor(
        public readonly passphraseFilePath: string,
        public readonly targetName: string
    ) {
        super(
            `Passphrase for target ${targetName} is not found in the passphrase file: ${passphraseFilePath}`
        )
    }
}

export function resolve_error(err: any): void {
    if (!(err instanceof Error)) {
        console.error(`Unknown error: ${err}`)
        process.exit(2)
    }

    if (err.message) {
        console.log(chalk.red(err.message))
    }

    if (
        err instanceof FailToEncryptFileError ||
        err instanceof FailToDecryptFileError
    ) {
        if (err.opensslErrMessage) {
            console.error(chalk.red(err.opensslErrMessage))
        }

        console.error(
            chalk.yellow(
                'Make sure the file exists and you have enough permission to access it.'
            )
        )
    }

    process.exit(1)
}

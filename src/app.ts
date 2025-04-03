import { Command } from 'commander'
import {
    getTargetFromConfig,
    ReadConfigError,
    Target,
    TargetNotFoundError,
    updateConfig,
    WriteConfigError,
} from './config.js'
import {
    decryptFiles,
    encryptFiles,
    FailToDecryptFileError,
    FailToEncryptFileError,
} from './encrypt.js'
import { getSecret, SecretNotFoundError } from './secret.js'
import { TRICK_ENCRYPTED_DIR } from './constant.js'
import fsExtra from 'fs-extra'
import chalk from 'chalk'

const program = new Command()

program.version('1.0.7')
program.description('Save credential files to remote safely.')

program
    .command('add')
    .description('Add a target or add files to an existing target.')
    .argument('<secret-name>', 'The name of secret in the environment')
    .argument('[files...]', 'Files this target will encrypt')
    .action(async (secretName: string, files: string[]): Promise<void> => {
        await updateConfig((config) => {
            try {
                const target = getTargetFromConfig(config, secretName)
                target.files.push(...files)

                return true
            } catch (err) {
                config.default_secret_name = secretName
                config.targets.push({ secret_name: secretName, files })

                return true
            }
        })
    })

program
    .command('remove')
    .description('Remove files from a specific target.')
    .argument('<secret-name>', 'The name of secret in the environment.')
    .argument('[files...]', 'Files to remove.')
    .option('-t, --target', 'Remove the target instead.')
    .action(
        async (
            secretName: string,
            files: string[],
            options: {
                target: boolean
            }
        ): Promise<void> => {
            if (options.target) {
                await updateConfig((config) => {
                    const index: number = config.targets.findIndex(
                        (target) => target.secret_name === secretName
                    )

                    if (index == -1) {
                        console.log(
                            chalk.yellow(
                                `[WARNING] Target not found: ${secretName}`
                            )
                        )

                        return false
                    }

                    config.targets.splice(index, 1)
                    console.log(`[SUCCESS] Removed target: ${secretName}`)

                    return true
                })
                return
            }

            await updateConfig((config) => {
                try {
                    const target = getTargetFromConfig(config, secretName)
                    const target_files = target.files
                    for (const file of files) {
                        const index = target_files.indexOf(file)
                        if (index != -1) {
                            target_files.splice(index, 1)
                            console.log(`[SUCCESS] Removed file: ${file}`)
                            continue
                        }

                        console.log(
                            chalk.yellow(
                                `[WARNING] File does not exist in the target: ${file}`
                            )
                        )
                    }
                } catch (err: unknown) {
                    config.default_secret_name = secretName
                }

                return true
            })
        }
    )

function checkSecretName(
    secretName?: string,
    defaultSecretName?: string
): string {
    if (!secretName) {
        secretName = defaultSecretName
    }

    if (!secretName) {
        throw new Error(
            'No secret name given, and the default secret name is not set.'
        )
    }

    return secretName
}

program
    .command('encrypt')
    .description('Encrypt the credential files.')
    .argument(
        '[secret-name]',
        'The name of secret in the environment',
        undefined
    )
    .action(async (secretName?: string): Promise<void> => {
        await updateConfig((config) => {
            secretName = checkSecretName(secretName, config.default_secret_name)
            const target: Target = getTargetFromConfig(config, secretName)
            const secret: string = getSecret(target.secret_name)
            const srcFilePaths: string[] = target.files
            fsExtra.ensureDir(TRICK_ENCRYPTED_DIR)
            encryptFiles(
                srcFilePaths,
                TRICK_ENCRYPTED_DIR,
                secret,
                config.iteration_count
            )
            return false
        })
    })

program
    .command('decrypt')
    .description('Decrypt the credential files.')
    .argument(
        '[secret-name]',
        'The name of secret in the environment',
        undefined
    )
    .action(async (secretName?: string): Promise<void> => {
        await updateConfig((config) => {
            secretName = checkSecretName(secretName, config.default_secret_name)
            const target: Target = getTargetFromConfig(config, secretName)
            const secret: string = getSecret(target.secret_name)
            const srcFilePaths: string[] = target.files
            fsExtra.ensureDir(TRICK_ENCRYPTED_DIR)
            decryptFiles(
                srcFilePaths,
                TRICK_ENCRYPTED_DIR,
                secret,
                config.iteration_count
            )
            return false
        })
    })

program
    .command('set-default')
    .description('Set the default secret name.')
    .argument('<secret-name>', 'The name of secret in the environment')
    .action(async (secretName: string): Promise<void> => {
        await updateConfig((config) => {
            config.default_secret_name = secretName

            return true
        })
    })

program
    .command('get-default')
    .description('Get the default secret name.')
    .action(async (): Promise<void> => {
        await updateConfig((config) => {
            console.log(config.default_secret_name)
            return false
        })
    })

program
    .command('list')
    .description('Display a list of targets.')
    .action(async (): Promise<void> => {
        await updateConfig((config) => {
            for (const target of config.targets) {
                console.log(chalk.cyan(target.secret_name))
                for (const file of target.files) {
                    console.log('    ' + chalk.yellow(file))
                }
            }

            return false
        })
    })

program.parse()

process.on('uncaughtException', (err) => {
    resolve_error(err)
    process.exit(1)
})

export function resolve_error(err: any): void {
    if (!(err instanceof Error)) {
        console.error(`Unknown error: ${err}`)
        process.exit(2)
    }

    if (err instanceof WriteConfigError) {
        console.error(chalk.red('Fail to write Trick config file'))
    } else if (err instanceof ReadConfigError) {
        console.error(chalk.red('Fail to read Trick config file'))
    } else if (err instanceof SecretNotFoundError) {
        console.error(chalk.red(err.message))
    } else if (err instanceof TargetNotFoundError) {
        console.error(chalk.red(err.message))
    } else if (err instanceof FailToEncryptFileError) {
        console.error(chalk.red(err.message))
        if (err.opensslErrMessage) {
            console.error(chalk.red(err.opensslErrMessage))
        } else {
            console.error(
                chalk.yellow(
                    'Make sure the file exists and you have enough permission to access it'
                )
            )
        }
    } else if (err instanceof FailToDecryptFileError) {
        console.error(chalk.red(err.message))
        if (err.opensslErrMessage) {
            console.error(chalk.red(err.opensslErrMessage))
        } else {
            console.error(
                chalk.yellow(
                    'Make sure the file exists and you have enough permission to access it'
                )
            )
        }
    }

    process.exit(1)
}

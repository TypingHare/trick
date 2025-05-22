import { Command } from 'commander'
import { Config, getTargetFromConfig, Target, updateConfig } from './config.js'
import { decryptFiles, encryptFiles } from './encrypt.js'
import fsExtra, { remove } from 'fs-extra'
import chalk from 'chalk'
import { getPassphrase } from './secret.js'
import { resolve_error } from './error.js'

const program = new Command()
program.version('2.0.0')
program.description('Save credential files to remote safely and easily.')

program
    .command('add')
    .description('Add files to a target.')
    .argument('<name>', 'The name of the target.')
    .argument('[files...]', 'Files that are encrypted.')
    .action(async (targetName: string, files: string[]): Promise<void> => {
        await updateConfig((config) => {
            try {
                const target = getTargetFromConfig(config, targetName)
                target.files.push(...files)
            } catch (err) {
                config.default_target_name = targetName
                config.targets[targetName] = { files }
            }

            return true
        })
    })

program
    .command('remove')
    .description('Remove files from a target.')
    .argument('<name>', 'The name of the target.')
    .argument('[files...]', 'Files to remove.')
    .option('-t, --target', 'Remove the target instead.')
    .action(
        async (
            targetName: string,
            files: string[],
            options: {
                target: boolean
            }
        ): Promise<void> => {
            if (options.target) {
                // Remove the target
                return await updateConfig((config) => {
                    getTargetFromConfig(config, targetName)
                    delete config.targets[targetName]
                    console.log(`[SUCCESS] Removed target: ${targetName}`)

                    return true
                })
            }

            // Remove files from the target
            await updateConfig((config) => {
                const target = getTargetFromConfig(config, targetName)
                const removedFiles: string[] = []
                const remainingFiles: string[] = []
                for (const file of target.files) {
                    if (files.includes(file)) {
                        removedFiles.push(file)
                        console.log(`[SUCCESS] Removed file: ${file}`)
                    } else {
                        remainingFiles.push(file)
                    }
                }

                target.files = remainingFiles
                const notFoundFiles = files.filter(
                    (it) => !removedFiles.includes(it)
                )

                for (const notFoundFile of notFoundFiles) {
                    console.log(
                        `[WARNING] File not found in the target: ${notFoundFile}`
                    )
                }

                return true
            })
        }
    )

function getTargetName(
    targetNameOrNull: string | null,
    defaultTargetName: Config['default_target_name']
): string {
    const targetName: string | null =
        targetNameOrNull === null ? defaultTargetName : targetNameOrNull

    if (targetName === null) {
        throw new Error(
            'Target is not specified and the default target name is null!'
        )
    }

    return targetName
}

program
    .command('encrypt')
    .description('Encrypt the credential files.')
    .argument('[target]', 'The name of the target', null)
    .action(async (targetNameOrNull: string | null): Promise<void> => {
        await updateConfig((config) => {
            const targetName: string = getTargetName(
                targetNameOrNull,
                config.default_target_name
            )
            const target: Target = getTargetFromConfig(config, targetName)
            const passphrase: string = getPassphrase(config, targetName)
            const srcFilePaths: string[] = target.files
            fsExtra.ensureDir(config.root_directory)
            encryptFiles(
                srcFilePaths,
                config.root_directory,
                passphrase,
                config.encryption.iteration_count
            )
        })
    })

program
    .command('decrypt')
    .description('Decrypt the credential files.')
    .argument('[target]', 'The name of the target', null)
    .action(async (targetNameOrNull: string | null): Promise<void> => {
        await updateConfig((config) => {
            const targetName: string = getTargetName(
                targetNameOrNull,
                config.default_target_name
            )
            const target: Target = getTargetFromConfig(config, targetName)
            const passphrase: string = getPassphrase(config, targetName)
            const srcFilePaths: string[] = target.files
            fsExtra.ensureDir(config.root_directory)
            decryptFiles(
                srcFilePaths,
                config.root_directory,
                passphrase,
                config.encryption.iteration_count
            )
        })
    })

program
    .command('set-default')
    .description('Set the default target name.')
    .argument('<target>', 'The name of the target to set.')
    .action(async (secretName: string): Promise<void> => {
        await updateConfig((config) => {
            config.default_target_name = secretName
            return true
        })
    })

program
    .command('get-default')
    .description('Get the default secret name.')
    .action(async (): Promise<void> => {
        await updateConfig((config) => {
            console.log(config.default_target_name)
        })
    })

program
    .command('list')
    .description('Display a list of targets.')
    .action(async (): Promise<void> => {
        await updateConfig((config) => {
            for (const [targetName, target] of Object.entries(config.targets)) {
                console.log(chalk.cyan(targetName))
                for (const file of target.files) {
                    console.log('    ' + chalk.yellow(file))
                }
            }
        })
    })

program.parse()

process.on('uncaughtException', (err) => {
    resolve_error(err)
    process.exit(1)
})

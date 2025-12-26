import { Command } from 'commander'
import {
  CONFIG_FILE_NAME,
  getRootDirectory,
  getTargetFromConfig,
  Target,
  updateConfig,
} from './config.js'
import { decryptFiles, encryptFiles } from './encrypt.js'
import fsExtra from 'fs-extra'
import { getPassphrase, getPassphraseDirectory } from './passphrase.js'
import { resolveError } from './error.js'
import path from 'path'
import { colorFilePath, colorTargetName } from './color.js'
import { success, warning } from './console.js'

const program = new Command()
program.version('2.1.0')
program.description('Save credential files to remote safely and easily.')

program
  .command('config')
  .description('Display the current configuration.')
  .action(function (): void {
    updateConfig((config) => {
      console.log(JSON.stringify(config, null, 2))
    })
  })

program
  .command('init')
  .description('Initialize the configuration file.')
  .option('-r, --root', 'Create the configuration file in the root directory.', false)
  .action(function (options: { root: boolean }): void {
    const configFilePath = options.root
      ? path.join(getRootDirectory(), CONFIG_FILE_NAME)
      : path.join(process.cwd(), CONFIG_FILE_NAME)

    if (fsExtra.existsSync(configFilePath)) {
      console.log(warning(`Configuration file already exists: ${configFilePath}`))
      return
    } else {
      updateConfig(() => true, options.root)
      console.log(success(`Initialized configuration file: ${configFilePath}`))
    }
  })

program
  .command('add')
  .description('Add files to a target.')
  .argument('<target>', 'The name of the target to add to')
  .argument('[files...]', 'Files that are added to the target')
  .action(function (targetName: string, files: string[]): void {
    updateConfig((config) => {
      const target = config.targets[targetName]
      if (target) {
        target.files.push(...files)
      } else {
        config.targets[targetName] = { files }
      }

      return true
    })
  })

program
  .command('remove')
  .description('Remove files from a target.')
  .argument('<target>', 'The name of the target to remove from')
  .argument('[files...]', 'Files to remove from the target')
  .option('-t, --target', 'Remove the target instead.')
  .action(function (
    targetName: string,
    files: string[],
    options: {
      target: boolean
    }
  ): void {
    if (options.target) {
      // Remove the target
      return updateConfig((config) => {
        getTargetFromConfig(config, targetName)
        delete config.targets[targetName]
        console.log(`[SUCCESS] Removed target: ${targetName}`)

        return true
      })
    }

    // Remove files from the target
    updateConfig((config) => {
      const target = getTargetFromConfig(config, targetName)
      const removedFiles: string[] = []
      const remainingFiles: string[] = []
      for (const file of target.files) {
        if (files.includes(file)) {
          removedFiles.push(file)
          console.log(success(`Removed file: ${file}`))
        } else {
          remainingFiles.push(file)
        }
      }

      target.files = remainingFiles
      const notFoundFiles = files.filter((it) => !removedFiles.includes(it))

      for (const notFoundFile of notFoundFiles) {
        console.log(warning(`File not found in the target: ${notFoundFile}`))
      }

      return true
    })
  })

program
  .command('encrypt')
  .description('Encrypt the credential files.')
  .argument('[targetNames...]', 'The names of targets')
  .action(function (targetNames: string[]): void {
    updateConfig((config) => {
      if (targetNames.length === 0) {
        targetNames.push(...config.defaultTargetNames)
      }

      const rootDirectory = getRootDirectory()
      const trickRootDirectory = path.resolve(rootDirectory, config.trickRootDirectory)
      for (const targetName of targetNames) {
        const target: Target = getTargetFromConfig(config, targetName)
        const passphrase: string = getPassphrase(config, targetName)
        const srcFilePaths: string[] = target.files

        fsExtra.ensureDir(trickRootDirectory)
        encryptFiles(srcFilePaths, trickRootDirectory, passphrase, config.encryption.iterationCount)
      }
    })
  })

program
  .command('decrypt')
  .description('Decrypt the credential files.')
  .argument('[targetNames...]', 'The names of the targets')
  .action(function (targetNames: string[]): void {
    updateConfig((config) => {
      if (targetNames.length === 0) {
        targetNames.push(...config.defaultTargetNames)
      }

      const rootDirectory = getRootDirectory()
      const trickRootDirectory = path.resolve(rootDirectory, config.trickRootDirectory)
      for (const targetName of targetNames) {
        const target: Target = getTargetFromConfig(config, targetName)
        const passphrase: string = getPassphrase(config, targetName)
        const srcFilePaths: string[] = target.files

        fsExtra.ensureDir(trickRootDirectory)
        decryptFiles(srcFilePaths, trickRootDirectory, passphrase, config.encryption.iterationCount)
      }
    })
  })

program
  .command('add-default')
  .description('Add default target names.')
  .argument('[targetNames...]', 'The names of targets to add')
  .action(function (targetName: string): void {
    updateConfig((config) => {
      if (config.defaultTargetNames.includes(targetName)) {
        return false
      } else {
        config.defaultTargetNames.push(targetName)
        return true
      }
    })
  })

program
  .command('get-defaults')
  .description('Get the default target name.')
  .action(function (): void {
    updateConfig((config) => {
      for (const targetName of config.defaultTargetNames) {
        console.log(colorTargetName(targetName))
      }
    })
  })

program
  .command('list')
  .description('Display a list of targets.')
  .action(function (): void {
    updateConfig((config) => {
      for (const [targetName, target] of Object.entries(config.targets)) {
        console.log(colorTargetName(targetName))
        for (const file of target.files) {
          console.log('    ' + colorFilePath(file))
        }
      }
    })
  })

program
  .command('set-passphrase')
  .description('Set passphrase for a target.')
  .argument('<target>', 'The name of the target to set passphrase for')
  .action(function (targetName: string): void {
    updateConfig((config) => {
      const passphraseDirectory = getPassphraseDirectory(config)
      if (!fsExtra.existsSync(passphraseDirectory)) {
        fsExtra.ensureDirSync(passphraseDirectory)
        console.log(success(`Created passphrase directory: ${passphraseDirectory}`))
      }

      const passphraseFile = path.join(passphraseDirectory, targetName)
      if (!fsExtra.existsSync(passphraseFile)) {
        fsExtra.createFileSync(passphraseFile)
        fsExtra.chmodSync(passphraseFile, 0o600)
        console.log(success(`Created passphrase file: ${passphraseFile}`))
        console.log(success(`You have to edit the file to set the passphrase.`))
      }
    })
  })

try {
  program.parse()
} catch (err) {
  resolveError(err)
  process.exit(1)
}

process.on('uncaughtException', (err) => {
  resolveError(err)
  process.exit(1)
})

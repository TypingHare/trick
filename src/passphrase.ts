import { Config } from './config.js'
import fsExtra from 'fs-extra'
import { PassphraseFileNotFoundError } from './error.js'
import os from 'node:os'
import path from 'node:path'

/**
 * Gets the passphrase directory from the configuration.
 *
 * This function replaces any tilde (`~`) in the directory path with the user's home directory.
 *
 * @param config The configuration to use.
 * @return The resolved passphrase directory path.
 */
export function getPassphraseDirectory(config: Config): string {
  return config.passphraseDirectory.replaceAll(/~/g, os.homedir())
}

/**
 * Retrieves the passphrase from the passphrase file.
 *
 * The passphrase file is located in the directory specified by `config.passphraseDirectory`
 * and is named after the `targetName`.
 *
 * @param config The configuration to use.
 * @param targetName The name of the target.
 * @return The passphrase associated with the target name.
 */
export function getPassphrase(config: Config, targetName: string): string {
  const passphraseFilePath = path.join(getPassphraseDirectory(config), targetName)

  if (!fsExtra.existsSync(passphraseFilePath)) {
    throw new PassphraseFileNotFoundError(passphraseFilePath)
  }

  return fsExtra.readFileSync(passphraseFilePath, 'utf-8').trim()
}

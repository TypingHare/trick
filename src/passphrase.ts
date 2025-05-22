import { Config } from './config.js'
import fsExtra from 'fs-extra'
import {
    PassphraseFileNotFoundError,
    PassphraseNotFoundError,
} from './error.js'
import os from 'node:os'

/**
 * Retrieves the passphrase from the passphrase file.
 *
 * First, gets the passphrase object from the passphrase file path specified in
 * the configuration object. Second, gets and returns the passphrase associated
 * with the given target name.
 *
 * @param config The configuration to use.
 * @param targetName The name of the target.
 * @return The passphrase associated with the target name.
 */
export function getPassphrase(config: Config, targetName: string): string {
    const passphraseFilePath = config.passphrase_file_path.replaceAll(
        /~/g,
        os.homedir()
    )
    if (!fsExtra.existsSync(passphraseFilePath)) {
        throw new PassphraseFileNotFoundError(passphraseFilePath)
    }

    const passphraseObject = fsExtra.readJsonSync(passphraseFilePath) as {
        [name: string]: string
    }
    const passphrase = passphraseObject[targetName] || null

    if (passphrase === null) {
        throw new PassphraseNotFoundError(passphraseFilePath, targetName)
    }

    return passphrase
}

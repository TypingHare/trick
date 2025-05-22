import fsExtra from 'fs-extra'
import {
    ReadConfigError,
    TargetNotFoundError,
    WriteConfigError,
} from './error.js'

/**
 * The name of the configuration file to look for in the root directory.
 */
export const CONFIG_FILE_NAME: string = 'trick.config.json'

/**
 * Config type.
 *
 * @property targets Mapping from target names to target objects.
 * @property default_target_name The name of the default target.
 * @property root_directory The root directory.
 * @property passphrase_file_path The path to the passphrase file.
 * @property encryption Encryption configuration.
 */
export interface Config {
    targets: { [name: string]: Target }
    default_target_name: string | null
    root_directory: string
    passphrase_file_path: string
    encryption: Encryption
}

/**
 * Target type.
 *
 * @property files A list of files to encrypt/decrypt.
 */
export interface Target {
    files: string[]
}

/**
 * Encryption configuration.
 *
 * @property iteration_count The number of iteration.
 */
export interface Encryption {
    iteration_count: number
}

/**
 * Default configuration.
 */
const DEFAULT_CONFIG: Config = {
    targets: {},
    default_target_name: null,
    root_directory: '.trick',
    passphrase_file_path: '~/.config/trick_passphrase.json',
    encryption: {
        iteration_count: 100_000,
    },
}

/**
 * Writes a configuration object to the configuration file.
 *
 * @param config The configuration to write.
 * @throws {WriteConfigError} If error occurs when writing to the configuration
 *         file.
 */
export async function writeConfig(config: Config): Promise<void> {
    try {
        await fsExtra.writeFile(
            CONFIG_FILE_NAME,
            JSON.stringify(config, null, 2)
        )
    } catch (err) {
        throw new WriteConfigError(err)
    }
}

/**
 * Retrieves the configuration object from the configuration file.
 *
 * @return The configuration object retrieved from the configuration object;
 *         null if the configuration file doesn't exist.
 * @throws {ReadConfigError} If error occurs when reading the configuration
 *         file.
 */
export async function readConfig(): Promise<Config | null> {
    if (!fsExtra.existsSync(CONFIG_FILE_NAME)) {
        return null
    }

    try {
        return (await fsExtra.readJSON(CONFIG_FILE_NAME)) as Config
    } catch (err) {
        throw new ReadConfigError(err)
    }
}

/**
 * Updates the configuration object.
 *
 * This function first retrieves the configuration object fromthe configuration
 * file. If the configuration file doesn't exist, the default configuration will
 * be used instead.
 *
 * Then it calls the callback function by passing on the configuration object.
 * If the callback function returns `true`, then the object will be written to
 * the configuration file.
 *
 * @param callback The callback function taking the configuraition object
 *                 retrieved from the configuration file.
 * @see DEFAULT_CONFIG
 */
export async function updateConfig(
    callback: (Config: Config) => boolean | void
): Promise<void> {
    const config: Config = (await readConfig()) || DEFAULT_CONFIG
    if (callback(config)) {
        await writeConfig(config)
    }
}

/**
 * Gets a target object from a specified configuration object.
 *
 * @param config The configuration object to get the target from.
 * @param targetName The name of the target to get.
 * @return The target object associated with the given name.
 * @throws {TargetNotFoundError} If the target object is not found.
 */
export function getTargetFromConfig(
    config: Config,
    targetName: string
): Target {
    const target = config.targets[targetName]
    if (!target) {
        throw new TargetNotFoundError(targetName)
    }

    return target
}

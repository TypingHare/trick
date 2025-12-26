import fsExtra from 'fs-extra'
import {
  ReadConfigError,
  TargetNotFoundError,
  WriteConfigError,
  RootDirectoryNotFoundError,
} from './error.js'
import { join, resolve } from 'path'

/**
 * The name of the configuration file to look for in the root directory.
 */
export const CONFIG_FILE_NAME: string = 'trick.config.json'

/**
 * A list of root markers.
 */
export const ROOT_MARKERS: string[] = ['.git', CONFIG_FILE_NAME]

/**
 * Represents Trick configuration type.
 *
 * @property targets Mapping from target names to target objects.
 * @property trickRootDirectory The name of the Trick root directory under the project root.
 * @property passphraseDirectory The path to the passphrase directory.
 * @property defaultTargetNames A list of default target names. If no target name is specified
 *   when running Trick commands, these target names will be used.
 * @property encryption Encryption configuration.
 */
export interface Config {
  targets: { [name: string]: Target }
  trickRootDirectory: string
  passphraseDirectory: string
  defaultTargetNames: string[]
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
 * @property iterationCount The number of iteration.
 */
export interface Encryption {
  iterationCount: number
}

/**
 * Default configuration.
 */
const DEFAULT_CONFIG: Config = {
  targets: {},
  trickRootDirectory: '.trick',
  passphraseDirectory: '~/.config/trick/passphrases',
  defaultTargetNames: [],
  encryption: {
    iterationCount: 100_000,
  },
}

/**
 * Recursively searches for the root directory of a project based on specified root markers.
 *
 * @param directory - The current directory to check. Defaults to the current working directory.
 * @returns The path to the root directory.
 * @throws {RootDirectoryNotFoundError} If the root directory cannot be found.
 */
export function getRootDirectory(directory: string | null = null): string {
  if (!directory) {
    return getRootDirectory(process.cwd())
  }

  if (directory === '/') {
    throw new RootDirectoryNotFoundError()
  }

  for (const marker of ROOT_MARKERS) {
    if (fsExtra.existsSync(join(directory, marker))) {
      return directory
    }
  }

  return getRootDirectory(resolve(join(directory, '..')))
}

/**
 * Gets the full path to the configuration file based on the root directory.
 *
 * @return The full path to the configuration file.
 * @throws {RootDirectoryNotFoundError} If the root directory cannot be found.
 */
export function getConfigFilePath(): string {
  return resolve(getRootDirectory() + '/' + CONFIG_FILE_NAME)
}

/**
 * Writes a configuration object to the configuration file.
 *
 * @param config The configuration to write.
 * @param createInRoot Whether to create the configuration file in the root directory if it
 *   doesn't exist. Defaults to false.
 * @throws {WriteConfigError} If error occurs when writing to the configuration file.
 */
export function writeConfig(config: Config, createInRoot: boolean = true): void {
  try {
    if (createInRoot) {
      const configFilePath = join(getRootDirectory(), CONFIG_FILE_NAME)
      fsExtra.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
    } else {
      // Always create in the current working directory
      const configFilePath = join(process.cwd(), CONFIG_FILE_NAME)
      fsExtra.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
    }
  } catch (err) {
    throw new WriteConfigError(err)
  }
}

/**
 * Retrieves the configuration object from the configuration file.
 *
 * @return The configuration object retrieved from the configuration object; null if the
 *   configuration file doesn't exist.
 * @throws {ReadConfigError} If error occurs when reading the configuration file.
 */
export function readConfig(): Config | null {
  const configFilePath = getConfigFilePath()
  if (!fsExtra.existsSync(configFilePath)) {
    return null
  }

  try {
    return fsExtra.readJSONSync(configFilePath) as Config
  } catch (err) {
    throw new ReadConfigError(err)
  }
}

/**
 * Updates the configuration object.
 *
 * This function first retrieves the configuration object fromthe configuration file. If the
 * configuration file doesn't exist, the default configuration will be used instead.
 *
 * Then it calls the callback function by passing on the configuration object. If the callback
 * function returns `true`, then the object will be written to the configuration file.
 *
 * @param callback The callback function taking the configuraition object retrieved from the
 *   configuration file.
 *
 * @see DEFAULT_CONFIG
 */
export function updateConfig(
  callback: (Config: Config) => boolean | void,
  createInRoot: boolean = true
): void {
  const config: Config = readConfig() || DEFAULT_CONFIG
  Boolean(callback(config)) && writeConfig(config, createInRoot)
}

/**
 * Gets a target object from a specified configuration object.
 *
 * @param config The configuration object to get the target from.
 * @param targetName The name of the target to get.
 * @return The target object associated with the given name.
 * @throws {TargetNotFoundError} If the target object is not found.
 */
export function getTargetFromConfig(config: Config, targetName: string): Target {
  const target = config.targets[targetName]
  if (!target) {
    throw new TargetNotFoundError(targetName)
  }

  return target
}

import fsExtra from 'fs-extra'

export const CONFIG_FILE_NAME: string = 'trick.config.json'

export interface Config {
    iteration_count: number
    targets: Target[]
}

export interface Target {
    secret_name: string
    files: string[]
}

const defaultConfig: Config = {
    iteration_count: 114514,
    targets: [],
}

export class WriteConfigError extends Error {}

export class ReadConfigError extends Error {}

export async function writeConfig(config: Config): Promise<void> {
    try {
        await fsExtra.writeJson(CONFIG_FILE_NAME, config)
    } catch (err) {
        throw new WriteConfigError()
    }
}

export async function readConfig(): Promise<Config | null> {
    if (!fsExtra.existsSync(CONFIG_FILE_NAME)) {
        return null
    }

    try {
        return (await fsExtra.readJSON(CONFIG_FILE_NAME)) as Config
    } catch (err) {
        throw new ReadConfigError()
    }
}

export async function updateConfig(
    callback: UpdateConfigCallback
): Promise<void> {
    const config: Config = (await readConfig()) || defaultConfig
    if (callback(config)) {
        await writeConfig(config)
    }
}

export type UpdateConfigCallback = (config: Config) => boolean

export class TargetNotFoundError extends Error {
    public constructor(public readonly secretName: string) {
        super(`Target not found: ${secretName}`)
    }
}

export function getTargetFromConfig(
    config: Config,
    secretName: string
): Target {
    const targets = config.targets
    for (const target of targets) {
        if (target.secret_name === secretName) {
            return target
        }
    }

    throw new TargetNotFoundError(secretName)
}

import fsExtra from 'fs-extra';
export const CONFIG_FILE_NAME = 'trick.config.json';
const defaultConfig = {
    iteration_count: 114514,
    targets: [],
};
export class WriteConfigError extends Error {
}
export class ReadConfigError extends Error {
}
export async function writeConfig(config) {
    try {
        await fsExtra.writeJson(CONFIG_FILE_NAME, config);
    }
    catch (err) {
        throw new WriteConfigError();
    }
}
export async function readConfig() {
    if (!fsExtra.existsSync(CONFIG_FILE_NAME)) {
        return null;
    }
    try {
        return (await fsExtra.readJSON(CONFIG_FILE_NAME));
    }
    catch (err) {
        throw new ReadConfigError();
    }
}
export async function updateConfig(callback) {
    const config = (await readConfig()) || defaultConfig;
    if (callback(config)) {
        await writeConfig(config);
    }
}
export class TargetNotFoundError extends Error {
    secretName;
    constructor(secretName) {
        super(`Target not found: ${secretName}`);
        this.secretName = secretName;
    }
}
export function getTargetFromConfig(config, secretName) {
    const targets = config.targets;
    for (const target of targets) {
        if (target.secret_name === secretName) {
            return target;
        }
    }
    throw new TargetNotFoundError(secretName);
}

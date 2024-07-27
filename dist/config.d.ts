export declare const CONFIG_FILE_NAME: string;
export interface Config {
    iteration_count: number;
    targets: Target[];
}
export interface Target {
    secret_name: string;
    files: string[];
}
export declare class WriteConfigError extends Error {
}
export declare class ReadConfigError extends Error {
}
export declare function writeConfig(config: Config): Promise<void>;
export declare function readConfig(): Promise<Config | null>;
export declare function updateConfig(callback: UpdateConfigCallback): Promise<void>;
export type UpdateConfigCallback = (config: Config) => boolean;
export declare class TargetNotFoundError extends Error {
    readonly secretName: string;
    constructor(secretName: string);
}
export declare function getTargetFromConfig(config: Config, secretName: string): Target;

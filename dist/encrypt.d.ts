export declare class FailToEncryptFileError extends Error {
    readonly srcFilePath: string;
    constructor(srcFilePath: string);
}
export declare class FailToDecryptFileError extends Error {
    readonly destFilePath: string;
    constructor(destFilePath: string);
}
export declare function encryptFile(srcFilePath: string, destFilePath: string, secret: string, iteration_count: number): Promise<void>;
export declare function decryptFile(srcFilePath: string, destFilePath: string, secret: string, iteration_count: number): Promise<void>;
export declare function encryptFiles(srcFilePaths: string[], destDir: string, secret: string, iteration_count: number): Promise<void>;
export declare function decryptFiles(srcFilePaths: string[], destDir: string, secret: string, iteration_count: number): Promise<void>;

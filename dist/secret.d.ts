export declare class SecretNotFoundError extends Error {
    readonly secretName: string;
    constructor(secretName: string);
}
export declare function getSecret(secretName: string): string;

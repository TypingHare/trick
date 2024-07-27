export class SecretNotFoundError extends Error {
    secretName;
    constructor(secretName) {
        super(`Secret ${secretName} is not presented in the environment`);
        this.secretName = secretName;
    }
}
export function getSecret(secretName) {
    const secret = process.env[secretName];
    if (secret === undefined) {
        throw new SecretNotFoundError(secretName);
    }
    return secret;
}

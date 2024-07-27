export class SecretNotFoundError extends Error {
    public constructor(public readonly secretName: string) {
        super(`Secret ${secretName} is not presented in the environment`)
    }
}

export function getSecret(secretName: string): string {
    const secret = process.env[secretName]
    if (secret === undefined) {
        throw new SecretNotFoundError(secretName)
    }

    return secret
}

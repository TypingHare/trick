import {execa} from 'execa'
import * as path from 'node:path'
import fsExtra from 'fs-extra'

export class FailToEncryptFileError extends Error {
    public constructor(public readonly srcFilePath: string, public readonly opensslErrMessage?: string) {
        super(`Fail to encrypt source file: ${srcFilePath}`)
    }
}

export class FailToDecryptFileError extends Error {
    public constructor(public readonly destFilePath: string, public readonly opensslErrMessage?: string) {
        super(`Fail to decrypt destination file: ${destFilePath}`)
    }
}

export async function encryptFile(
    srcFilePath: string,
    destFilePath: string,
    secret: string,
    iteration_count: number
): Promise<void> {
    if (!(await fsExtra.pathExists(srcFilePath))) {
        throw new FailToEncryptFileError(srcFilePath)
    }

    const command: string = [
        'openssl',
        'enc',
        '-aes-256-cbc',
        '-salt',
        '-pbkdf2',
        '-iter',
        iteration_count,
        '-in',
        srcFilePath,
        '-out',
        destFilePath,
        '-pass',
        `pass:${secret}`,
    ].join(' ')

    await fsExtra.ensureDir(path.dirname(destFilePath))

    try {
        await execa(`${command}`, {shell: true})
    } catch (err) {
        if (typeof err == 'object' && err && Object.hasOwn(err, 'stderr')) {
            throw new FailToEncryptFileError(srcFilePath, (err as { stderr: string }).stderr)
        } else {
            throw new FailToDecryptFileError(srcFilePath, "Unknown error when encrypting the file.")
        }
    }
}

export async function decryptFile(
    srcFilePath: string,
    destFilePath: string,
    secret: string,
    iteration_count: number
): Promise<void> {
    if (!(await fsExtra.pathExists(destFilePath))) {
        throw new FailToDecryptFileError(destFilePath)
    }

    const command: string = [
        'openssl',
        'enc',
        '-d',
        '-aes-256-cbc',
        '-salt',
        '-pbkdf2',
        '-iter',
        iteration_count,
        '-in',
        destFilePath,
        '-out',
        srcFilePath,
        '-pass',
        `pass:${secret}`,
    ].join(' ')

    await fsExtra.ensureDir(path.dirname(srcFilePath))

    try {
        await execa(`${command}`, {shell: true})
    } catch (err) {
        if (typeof err == 'object' && err && Object.hasOwn(err, 'stderr')) {
            throw new FailToDecryptFileError(srcFilePath, (err as { stderr: string })['stderr'])
        } else {
            throw new FailToDecryptFileError(srcFilePath, "Unknown error when decrypting the file.")
        }
    }
}

export async function encryptFiles(
    srcFilePaths: string[],
    destDir: string,
    secret: string,
    iteration_count: number
): Promise<void> {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath: string = path.join(destDir, srcFilePath)
        await encryptFile(srcFilePath, destFilePath, secret, iteration_count)
        console.log(`[ENCRYPTED] ${srcFilePath} -> ${destFilePath}`)
    }
}

export async function decryptFiles(
    srcFilePaths: string[],
    destDir: string,
    secret: string,
    iteration_count: number
): Promise<void> {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath: string = path.join(destDir, srcFilePath)
        await decryptFile(srcFilePath, destFilePath, secret, iteration_count)
        console.log(`[DECRYPTED] ${destFilePath} -> ${srcFilePath}`)
    }
}

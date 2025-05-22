import { execa } from 'execa'
import * as path from 'node:path'
import fsExtra from 'fs-extra'
import { FailToDecryptFileError, FailToEncryptFileError } from './error.js'

/**
 * Encrypts a file using OpenSSL with AES-256-CBC and PBKDF2 key derivation.
 *
 * This function checks whether the source file exists, constructs an OpenSSL
 * command, ensures the destination directory exists, and then executes the
 * encryption command.
 *
 * @param srcFilePath The path to the source file that needs to be encrypted.
 * @param destFilePath The path where the encrypted file will be saved.
 * @param passphrase The passphrase used for encryption.
 * @param iteration_count The number of iterations to use for PBKDF2.
 * @returns Resolves when the file is successfully encrypted.
 * @throws {FailToEncryptFileError} If the source file does not exist or if
 *         OpenSSL returns an error during encryption.
 * @throws {FailToDecryptFileError} If an unknown error occurs during
 *         encryption.
 */
export async function encryptFile(
    srcFilePath: string,
    destFilePath: string,
    passphrase: string,
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
        `'pass:${passphrase}'`,
    ].join(' ')

    await fsExtra.ensureDir(path.dirname(destFilePath))

    try {
        await execa(`${command}`, { shell: true })
    } catch (err) {
        if (typeof err == 'object' && err && Object.hasOwn(err, 'stderr')) {
            const error = err as { stderr: string }
            throw new FailToEncryptFileError(srcFilePath, error.stderr)
        } else {
            throw new FailToDecryptFileError(
                srcFilePath,
                'Unknown error when encrypting the file.'
            )
        }
    }
}

/**
 * Decrypts a file using OpenSSL with AES-256-CBC and PBKDF2 key derivation.
 *
 * This function checks whether the encrypted file exists, constructs an OpenSSL
 * decryption command, ensures the destination directory exists, and then
 * executes the decryption command.
 *
 * @param srcFilePath The path where the decrypted file will be saved.
 * @param destFilePath The path to the encrypted source file.
 * @param passphrase The passphrase used for decryption.
 * @param iteration_count The number of iterations used for PBKDF2.
 * @returns Resolves when the file is successfully decrypted.
 * @throws {FailToDecryptFileError} If the encrypted file does not exist or if
 *         OpenSSL returns an error during decryption.
 * @throws {FailToDecryptFileError} If an unknown error occurs during
 *         decryption.
 */
export async function decryptFile(
    srcFilePath: string,
    destFilePath: string,
    passphrase: string,
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
        `'pass:${passphrase}'`,
    ].join(' ')

    await fsExtra.ensureDir(path.dirname(srcFilePath))

    try {
        await execa(`${command}`, { shell: true })
    } catch (err) {
        if (typeof err == 'object' && err && Object.hasOwn(err, 'stderr')) {
            const error = err as { stderr: string }
            throw new FailToDecryptFileError(srcFilePath, error.stderr)
        } else {
            throw new FailToDecryptFileError(
                srcFilePath,
                'Unknown error when decrypting the file.'
            )
        }
    }
}

/**
 * Encrypts multiple files using OpenSSL with AES-256-CBC and PBKDF2 key
 * derivation.
 *
 * For each source file path provided, this function constructs the destination
 * file path by appending `.enc`, then calls `encryptFile` and logs the
 * operation.
 *
 * @param srcFilePaths An array of file paths to be encrypted.
 * @param destDir The directory where the encrypted files will be saved.
 * @param passphrase The passphrase used for encryption.
 * @param iteration_count The number of iterations to use for PBKDF2.
 * @returns Resolves when all files are successfully encrypted.
 * @throws {FailToEncryptFileError} If any file fails to encrypt.
 */
export async function encryptFiles(
    srcFilePaths: string[],
    destDir: string,
    passphrase: string,
    iteration_count: number
): Promise<void> {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath: string = path.join(destDir, srcFilePath + '.enc')
        await encryptFile(
            srcFilePath,
            destFilePath,
            passphrase,
            iteration_count
        )
        console.log(`[ENCRYPTED] ${srcFilePath} -> ${destFilePath}`)
    }
}

/**
 * Decrypts multiple files using OpenSSL with AES-256-CBC and PBKDF2 key
 * derivation.
 *
 * For each source file path provided, this function assumes the corresponding
 * encrypted file has the `.enc` extension and calls `decryptFile`, logging the
 * operation.
 *
 * @param srcFilePaths An array of original file paths that were encrypted.
 * @param destDir The directory containing the encrypted files.
 * @param passphrase The passphrase used for decryption.
 * @param iteration_count The number of iterations used for PBKDF2.
 * @returns Resolves when all files are successfully decrypted.
 * @throws {FailToDecryptFileError} If any file fails to decrypt.
 */
export async function decryptFiles(
    srcFilePaths: string[],
    destDir: string,
    passphrase: string,
    iteration_count: number
): Promise<void> {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath: string = path.join(destDir, srcFilePath + '.enc')
        await decryptFile(
            srcFilePath,
            destFilePath,
            passphrase,
            iteration_count
        )
        console.log(`[DECRYPTED] ${destFilePath} -> ${srcFilePath}`)
    }
}

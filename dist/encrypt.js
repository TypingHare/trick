import { execa } from 'execa';
import * as path from 'node:path';
import fsExtra from 'fs-extra';
export class FailToEncryptFileError extends Error {
    srcFilePath;
    constructor(srcFilePath) {
        super(`Fail to encrypt source file: ${srcFilePath}`);
        this.srcFilePath = srcFilePath;
    }
}
export class FailToDecryptFileError extends Error {
    destFilePath;
    constructor(destFilePath) {
        super(`Fail to decrypt destination file: ${destFilePath}`);
        this.destFilePath = destFilePath;
    }
}
export async function encryptFile(srcFilePath, destFilePath, secret, iteration_count) {
    if (!(await fsExtra.pathExists(srcFilePath))) {
        throw new FailToEncryptFileError(srcFilePath);
    }
    const command = [
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
    ].join(' ');
    await fsExtra.ensureDir(path.dirname(destFilePath));
    try {
        await execa(`${command}`, { shell: true });
    }
    catch (err) {
        throw new FailToEncryptFileError(srcFilePath);
    }
}
export async function decryptFile(srcFilePath, destFilePath, secret, iteration_count) {
    if (!(await fsExtra.pathExists(destFilePath))) {
        throw new FailToDecryptFileError(destFilePath);
    }
    const command = [
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
    ].join(' ');
    await fsExtra.ensureDir(path.dirname(srcFilePath));
    try {
        await execa(`${command}`, { shell: true });
    }
    catch (err) {
        throw new FailToDecryptFileError(destFilePath);
    }
}
export async function encryptFiles(srcFilePaths, destDir, secret, iteration_count) {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath = path.join(destDir, srcFilePath);
        await encryptFile(srcFilePath, destFilePath, secret, iteration_count);
        console.log(`[ENCRYPTED] ${srcFilePath} -> ${destFilePath}`);
    }
}
export async function decryptFiles(srcFilePaths, destDir, secret, iteration_count) {
    for (const srcFilePath of srcFilePaths) {
        const destFilePath = path.join(destDir, srcFilePath);
        await decryptFile(srcFilePath, destFilePath, secret, iteration_count);
        console.log(`[DECRYPTED] ${destFilePath} -> ${srcFilePath}`);
    }
}

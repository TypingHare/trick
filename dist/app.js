import { Command } from 'commander';
import { getTargetFromConfig, updateConfig } from './config.js';
import { decryptFiles, encryptFiles } from './encrypt.js';
import { getSecret } from './secret.js';
import { TRICK_ENCRYPTED_DIR } from './constant.js';
import fsExtra from 'fs-extra';
import { resolve_error } from './utility.js';
const program = new Command();
program.version('Trick v1.0.0 \nby James Chen (jameschan312.cn@gmail.com)');
program.description('Save credential files to remote safely.');
program
    .command('add')
    .description('Adds a target.')
    .argument('<secret-name>', 'The name of secret in the environment')
    .argument('[files...]', 'Files this target will encrypt')
    .action(async (secretName, files) => {
    await updateConfig((config) => {
        try {
            getTargetFromConfig(config, secretName);
        }
        catch (err) {
            config.targets.push({
                secret_name: secretName,
                files,
            });
            return true;
        }
        console.error(`Target with the secret name already exists: ${secretName}`);
        console.error('Abort adding target');
        process.exit(1);
    });
});
program
    .command('encrypt')
    .description('Encrypt the credential files.')
    .argument('<secret-name>', 'The name of secret in the environment')
    .action(async (secretName) => {
    await updateConfig((config) => {
        const target = getTargetFromConfig(config, secretName);
        const secret = getSecret(target.secret_name);
        const srcFilePaths = target.files;
        fsExtra.ensureDir(TRICK_ENCRYPTED_DIR);
        encryptFiles(srcFilePaths, TRICK_ENCRYPTED_DIR, secret, config.iteration_count);
        return false;
    });
});
program
    .command('decrypt')
    .description('Decrypt the credential files.')
    .argument('<secret-name>', 'The name of secret in the environment')
    .action(async (secretName) => {
    await updateConfig((config) => {
        const target = getTargetFromConfig(config, secretName);
        const secret = getSecret(target.secret_name);
        const srcFilePaths = target.files;
        fsExtra.ensureDir(TRICK_ENCRYPTED_DIR);
        decryptFiles(srcFilePaths, TRICK_ENCRYPTED_DIR, secret, config.iteration_count);
        return false;
    });
});
program.parse();
process.on('uncaughtException', (err) => {
    resolve_error(err);
    process.exit(1);
});

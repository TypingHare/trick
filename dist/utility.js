import { ReadConfigError, TargetNotFoundError, WriteConfigError, } from './config.js';
import { FailToDecryptFileError, FailToEncryptFileError } from './encrypt.js';
import chalk from 'chalk';
export function resolve_error(err) {
    if (!(err instanceof Error)) {
        console.error(`Unknown error: ${err}`);
        process.exit(2);
    }
    if (err instanceof WriteConfigError) {
        console.error(chalk.red('Fail to write Trick config file'));
    }
    else if (err instanceof ReadConfigError) {
        console.error(chalk.red('Fail to read Trick config file'));
    }
    else if (err instanceof TargetNotFoundError) {
        console.error(chalk.red(err.message));
    }
    else if (err instanceof FailToEncryptFileError) {
        console.error(chalk.red(err.message));
        console.error(chalk.yellow('Make sure the file exists and you have enough permission to access'));
    }
    else if (err instanceof FailToDecryptFileError) {
        console.error(chalk.red(err.message));
        console.error(chalk.yellow('Make sure the file exists and you have enough permission to access'));
    }
    process.exit(1);
}

import { ReadConfigError, TargetNotFoundError, WriteConfigError, } from './config.js';
import { FailToDecryptFileError, FailToEncryptFileError } from './encrypt.js';
function resolve(err) {
    if (!(err instanceof Error)) {
        console.error(`Unknown error: ${err}`);
        process.exit(2);
    }
    if (err instanceof WriteConfigError) {
    }
    else if (err instanceof ReadConfigError) {
    }
    else if (err instanceof TargetNotFoundError) {
    }
    else if (err instanceof FailToEncryptFileError) {
    }
    else if (err instanceof FailToDecryptFileError) {
    }
    process.exit(1);
}

# [Trick](https://github.com/typinghare/trick)

# Install

```shell
# npm
npm install -g @typinghare/trick

# pnpm
pnpm add -g @typinghare/trick

# yarn
yarn add -g @typinghare/trick
```

## Philosophy

We often add sensitive and credential files, such as `.env` and `api_key.conf`, to `.gitignore`, preventing them from being committed or even pushed to remote depots for safety reasons. Then, we have to manually copy the file to the server. It would be effortless if we only had one file, but imagine we have a lot in a bigger project. Even worse, some careless people (me) have even lost these sensitive files after changing computers!

**Trick** helps you to encrypt sensitive files with a passphrase so that you can upload the credential file to Git platforms. Later on the server, just use the same passphrase to decrypt the files with ease.

## Quick Example

Set up the **target** with the files needed to be encrypted:

```bash
# This will create a trick.config.json in the current working directory
# trick add <target> [files...]
$ trick add MyTargetName .env api_key.conf

# Display the list of target names and the files bound
$ trick list
```

Create a `passphrase.json` file under `~/.config` with the following content:

```json
{
    "MyTargetName": "Reg5eGPXWdmeW0i08uaygBlfbXP+tJlnu7z551Qt568="
}
```

Here, the key is the target name, and the value is the `passphrase` that is used to encrypt/decrypt the files associated with this target name.

Encrypt the files:

```bash
$ trick encrypt MyTargetName
```

You will see the following output:

```text
[ENCRYPTED] .env -> .trick/encrypted/.env.enc
[ENCRYPTED] api_key.conf -> .trick/encrypted/api_key.conf.enc
```

Encrypted files are all saved to `.trick`. On the server, set the the `passphrase.json` in the same way, and execute:

```bash
$ trick decrypt MyTargetName
```

And you will see that the files are restored:

```text
[DECRYPTED] .trick/encrypted/.env.enc -> .env
[DECRYPTED] .trick/encrypted/api_key.conf.enc -> api_key.conf
```

> [!IMPORTANT]
> The `passphrase.json` collects all the passphrases you have. Please back it up in multiple devices every time you edit it!

## More Features

### Default Target Name

You can set the default target name so that you don't need to input it every time:

```bash
# Set the default target name
$ trick set-default MyTargetName

# Display the default target name
$ trick get-default
```

Now you can encrypt and decrypt more easily:

```bash
$ trick encrypt
$ trick decrypt
```

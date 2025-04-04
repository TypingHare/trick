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

We often add sensitive files, such as `.env` and `api_key.conf`, to `.gitignore`, preventing them from being committed or even pushed to remote depots for safety reasons. Then, we have to manually copy the file to the server. It would be effortless if we only had one file, but imagine if we had more than one in a bigger project. Even worse, some careless people (me) have even lost their sensitive files after changing computers!

**Trick** helps you to encrypt sensitive files with a secret so that you can upload the file to Git platforms. Later on the server, just use the same secret to decrypt the files with ease.

## Quick Example

Set up the **secret name** and the files needed to be encrypted:

```bash
# This will create a trick.config.json at the first time
# trick add <secret-name> [files...]
$ trick add AN_EXAMPLE_SECRET .env api_key.conf

# Display the list of secret names and the files bound
$ trick list
```

Set up the `AN_EXAMPLE_SECRET` using `export` or put it in the login file:

```bash
$ export AN_EXAMPLE_SECRET="fQyX5O59MJuFD4l/tf2FYApqZY12N+UatEC6FC6mN7k="
# Alternatively, put the above command to login files like `.bashrc` and `.zshrc`
```

Encrypt the files:

```bash
$ trick encrypt AN_EXAMPLE_SECRET
```

You will see the following output:

```text
[ENCRYPTED] .env -> .trick/encrypted/.env.enc
[ENCRYPTED] api_key.conf -> .trick/encrypted/api_key.conf.enc
```

Encrypted files are all saved to `.trick`. On the server side, you can encrypt the files effortlessly:

```bash
$ export AN_EXAMPLE_SECRET="fQyX5O59MJuFD4l/tf2FYApqZY12N+UatEC6FC6mN7k="
$ trick decrypt AN_EXAMPLE_SECRET
```

And you will see that the files are restored:

```text
[DECRYPTED] .trick/encrypted/.env.enc -> .env
[DECRYPTED] .trick/encrypted/api_key.conf.enc -> api_key.conf
```

> [!IMPORTANT]
>
> You need to keep the secret to yourself! Make a copy on Cloud or write it down!

## More Features

### Default Secret Name

You can set the default secret name so that you don't need to input it every time:

```bash
# Set the default secret name
$ trick set-default AN_EXAMPLE_SECRET

# Display the default secret name
$ trick get-default
```

Now you can encrypt and decrypt more easily:

```bash
$ trick encrypt
$ trick decrypt
```


# [Trick](https://github.com/typinghare/trick)

**Trick** is a CLI tool that helps you **safely encrypt sensitive files** (such as `.env`, API keys, or credentials) so they can be stored in Git repositories and easily restored on other machines or servers.

It uses **OpenSSL (AES-256-CBC + PBKDF2)** under the hood and keeps encryption keys **outside your repository**.

## Features

* 🔐 Encrypt and decrypt sensitive files with strong encryption
* 🎯 Group files into **targets**
* 📦 Store encrypted files under a dedicated `.trick/` directory
* 🗝️ Keep passphrases outside your repo (per-target, permission-protected)
* 🔁 Works across machines and servers
* ⚙️ Fully configurable, project-aware

## Installation

```bash
# npm
npm install -g @typinghare/trick

# pnpm
pnpm add -g @typinghare/trick

# yarn
yarn add -g @typinghare/trick
```

> **Requirements**
>
> * Node.js ≥ 18
> * `openssl` available in your system PATH

## Philosophy

Sensitive files are usually added to `.gitignore` to avoid accidental leaks.
But that means:

* You must manually copy them to every new machine
* They’re easy to lose
* They don’t version well

**Trick encrypts those files**, allowing you to commit the encrypted versions safely, while keeping passphrases out of Git entirely.



## Getting Started

### 1. Initialize Trick

Run this inside your project:

```bash
trick init
```

This creates a `trick.config.json` in your project root.



### 2. Add Files to a Target

A **target** is a named group of files to encrypt together.

```bash
trick add MyTarget .env api_key.conf
```

List all targets:

```bash
trick list
```



### 3. Set a Passphrase for the Target

Each target has its **own passphrase file** stored locally (not in Git).

```bash
trick set-passphrase MyTarget
```

This creates a file at:

```
~/.config/trick/passphrases/MyTarget
```

* File permissions are set to `600`
* You must manually edit this file and paste your passphrase
* The file content is read as plain text (trimmed)

> ⚠️ **Important**
> Back up your passphrase files. Losing them means losing access to your encrypted data.



### 4. Encrypt Files

```bash
trick encrypt MyTarget
```

Encrypted files are written to:

```
.trick/<original-path>.enc
```

Example output:

```
🟩 Encrypted: .env -> .trick/.env.enc
🟩 Encrypted: api_key.conf -> .trick/api_key.conf.enc
```

You can now commit the `.trick/` directory safely.



### 5. Decrypt Files (on another machine or server)

1. Copy or recreate the passphrase file:

   ```
   ~/.config/trick/passphrases/MyTarget
   ```
2. Run:

   ```bash
   trick decrypt MyTarget
   ```

Files are restored to their original locations.



## Default Targets

You can mark targets as **default**, so you don’t need to specify them every time.

```bash
trick add-default MyTarget
```

List default targets:

```bash
trick list-defaults
```

Now you can simply run:

```bash
trick encrypt
trick decrypt
```



## Configuration

### `trick.config.json`

Example:

```json
{
  "targets": {
    "MyTarget": {
      "files": [".env", "api_key.conf"]
    }
  },
  "trickRootDirectory": ".trick",
  "passphraseDirectory": "~/.config/trick/passphrases",
  "defaultTargetNames": ["MyTarget"],
  "encryption": {
    "iterationCount": 100000
  }
}
```

### Key Fields

| Field                       | Description                           |
| ------------------------ | ------------------------------------- |
| `targets`                   | Mapping of target names to file lists |
| `trickRootDirectory`        | Where encrypted files are stored      |
| `passphraseDirectory`       | Where passphrase files live           |
| `defaultTargetNames`        | Targets used when none specified      |
| `encryption.iterationCount` | PBKDF2 iteration count                |



## Commands Overview

| Command                            | Description                |
| ---------------------------------- | -------------------------- |
| `trick init`                       | Initialize configuration   |
| `trick config`                     | Print current config       |
| `trick add <target> [files...]`    | Add files to a target      |
| `trick remove <target> [files...]` | Remove files from a target |
| `trick remove <target> --target`   | Remove a target            |
| `trick list`                       | List targets and files     |
| `trick set-passphrase <target>`    | Create passphrase file     |
| `trick encrypt [targets...]`       | Encrypt files              |
| `trick decrypt [targets...]`       | Decrypt files              |
| `trick add-default [targets...]`   | Add default targets        |
| `trick list-defaults`              | Show default targets       |

## Security Notes

* Encryption uses:

  * **AES-256-CBC**
  * **PBKDF2** with configurable iteration count
* Passphrases:

  * Never stored in Git
  * Stored as local files with strict permissions
* Losing passphrases = losing access to encrypted files

## License

MIT

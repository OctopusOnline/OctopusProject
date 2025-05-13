# OctopusProject

CLI tool for recursively listing directory contents with `.octopusignore`.

## Installation

```bash
npm install -g octopusproject
```

## Usage

```bash
octopusproject <command> [start_path] [output_file]
```

- `command`: `scan` (alias `s`) for scanning, `create` (alias `c`) for creating `.octopusignore`.
- `start_path`: Directory to scan (default: current directory).
- `output_file`: Output file (default: `<directory_name>.txt`).

Examples:
```bash
octopusproject scan . project.txt
octopusproject s --exclude "*.log,dist" -f
octopusproject create ignore
octopusproject c ignore -f
octopusproject -v
octopusproject scan -h
octopusproject create -h
```

## .octopusignore

Create `.octopusignore` files in any directory. Patterns are relative to the directory. Example:

```
.git/
node_modules/
project.js
package-lock.json
*.log
!important.log
```

## Features
- Lists directory structure in a tree-like format in the console.
- Writes file paths and contents (for non-binary files) to the output file, with overwrite prompt (default: yes) unless `-f/--force`.
- Ignores the output file during scanning.
- Marks binary files with `[binary]`.
- Supports multiple `.octopusignore` files with relative patterns.
- Command-line exclusion with `--exclude`.
- Creates a standard `.octopusignore` with `create ignore`, with overwrite prompt (default: no) unless `-f/--force`.
- Version and help options (`-v`, `-h`).

## Requirements
- Node.js >= 17.0.0

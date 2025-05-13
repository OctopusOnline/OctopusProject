import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { Command } from 'commander';
import { CommandInterface } from '../interfaces/commandInterface';
import { OctopusIgnore } from '../octopusIgnore';
import ignore, { Ignore } from 'ignore';

export class ScanCommand implements CommandInterface {
  register(program: Command): void {
    program
      .command('scan')
      .alias('s')
      .description('Scan the directory and generate output file')
      .arguments('[start_path] [output_file]')
      .option(
        '-e, --exclude <patterns>',
        'Comma-separated list of patterns to exclude',
        (value) => value.split(',')
      )
      .option('-f, --force', 'Force overwrite of output file without prompt')
      .helpOption('-h, --help', 'Display help for scan command')
      .action(
        async (
          startPath: string = process.cwd(),
          outputFile: string,
          cmdObj: { exclude?: string; force?: boolean }
        ) => {
          await this.execute(startPath, outputFile, cmdObj);
        }
      );
  }

  private async execute(
    startPath: string,
    outputFile: string,
    cmdObj: { exclude?: string; force?: boolean }
  ): Promise<void> {
    const resolvedOutputFile = path.resolve(
      outputFile || `${path.basename(path.resolve(startPath))}.txt`
    );
    const outputFileName = path.basename(resolvedOutputFile);

    if (!cmdObj.force) {
      try {
        await fs.access(resolvedOutputFile);
        const answer = await this.prompt(
          `Output file ${outputFileName} already exists. Overwrite? (Y/n): `
        );
        if (answer.toLowerCase() === 'n') {
          console.log('Operation cancelled.');
          return;
        }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw err;
        }
      }
      console.log('');
    }

    const ignoreFile = new OctopusIgnore(
      path.join(path.resolve(startPath), '.octopusignore')
    );
    const ig = ignore()
      .add(ignoreFile.patterns)
      .add(cmdObj.exclude?.split(',') || [])
      .add(outputFileName);

    const tree: string[] = [];
    const contents: string[] = [];
    tree.push(`${path.basename(path.resolve(startPath))}/`);

    await this.scanDir(path.resolve(startPath), '', ig, tree, contents);

    console.log(tree.join('\n'));
    console.log('');
    await fs.writeFile(resolvedOutputFile, contents.join('\n') + '\n');
    console.log(`Output: ${outputFileName}`);
  }

  private async scanDir(
    dir: string,
    prefix: string,
    ig: Ignore,
    tree: string[],
    contents: string[]
  ): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filteredEntries = entries
      .filter((entry) => {
        const relativePath = path
          .relative(this.startPath, path.join(dir, entry.name))
          .replace(/\\/g, '/');
        return !ig.ignores(relativePath);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < filteredEntries.length; i++) {
      const entry = filteredEntries[i];
      const fullPath = path.join(dir, entry.name);
      const isLastEntry = i === filteredEntries.length - 1;
      const entryPrefix = `${prefix}${isLastEntry ? '└──' : '├──'} `;
      const nextPrefix = `${prefix}${isLastEntry ? '    ' : '│   '}`;

      if (entry.isDirectory()) {
        tree.push(`${entryPrefix}${entry.name}/`);
        await this.scanDir(fullPath, nextPrefix, ig, tree, contents);
      } else {
        tree.push(`${entryPrefix}${entry.name}`);
        const relativePath = path
          .relative(this.startPath, fullPath)
          .replace(/\\/g, '/');
        contents.push(`//${'-'.repeat(50)} ${relativePath}`);
        const isBinary = await this.isBinaryFile(fullPath);
        contents.push(
          isBinary
            ? '//-------------------------------------------------- [binary]'
            : await fs.readFile(fullPath, 'utf8')
        );
      }
    }
  }

  private async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath, { encoding: null });
      for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
        if (buffer[i] === 0 || (buffer[i] >= 0x00 && buffer[i] <= 0x08)) {
          return true;
        }
      }
      return false;
    } catch {
      return true;
    }
  }

  private prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer || 'Y');
      });
    });
  }

  private readonly startPath: string = process.cwd();
}

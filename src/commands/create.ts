import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { Command } from 'commander';
import { CommandInterface } from '../interfaces/commandInterface';
import { OctopusIgnore } from '../octopusIgnore';

export class CreateCommand implements CommandInterface {
  register(program: Command): void {
    program
      .command('create')
      .alias('c')
      .description(
        'Create a standard .octopusignore file (use "ignore" as type)'
      )
      .argument('<type>', 'Type of file to create (must be "ignore")')
      .option('-f, --force', 'Force overwrite of .octopusignore without prompt')
      .helpOption('-h, --help', 'Display help for create command')
      .action(async (type: string, cmdObj: { force?: boolean }) => {
        if (type !== 'ignore') {
          console.log('Invalid type. Use "ignore".');
          return;
        }
        await this.createIgnoreFile(cmdObj.force || false);
      });
  }

  private async prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer || 'n');
      });
    });
  }

  private async createIgnoreFile(force: boolean) {
    const ignoreFilePath = path.join(process.cwd(), '.octopusignore');
    let defaultIgnoreContent: string;

    try {
      defaultIgnoreContent = OctopusIgnore.getDefault();
    } catch (err) {
      console.error('Error reading default.octopusignore:', err);
      return;
    }

    if (!force) {
      try {
        await fs.access(ignoreFilePath);
        const answer = await this.prompt(
          '.octopusignore already exists. Overwrite? (y/N): '
        );
        if (answer.toLowerCase() !== 'y') {
          console.log('Operation cancelled.');
          return;
        }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw err;
        }
      }
    }

    await fs.writeFile(ignoreFilePath, defaultIgnoreContent);
    console.log('.octopusignore created.');
  }
}

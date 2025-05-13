import { readFileSync } from 'fs';
import { join } from 'path';

export class OctopusIgnore {
  private readonly file: string;
  private ignorePatterns: string[] = [];

  static getDefault(): string {
    return readFileSync(
      join(__dirname, '../config/default.octopusignore'),
      'utf8'
    );
  }

  get patterns(): string[] {
    return this.ignorePatterns;
  }

  constructor(file: string) {
    this.file = file;
    this.load();
  }

  private load(): void {
    try {
      this.ignorePatterns = readFileSync(this.file, 'utf8')
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        this.ignorePatterns = [];
      } else {
        throw err;
      }
    }
  }
}

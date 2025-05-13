import { Command } from 'commander';
import { CommandInterface } from './interfaces/commandInterface';
import { ScanCommand } from './commands/scan';
import { CreateCommand } from './commands/create';

export const COMMANDS: CommandInterface[] = [
  new CreateCommand(),
  new ScanCommand(),
];

export class CommandRegistry {
  private readonly program: Command;
  private readonly commands: CommandInterface[];

  constructor(program: Command, commands: CommandInterface[] = COMMANDS) {
    this.program = program;
    this.commands = commands;
  }

  registerCommands(): void {
    for (const command of this.commands) command.register(this.program);
  }
}

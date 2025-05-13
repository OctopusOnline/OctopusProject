#!/usr/bin/env node

import { program } from 'commander';
import { CommandRegistry } from './commandRegistry';
import * as packageJson from '../package.json';

program
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .description(packageJson.description);

const commandRegistry = new CommandRegistry(program);
commandRegistry.registerCommands();

program.parse(process.argv);

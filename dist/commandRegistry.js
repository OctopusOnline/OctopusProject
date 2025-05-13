"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = exports.COMMANDS = void 0;
const scan_1 = require("./commands/scan");
const create_1 = require("./commands/create");
exports.COMMANDS = [
    new create_1.CreateCommand(),
    new scan_1.ScanCommand(),
];
class CommandRegistry {
    constructor(program, commands = exports.COMMANDS) {
        this.program = program;
        this.commands = commands;
    }
    registerCommands() {
        for (const command of this.commands)
            command.register(this.program);
    }
}
exports.CommandRegistry = CommandRegistry;

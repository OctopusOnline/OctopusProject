"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const octopusIgnore_1 = require("../octopusIgnore");
class CreateCommand {
    register(program) {
        program
            .command('create')
            .alias('c')
            .description('Create a standard .octopusignore file (use "ignore" as type)')
            .argument('<type>', 'Type of file to create (must be "ignore")')
            .option('-f, --force', 'Force overwrite of .octopusignore without prompt')
            .helpOption('-h, --help', 'Display help for create command')
            .action(async (type, cmdObj) => {
            if (type !== 'ignore') {
                console.log('Invalid type. Use "ignore".');
                return;
            }
            await this.createIgnoreFile(cmdObj.force || false);
        });
    }
    async prompt(question) {
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
    async createIgnoreFile(force) {
        const ignoreFilePath = path.join(process.cwd(), '.octopusignore');
        let defaultIgnoreContent;
        try {
            defaultIgnoreContent = octopusIgnore_1.OctopusIgnore.getDefault();
        }
        catch (err) {
            console.error('Error reading default.octopusignore:', err);
            return;
        }
        if (!force) {
            try {
                await fs.access(ignoreFilePath);
                const answer = await this.prompt('.octopusignore already exists. Overwrite? (y/N): ');
                if (answer.toLowerCase() !== 'y') {
                    console.log('Operation cancelled.');
                    return;
                }
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            }
        }
        await fs.writeFile(ignoreFilePath, defaultIgnoreContent);
        console.log('.octopusignore created.');
    }
}
exports.CreateCommand = CreateCommand;

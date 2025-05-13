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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanCommand = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const octopusIgnore_1 = require("../octopusIgnore");
const ignore_1 = __importDefault(require("ignore"));
class ScanCommand {
    constructor() {
        this.startPath = process.cwd();
    }
    register(program) {
        program
            .command('scan')
            .alias('s')
            .description('Scan the directory and generate output file')
            .arguments('[start_path] [output_file]')
            .option('-e, --exclude <patterns>', 'Comma-separated list of patterns to exclude', (value) => value.split(','))
            .option('-f, --force', 'Force overwrite of output file without prompt')
            .helpOption('-h, --help', 'Display help for scan command')
            .action(async (startPath = process.cwd(), outputFile, cmdObj) => {
            await this.execute(startPath, outputFile, cmdObj);
        });
    }
    async execute(startPath, outputFile, cmdObj) {
        const resolvedOutputFile = path.resolve(outputFile || `${path.basename(path.resolve(startPath))}.txt`);
        const outputFileName = path.basename(resolvedOutputFile);
        if (!cmdObj.force) {
            try {
                await fs.access(resolvedOutputFile);
                const answer = await this.prompt(`Output file ${outputFileName} already exists. Overwrite? (Y/n): `);
                if (answer.toLowerCase() === 'n') {
                    console.log('Operation cancelled.');
                    return;
                }
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            }
            console.log('');
        }
        const ignoreFile = new octopusIgnore_1.OctopusIgnore(path.join(path.resolve(startPath), '.octopusignore'));
        const ig = (0, ignore_1.default)()
            .add(ignoreFile.patterns)
            .add(cmdObj.exclude?.split(',') || [])
            .add(outputFileName);
        const tree = [];
        const contents = [];
        tree.push(`${path.basename(path.resolve(startPath))}/`);
        await this.scanDir(path.resolve(startPath), '', ig, tree, contents);
        console.log(tree.join('\n'));
        console.log('');
        await fs.writeFile(resolvedOutputFile, contents.join('\n') + '\n');
        console.log(`Output: ${outputFileName}`);
    }
    async scanDir(dir, prefix, ig, tree, contents) {
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
            }
            else {
                tree.push(`${entryPrefix}${entry.name}`);
                const relativePath = path
                    .relative(this.startPath, fullPath)
                    .replace(/\\/g, '/');
                contents.push(`//${'-'.repeat(50)} ${relativePath}`);
                const isBinary = await this.isBinaryFile(fullPath);
                contents.push(isBinary
                    ? '//-------------------------------------------------- [binary]'
                    : await fs.readFile(fullPath, 'utf8'));
            }
        }
    }
    async isBinaryFile(filePath) {
        try {
            const buffer = await fs.readFile(filePath, { encoding: null });
            for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
                if (buffer[i] === 0 || (buffer[i] >= 0x00 && buffer[i] <= 0x08)) {
                    return true;
                }
            }
            return false;
        }
        catch {
            return true;
        }
    }
    prompt(question) {
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
}
exports.ScanCommand = ScanCommand;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OctopusIgnore = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class OctopusIgnore {
    static getDefault() {
        return (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../config/default.octopusignore'), 'utf8');
    }
    get patterns() {
        return this.ignorePatterns;
    }
    constructor(file) {
        this.ignorePatterns = [];
        this.file = file;
        this.load();
    }
    load() {
        try {
            this.ignorePatterns = (0, fs_1.readFileSync)(this.file, 'utf8')
                .split('\n')
                .filter((line) => line.trim() && !line.startsWith('#'));
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                this.ignorePatterns = [];
            }
            else {
                throw err;
            }
        }
    }
}
exports.OctopusIgnore = OctopusIgnore;

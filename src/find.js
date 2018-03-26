"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
function findPackageJson() {
    let configPath = "./package.json";
    let i = 0;
    while (!fs.existsSync(configPath)) {
        i++;
        if (i > 10000) {
            throw new Error('can not find package.json!');
            break;
        }
        configPath = "../" + configPath;
    }
    return path.resolve(process.cwd(), configPath);
}
exports.default = findPackageJson;

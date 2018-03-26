#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const chalk_1 = require("chalk");
const program = require("commander");
const find_1 = require("./find");
const { npm, npmDev } = require("../install");
program
    .version("1.1.2")
    .option("-s, --save", "get typescript definitions and add to package.json as a dependency")
    .option("-d, --save-dev", "(default) get typescript definitions and add to package.json as a dev-dependency")
    .parse(process.argv);
if (program.saveDev) {
    action(npmDev).catch(console.log);
}
else if (program.save) {
    action(npm).catch(console.log);
}
else {
    action(npmDev).catch(console.log);
}
const blue = chalk_1.default.blue;
const yellow = chalk_1.default.yellow;
function action(install) {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = find_1.default();
        const packageJson = yield fs.readJSON(configPath);
        const dependencies = packageJson["dependencies"] || {};
        // const devDependencies = package["devDependencies"] || {};
        const pkgs = Object.keys(dependencies).filter((pkg) => !pkg.startsWith("@types/"));
        const types = pkgs.map((pkg) => `@types/${pkg}`);
        console.log(`
        ${blue("start to get")} ${yellow(types.length.toString())} ${blue("typescript definitions")} ...
    `);
        yield install(types);
    });
}

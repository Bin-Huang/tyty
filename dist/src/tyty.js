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
const pMap = require("p-map");
const chalk_1 = require("chalk");
const program = require("commander");
const find_1 = require("./find");
const isExist_1 = require("./isExist");
const ora = require("ora");
const install_1 = require("./install");
program
    .version("2.3.0")
    .option("-s, --save", "get typescript definitions and add to package.json as a dependency")
    .option("-d, --save-dev", "(default) get typescript definitions and add to package.json as a dev-dependency")
    .parse(process.argv);
if (program.saveDev) {
    action(install_1.npmDev, "devDependencies").catch(console.log);
}
else if (program.save) {
    action(install_1.npm, "dependencies").catch(console.log);
}
else {
    action(install_1.npmDev, "devDependencies").catch(console.log);
}
const blue = chalk_1.default.blueBright;
const yellow = chalk_1.default.yellow;
const green = chalk_1.default.green;
const red = chalk_1.default.red;
const gray = chalk_1.default.gray;
function action(install, as) {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = find_1.default();
        const packageJson = yield fs.readJSON(configPath);
        const dependencies = packageJson["dependencies"] || {};
        // const devDependencies = package["devDependencies"] || {};
        const pkgs = Object.keys(dependencies).filter((pkg) => !pkg.startsWith("@types/"));
        const types = pkgs.map((pkg) => `@types/${pkg}`);
        const spinner = ora({
            spinner: "moon",
        }).start();
        spinner.text = `${blue("start to get")} ${yellow(types.length.toString())} ${blue("typescript definitions")} ...`;
        const checkExistResults = yield pMap(types, (t) => isExist_1.default(t)
            .then((r) => {
            if (r) {
                spinner.text = gray(`succeed to find ${t} in npm registry`);
            }
            else {
                spinner.text = gray(`can not find ${t} in npm registry`);
            }
            return r;
        }), { concurrency: 10 });
        const existTypes = types.filter((t, ix) => checkExistResults[ix]);
        const unexistTypes = types.filter((t, ix) => !checkExistResults[ix]);
        spinner.text = `downloading ${types.length} typescript definitions ...`;
        yield install(existTypes);
        // console.log(`\n\n${blue("Result")}:\n`)
        getResults(unexistTypes, false, as).map((r) => spinner.fail(r));
        getResults(existTypes, true, as).map((r) => spinner.succeed(r));
        spinner.stop();
    });
}
function getResults(existTypes, isSucceed, saveAs) {
    const result = [];
    for (const t of existTypes) {
        let msg;
        if (isSucceed) {
            if (saveAs === "dependencies") {
                msg = "downloaded from npm and saved as dependency";
            }
            else if (saveAs === "devDependencies") {
                msg = "downloaded from npm and saved as devDependency";
            }
            else {
                msg = "downloaded from npm and saved";
            }
        }
        else {
            msg = "cannot find it in npm registry";
        }
        const nameColor = (isSucceed) ? green : red;
        result.push(`${nameColor(t)} --- ${gray(msg)}`);
    }
    return result;
}

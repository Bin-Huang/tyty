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
const getVersion_1 = require("./getVersion");
const ora = require("ora");
const install_1 = require("./install");
program
    .version("3.4.1")
    .option("-s, --save", "get typescript definitions and save as dependency")
    .option("-d, --save-dev", "(default) get typescript definitions and save as dev-dependency")
    .parse(process.argv);
if (program.saveDev) {
    tyty("devDependencies").catch(console.log);
}
else if (program.save) {
    tyty("dependencies").catch(console.log);
}
else {
    tyty("devDependencies").catch(console.log);
}
const blue = chalk_1.default.blueBright;
const yellow = chalk_1.default.yellow;
const green = chalk_1.default.green;
const red = chalk_1.default.red;
const gray = chalk_1.default.gray;
function tyty(saveAs) {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = find_1.default();
        const config = yield fs.readJSON(configPath);
        if (!config["dependencies"]) {
            config["dependencies"] = {};
        }
        if (!config["devDependencies"]) {
            config["devDependencies"] = {};
        }
        const allPkgs = Object.keys(config["dependencies"]).filter((pkg) => !pkg.startsWith("@types/"));
        const allTypes = allPkgs.map((pkg) => `@types/${pkg}`);
        const types = allTypes.filter((t) => !config[saveAs][t]);
        const spinner = ora({ spinner: "moon" }).start();
        spinner.text = `${blue("start to get")} ${yellow(allTypes.length.toString())} ${blue("typescript definitions")} ...`;
        if (types.length === 0) {
            spinner.succeed(`${green("All installed already")}`);
            spinner.stop();
            return;
        }
        const typeInfos = yield pMap(types, (t) => __awaiter(this, void 0, void 0, function* () {
            return getVersion_1.default(t).then((version) => {
                if (version) {
                    spinner.text = gray(`finded ${t} successfully in npm registry`);
                }
                else {
                    spinner.text = gray(`can not find ${t} in npm registry`);
                }
                return {
                    name: t,
                    version,
                };
            });
        }), { concurrency: 6 });
        const failedTypeInfos = typeInfos.filter((info) => info.version === null);
        const succeedTypeInfos = typeInfos.filter((info) => info.version !== null);
        for (const t of succeedTypeInfos) {
            config[saveAs][t.name] = t.version;
        }
        yield fs.outputJson(configPath, config, { spaces: 2 });
        spinner.text = `Installing ${succeedTypeInfos.length} typescript definitions ...`;
        if (succeedTypeInfos.length > 0) {
            yield install_1.npmInstall();
        }
        getResults(failedTypeInfos.map((t) => t.name), false, saveAs).map((r) => spinner.fail(r));
        getResults(allTypes.filter((t) => config[saveAs][t]), true, saveAs).map((r) => spinner.succeed(r));
        spinner.stop();
    });
}
function getResults(existTypes, isSucceed, saveAs) {
    const result = [];
    for (const t of existTypes) {
        let msg;
        if (isSucceed) {
            if (saveAs === "dependencies") {
                msg = "saved as dependency";
            }
            else if (saveAs === "devDependencies") {
                msg = "saved as devDependency";
            }
            else {
                msg = "saved";
            }
        }
        else {
            msg = "cannot find in npm registry";
        }
        const nameColor = (isSucceed) ? green : red;
        result.push(`${nameColor(t)} --- ${gray(msg)}`);
    }
    return result;
}

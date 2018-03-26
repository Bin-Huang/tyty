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
const pMap = require("p-map");
const execa = require("execa");
const chalk_1 = require("chalk");
function npm(types) {
    return __awaiter(this, void 0, void 0, function* () {
        const download = (type) => execa('npm', ['install', type, '--save'])
            .then(() => showResult(type, "to add as a dependency (using npm)", true))
            .catch(() => showResult(type, "to find in npm registry (using npm)", false));
        yield pMap(types, download, { concurrency: 1 });
    });
}
function npmDev(types) {
    return __awaiter(this, void 0, void 0, function* () {
        const download = (type) => execa('npm', ['install', type, '--save-dev'])
            .then(() => showResult(type, "to add as a dev-dependency (using npm)", true))
            .catch(() => showResult(type, "to find in npm registry (using npm)", false));
        yield pMap(types, download, { concurrency: 1 });
    });
}
function showResult(name, msg, isSucceed) {
    const result = (isSucceed) ? chalk_1.default.green("succeed") : chalk_1.default.red("failed");
    console.log(`${name} ${chalk_1.default.gray("---")} ${result} ${chalk_1.default.gray(msg)}`);
}
module.exports = {
    npm,
    npmDev
};

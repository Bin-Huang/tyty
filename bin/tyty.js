#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { exec } = require("child_process");
const program = require('commander');
const { npm, npmDev } = require("../install");
const findPackageJson = require("../find");

program
  .version("1.1.1")
  .option("-s, --save", "get typescript definitions and add to package.json as a dependency")
  .option("-d, --save-dev", "(default) get typescript definitions and add to package.json as a dev-dependency")
  .parse(process.argv);

if (program.saveDev) {
    action(npmDev).catch(console.log);
} else if (program.save) {
    action(npm).catch(console.log);
} else {
    action(npmDev).catch(console.log);
}

const blue = chalk.blue;
const yellow = chalk.yellow;

async function action(install) {
    const configPath = findPackageJson();
    const package = await fs.readJSON(configPath);
    const dependencies = package["dependencies"] || {};
    // const devDependencies = package["devDependencies"] || {};

    const pkgs = Object.keys(dependencies).filter((pkg) => ! pkg.startsWith("@types/"))
    const types = pkgs.map((pkg) => `@types/${pkg}`);

    console.log(`
        ${blue("start to get")} ${yellow(types.length)} ${blue("typescript definitions")} ...
    `);

    await install(types);
}

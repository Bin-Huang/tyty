#!/usr/bin/env node

import * as fs from 'fs-extra'
import * as pMap from 'p-map'
import * as path from 'path'
import chalk from 'chalk'
import * as program from 'commander'
import findPackageJson from './find'
import isExist from './isExist'
import * as ora from 'ora'
import { npm, npmDev } from "./install";

program
  .version("1.1.2")
  .option("-s, --save", "get typescript definitions and add to package.json as a dependency")
  .option("-d, --save-dev", "(default) get typescript definitions and add to package.json as a dev-dependency")
  .parse(process.argv);

if (program.saveDev) {
    action(npmDev, "devDependencies").catch(console.log);
} else if (program.save) {
    action(npm, "dependencies").catch(console.log);
} else {
    action(npmDev, "devDependencies").catch(console.log);
}

const blue = chalk.blueBright;
const yellow = chalk.yellow;
const green = chalk.green;
const red = chalk.red;
const gray = chalk.gray;

type IInstall = (types: string[]) => Promise<any>

async function action(install: IInstall, as: "dependencies" | "devDependencies" | null) {
    const configPath = findPackageJson();
    const packageJson = await fs.readJSON(configPath);
    const dependencies = packageJson["dependencies"] || {};
    // const devDependencies = package["devDependencies"] || {};

    const pkgs = Object.keys(dependencies).filter((pkg) => ! pkg.startsWith("@types/"))
    const types = pkgs.map((pkg) => `@types/${pkg}`);

    const spinner = ora({
      spinner: "moon",
    }).start();
    
    spinner.text = `${blue("start to get")} ${yellow(types.length.toString())} ${blue("typescript definitions")} ...`

    const checkExistResults = await pMap(types, (t) => isExist(t)
      .then(() => spinner.text = gray(`succeed to find ${t} in npm registry`))
      .catch(() => spinner.text = gray(`can not find ${t} in npm registry`)),
      {concurrency: 10});

    const existTypes = types.filter((t, ix) => checkExistResults[ix])
    const unexistTypes = types.filter((t, ix) => ! checkExistResults[ix])

    spinner.text = 'downloading ...'
    try {
      await install(existTypes);
    } catch (e) {
      // TODO: 
    }
    // console.log(`\n\n${blue("Result")}:\n`)
    getResults(existTypes, true, as).map((r) => spinner.succeed(r))
    getResults(unexistTypes, false, as).map((r) => spinner.fail(r))
    spinner.stop()
}

function getResults(existTypes: string[], isSucceed: boolean, saveAs: string|null): string[] {
    const result: string[] = []
    for (const t of existTypes) {
      let msg: string;
      if (isSucceed) {
        if (saveAs === "dependencies") {
          msg = "downloaded from npm and saved as dependency"
        } else if (saveAs === "devDependencies") {
          msg = "downloaded from npm and saved as devDependency"
        } else {
          msg = "downloaded from npm and saved"
        }
      } else {
        msg = "cannot find it in npm registry";
      }
      const nameColor = (isSucceed) ? green : red;
      result.push(`${nameColor(t)} --- ${gray(msg)}`)
    }
    return result
}
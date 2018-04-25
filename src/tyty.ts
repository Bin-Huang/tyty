#!/usr/bin/env node
import * as fs from 'fs-extra'
import * as pMap from 'p-map'
import * as exec from 'execa'
import * as path from 'path'
import chalk from 'chalk'
import * as program from 'commander'
import findPackageJson from './find'
import getVersion from './getVersion'
import * as ora from 'ora'
import { npm, npmDev } from "./install";

program
  .version("3.0.0")
  .option("-s, --save", "get typescript definitions and add to package.json as a dependency")
  .option("-d, --save-dev", "(default) get typescript definitions and add to package.json as a dev-dependency")
  .parse(process.argv);

if (program.saveDev) {
    action("devDependencies").catch(console.log);
} else if (program.save) {
    action("dependencies").catch(console.log);
} else {
    action("devDependencies").catch(console.log);
}

const blue = chalk.blueBright;
const yellow = chalk.yellow;
const green = chalk.green;
const red = chalk.red;
const gray = chalk.gray;

async function action(as: "dependencies" | "devDependencies") {
    const configPath = findPackageJson();
    const config = await fs.readJSON(configPath);
    const dependencies = config["dependencies"] || {};
    const devDependencies = config["devDependencies"] || {};

    const allPkgs = Object.keys(dependencies).filter((pkg) => ! pkg.startsWith("@types/"))
    const allTypes = allPkgs.map((pkg) => `@types/${pkg}`);

    const types = allTypes.filter((t) => ! config[as][t])

    const spinner = ora({ spinner: "moon" }).start();
    spinner.text = `${blue("start to get")} ${yellow(allTypes.length.toString())} ${blue("typescript definitions")} ...`

    if (types.length === 0) {
      spinner.succeed(`${green("already done")}`)
      spinner.stop();
      return ;
    }


    const typeInfos = await pMap(types, async (t) => getVersion(t).then((version) => {
      if (version) {
        spinner.text = gray(`succeed to find ${t} in npm registry`)
      } else {
        spinner.text = gray(`can not find ${t} in npm registry`)
      }
      return {
        name: t,
        version,
      }
    }), { concurrency: 6 });

    const failedTypeInfos = typeInfos.filter((info) => info.version === null);
    const succeedTypeInfos = typeInfos.filter((info) => info.version !== null);

    for (const t of succeedTypeInfos) {
      config[as][t.name] = t.version;
    }

    await fs.outputJson(configPath, config);

    spinner.text = `downloading ${succeedTypeInfos.length} typescript definitions ...`

    await exec("npm", ["install"]);

    getResults(failedTypeInfos.map((t) => t.name), false, as).map((r) => spinner.fail(r))
    getResults(succeedTypeInfos.map((t) => t.name), true, as).map((r) => spinner.succeed(r))
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
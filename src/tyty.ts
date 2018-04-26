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
import { npmInstall } from "./install";

program
  .version("3.3.0")
  .option("-s, --save", "get typescript definitions and save as dependency")
  .option("-d, --save-dev", "(default) get typescript definitions and save as dev-dependency")
  .parse(process.argv);

if (program.saveDev) {
    tyty("devDependencies").catch(console.log);
} else if (program.save) {
    tyty("dependencies").catch(console.log);
} else {
    tyty("devDependencies").catch(console.log);
}

const blue = chalk.blueBright;
const yellow = chalk.yellow;
const green = chalk.green;
const red = chalk.red;
const gray = chalk.gray;

async function tyty(saveAs: "dependencies" | "devDependencies") {
    const configPath = findPackageJson();
    const config = await fs.readJSON(configPath);
    const dependencies = config["dependencies"] || {};
    const devDependencies = config["devDependencies"] || {};

    const allPkgs = Object.keys(dependencies).filter((pkg) => ! pkg.startsWith("@types/"))
    const allTypes = allPkgs.map((pkg) => `@types/${pkg}`);

    const types = allTypes.filter((t) => ! config[saveAs][t])

    const spinner = ora({ spinner: "moon" }).start();
    spinner.text = `${blue("start to get")} ${yellow(allTypes.length.toString())} ${blue("typescript definitions")} ...`

    if (types.length === 0) {
      spinner.succeed(`${green("All installed already")}`)
      spinner.stop();
      return ;
    }

    const typeInfos = await pMap(types, async (t) => getVersion(t).then((version) => {
      if (version) {
        spinner.text = gray(`finded ${t} successfully in npm registry`)
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
      config[saveAs][t.name] = t.version;
    }

    await fs.outputJson(configPath, config);

    spinner.text = `Installing ${succeedTypeInfos.length} typescript definitions ...`

    if (succeedTypeInfos.length > 0) {
      await npmInstall();
    }

    getResults(failedTypeInfos.map((t) => t.name), false, saveAs).map((r) => spinner.fail(r))
    getResults(allTypes.filter((t) => config[saveAs][t]), true, saveAs).map((r) => spinner.succeed(r))
    spinner.stop()
}

function getResults(existTypes: string[], isSucceed: boolean, saveAs: string|null): string[] {
    const result: string[] = []
    for (const t of existTypes) {
      let msg: string;
      if (isSucceed) {
        if (saveAs === "dependencies") {
          msg = "saved as dependency"
        } else if (saveAs === "devDependencies") {
          msg = "saved as devDependency"
        } else {
          msg = "saved"
        }
      } else {
        msg = "cannot find in npm registry";
      }
      const nameColor = (isSucceed) ? green : red;
      result.push(`${nameColor(t)} --- ${gray(msg)}`)
    }
    return result
}
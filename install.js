const { exec } = require("child_process");
const pMap = require("p-map");
const chalk = require('chalk');

async function npm(types) {
    const download = (type) => execAsync(`npm install ${type} --save`)
        .then(() => showResult(type, "to add as a dependency (using npm)", true))
        .catch(() => showResult(type, "to find in npm registry (using npm)", false))

    await pMap(types, download, { concurrency: 6 });
}

async function npmDev(types) {
    const download = (type) => execAsync(`npm install ${type} --save-dev`)
        .then(() => showResult(type, "to add as a dev-dependency (using npm)", true))
        .catch(() => showResult(type, "to find in npm registry (using npm)", false))

    await pMap(types, download, { concurrency: 6 });
}

async function npmAll(types) {
    const pkgs = types.join(" ");
    await execAsync(`npm install ${pkgs} --save`);
}

function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) { reject(error); }
            else resolve([stdout, stderr]);
        })
    })
}

function showResult(name, msg, isSucceed) {
    const result = (isSucceed) ? chalk.green("succeed") : chalk.red("failed");
    console.log(`${name} ${chalk.gray("---")} ${result} ${chalk.gray(msg)}`);
}

module.exports = {
    npm,
    npmDev
}

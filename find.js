const fs = require("fs-extra");
const path = require("path");

function findPackageJson() {
    let configPath = "./package.json";
    while (! fs.existsSync(configPath)) {
        const absolutePath = path.resolve(process.cwd(), configPath);
        if (path.dirname(absolutePath) === "/") {
            throw new Error("can not find package.json !!")
            break;
        }
        configPath = "../" + configPath;
    }
    return path.resolve(process.cwd(), configPath);
}
module.exports = findPackageJson;

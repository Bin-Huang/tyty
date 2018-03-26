import * as fs from 'fs-extra'
import * as path from 'path'

export default function findPackageJson(): string {
    let configPath = "./package.json";
    let i = 0;
    while (! fs.existsSync(configPath)) {
        i ++;
        if (i > 10000) {
          throw new Error('can not find package.json!');
          break;
        }
        configPath = "../" + configPath;
    }
    return path.resolve(process.cwd(), configPath);
}

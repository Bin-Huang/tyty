import * as execa from 'execa'

export async function install(by: 'npm' | 'yarn' = 'npm') {
  await execa(by, ["install"]);
}
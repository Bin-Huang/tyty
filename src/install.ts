import * as execa from 'execa'

export async function npmInstall() {
  await execa("npm", ["install"]);
}
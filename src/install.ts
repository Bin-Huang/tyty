import * as pMap from 'p-map'
import * as execa from 'execa'
import chalk from 'chalk'

export async function npm(types: string[]) {
    await execa('npm', ['install', ...types, '--save'])
}

export async function npmDev(types: string[]) {
    await execa('npm', ['install', ...types, '--save-dev'])
}

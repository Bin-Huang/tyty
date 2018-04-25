import * as pMap from 'p-map'
import * as execa from 'execa'

export default async function getVersion(type: string): Promise<string|null> {
  try {
    const result = await execa('npm', ['view', type, 'version'])
    const version = result.stdout;
    return version 
  } catch (e) {
    return null
  }
}

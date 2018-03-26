import * as pMap from 'p-map'
import * as execa from 'execa'

export default async function isExist(type: string): Promise<boolean> {
  try {
    await execa('npm', ['view', type])
    return true
  } catch (e) {
    return false
  }
}

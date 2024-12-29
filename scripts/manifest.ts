import fs from 'fs-extra'
import { r } from './utils'
import { getMainfest } from '../src/manifest'


export async function writeMainfest() {
  fs.writeJSONSync(r('extension/manifest.json'), await getMainfest(), { spaces: 2 })
}

writeMainfest()
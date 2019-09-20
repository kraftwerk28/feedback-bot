const DEV = process.env.NODE_ENV !== 'production'

import { resolve } from 'path'
import { config } from 'dotenv'

const dEnvPath = resolve(process.cwd(), DEV ? '.env.dev' : '.env')

console.log(dEnvPath)

config({ path: dEnvPath })

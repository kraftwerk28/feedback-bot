import { resolve } from 'path'
import { config } from 'dotenv'

const dEnvPath = resolve(process.cwd(), '.env')

console.log(dEnvPath)

config({ path: dEnvPath })

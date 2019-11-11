import { resolve } from 'path'
import { config } from 'dotenv'

// in production docker-compose resolves .env instead
if (process.env.NODE_ENV === 'development') {
  const dEnvPath = resolve(process.cwd(), '.env')
  console.log(dEnvPath)
  config({ path: dEnvPath })
}

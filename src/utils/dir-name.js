import { dirname } from 'node:path'

// eslint-disable-next-line node/prefer-global/process
export const __dirname = dirname(process.argv[1])

import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const source = resolve('node_modules/@scalar/api-reference/dist/browser/standalone.js')
const target = resolve('docs/public/scalar/standalone.js')

mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)

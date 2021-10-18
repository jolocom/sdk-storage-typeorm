import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage, entityList } from '../index'  // NOTE: must specify 'index' or else it loads js!!!
import { createConnection } from 'typeorm'

const repl = require('repl')

const typeOrmConfig = {
    name: 'demoDb',
    type: 'sqlite',
    database: './db.sqlite3',
    dropSchema: true,
    entities: entityList,
    synchronize: true,
    logging: false,
}

async function loadDefaultAgent(global: any) {
  // @ts-ignore
  global.dbConn = await createConnection(typeOrmConfig)
  global.sdk = new JolocomSDK({
    storage: new JolocomTypeormStorage(global.dbConn),
  })

  global.sdk.setDefaultDidMethod('jun')
  global.a = await global.sdk.createAgent()
}

loadDefaultAgent(global).then(() => {
  const initLines = loadDefaultAgent.toString().split('\n')
  const initSource = initLines.slice(1, initLines.length - 1).map(line => {
    return line.replace(/global\./g, '')
  }).join('\n')

  console.log(
`// Docs are at https://jolocom.github.io/jolocom-sdk/
// Press the [TAB] button for autocompletion!

/****** This code was executed ******/
${initSource}
`)

  const replServer = repl.start({
    useGlobal: true
  })
  if (replServer.setupHistory) {
    replServer.setupHistory('./.repl.history', (err: Error) => {
      if (err) console.error('REPL History error', err)
    })
  }
})

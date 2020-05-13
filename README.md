[![npm package @jolocom/sdk-storage-typeorm](https://img.shields.io/npm/v/@jolocom/sdk-storage-typeorm?style=flat-square)](https://www.npmjs.com/package/@jolocom/sdk-storage-typeorm)
[![chat on gitter](https://img.shields.io/gitter/room/jolocom/jolocom-sdk?style=flat-square)](https://gitter.im/jolocom/jolocom-sdk)


# @jolocom/sdk-storage-typeorm
A [Typeorm](https://github.com/typeorm/typeorm) storage backend for [jolocom-sdk](https://github.com/jolocom/jolocom-sdk)


# Usage
In your `ormconfig.ts` you need to add the jolocom-sdk entities to your
`entities` config option. Here's a full example typeorm config file:

```ts
export default {
  type: 'sqlite',
  database: './db.sqlite3',
  logging: ['error', 'warn', 'schema'],
  entities: [ 'node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js' ],
  /** or if you list entity classes, then simply add the SDK entities
  entities: [
    // your entities here
    // then
    ...require('@jolocom/sdk-storage-typeorm').entityList
  ],
  */

  // migrations are recommended!
  migrations: ['./migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  cli: {
    migrationsDir: './migrations',
  },
}
```

In your application, instantiate the storage module with a typeorm connection,
then pass it to the JolocomSDK constrcutor. Example:

```ts
const typeorm = require('typeorm')
const { JolocomTypeormStorage } = require('@jolocom/sdk-storage-typeorm')
const { JolocomSDK } = require('jolocom-sdk')
const typeormConfig = require('./ormconfig')

async function init() {
  const typeormConnection = await typeorm.createConnection(typeormConfig)
  const storage = new JolocomTypeormStorage(typeormConnection)

  console.log('about to create SDK instance')
  const sdk = new JolocomSDK({ storage })

  // Running sdk.init() with no arguments will:
  // - create an identity if it doesn't exist
  // - load the identity from storage
  const identityWallet = await sdk.init()
  console.log('Agent identity', identityWallet.identity)
}

init()
```

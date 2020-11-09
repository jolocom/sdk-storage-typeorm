import { SettingEntity } from './src/entities/settingEntity'
import { CredentialEntity } from './src/entities/credentialEntity'
import { EncryptedWalletEntity } from './src/entities/encryptedWalletEntity'
import { EventLogEntity } from './src/entities/eventLogEntity'
import { SignatureEntity } from './src/entities/signatureEntity'
import { VerifiableCredentialEntity } from './src/entities/verifiableCredentialEntity'
import { CacheEntity } from './src/entities/cacheEntity'
import { InteractionTokenEntity } from './src/entities/interactionTokenEntity'
import { IdentityCacheEntity } from './src/entities/identityCacheEntity'

export {
  SettingEntity,
  CredentialEntity,
  EncryptedWalletEntity,
  EventLogEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
  InteractionTokenEntity,
  IdentityCacheEntity
}

export const entityList = [
  SettingEntity,
  CredentialEntity,
  EncryptedWalletEntity,
  EventLogEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
  InteractionTokenEntity,
  IdentityCacheEntity
]

export { JolocomTypeormStorage } from './src'

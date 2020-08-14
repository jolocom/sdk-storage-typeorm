import { SettingEntity } from './src/entities/settingEntity'
import { CredentialEntity } from './src/entities/credentialEntity'
import { MasterKeyEntity } from './src/entities/masterKeyEntity'
import { SignatureEntity } from './src/entities/signatureEntity'
import { VerifiableCredentialEntity } from './src/entities/verifiableCredentialEntity'
import { CacheEntity } from './src/entities/cacheEntity'
import { InteractionTokenEntity } from './src/entities/interactionTokenEntity'

export {
  CredentialEntity,
  MasterKeyEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
  InteractionTokenEntity,
}

export const entityList = [
  SettingEntity,
  CredentialEntity,
  MasterKeyEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
  InteractionTokenEntity,
]

export { JolocomTypeormStorage } from './src'

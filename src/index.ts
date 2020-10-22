import { SettingEntity } from './entities/settingEntity'
import { CredentialEntity } from './entities/credentialEntity'
import { MasterKeyEntity } from './entities/masterKeyEntity'
import { PersonaEntity } from './entities/personaEntity'
import { SignatureEntity } from './entities/signatureEntity'
import { VerifiableCredentialEntity } from './entities/verifiableCredentialEntity'
import { CacheEntity } from './entities/cacheEntity'
import { InteractionTokenEntity } from './entities/interactionTokenEntity'
import { EventLogEntity } from './entities/eventLogEntity'
import { EncryptedWalletEntity } from './entities/encryptedWalletEntity'

import { IStorage } from '@jolocom/sdk/js/storage'
import { Connection } from 'typeorm'
import { plainToClass } from 'class-transformer'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { IdentitySummary } from '@jolocom/sdk/js/types'
import { DidDocument } from 'jolocom-lib/js/identity/didDocument/didDocument'
import { groupAttributesByCredentialId } from '@jolocom/sdk/js/storage/utils'
import { InternalDb } from 'local-did-resolver'

import {
  JWTEncodable,
  JSONWebToken,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { JolocomLib } from 'jolocom-lib'

export interface PersonaAttributes {
  did: string
  controllingKeyPath: string
}

export interface EncryptedSeedAttributes {
  encryptedEntropy: string
  timestamp: number
}

export interface EncryptedWalletAttributes {
  id: string
  encryptedWallet: string
  timestamp: number
}

/**
 * @todo IdentitySummary is a UI type, which can always be
 * derived from a DID Doc and Public Profile.
 * Perhaps that's what we should store instead, since those
 * are more generic and can be reused.
 */

export class JolocomTypeormStorage implements IStorage {
  private connection!: Connection

  public store = {
    setting: this.saveSetting.bind(this),
    persona: this.storePersonaFromJSON.bind(this),
    verifiableCredential: this.storeVClaim.bind(this),
    encryptedSeed: this.storeEncryptedSeed.bind(this),
    encryptedWallet: this.storeEncryptedWallet.bind(this),
    credentialMetadata: this.storeCredentialMetadata.bind(this),
    issuerProfile: this.storeIssuerProfile.bind(this),
    didDoc: this.cacheDIDDoc.bind(this),
    interactionToken: this.storeInteractionToken.bind(this),
  }

  public get = {
    settingsObject: this.getSettingsObject.bind(this),
    setting: this.getSetting.bind(this),
    persona: this.getPersonas.bind(this),
    verifiableCredential: this.getVCredential.bind(this),
    attributesByType: this.getAttributesByType.bind(this),
    vCredentialsByAttributeValue: this.getVCredentialsForAttribute.bind(this),
    encryptedSeed: this.getEncryptedSeed.bind(this),
    encryptedWallet: this.getEncryptedWallet.bind(this),
    credentialMetadata: this.getMetadataForCredential.bind(this),
    publicProfile: this.getPublicProfile.bind(this),
    didDoc: this.getCachedDIDDoc.bind(this),
    interactionTokens: this.findTokens.bind(this)
  }

  public delete = {
    verifiableCredential: this.deleteVCred.bind(this),
    // credentialMetadata: this.deleteCredentialMetadata.bind(this)
  }

  public constructor(conn: Connection) {
    this.connection = conn
  }

  private async getSettingsObject(): Promise<{ [key: string]: any }> {
    const settingsList = await this.connection.manager.find(SettingEntity)
    const settings = {}
    settingsList.forEach(setting => {
      settings[setting.key] = setting.value
    })
    return settings
  }

  private async getSetting(key: string): Promise<any> {
    const setting = await this.connection.manager.findOne(SettingEntity, {
      key,
    })
    if (setting) return setting.value
  }

  private async saveSetting(key: string, value: any): Promise<void> {
    const repo = this.connection.getRepository(SettingEntity)
    const setting = repo.create({ key, value })
    await repo.save(setting)
  }

  // TODO: refactor needed on multiple personas
  private async getPersonas(query?: object): Promise<PersonaEntity[]> {
    return this.connection.manager.find(PersonaEntity)
  }

  private async getVCredential(query?: object): Promise<SignedCredential[]> {
    const entities = await this.connection.manager.find(
      VerifiableCredentialEntity,
      {
        where: query,
        relations: ['claim', 'proof', 'subject'],
      },
    )

    return entities.map(e => e.toVerifiableCredential())
  }

  private async getAttributesByType(type: string[]) {
    const localAttributes = await this.connection
      .getRepository(CredentialEntity)
      .createQueryBuilder('credential')
      .leftJoinAndSelect(
        'credential.verifiableCredential',
        'verifiableCredential',
      )
      .where('verifiableCredential.type = :type', { type })
      .getMany()

    const results = groupAttributesByCredentialId(localAttributes).map(
      (entry: any) => ({
        verification: entry.verifiableCredential.id,
        values: entry.propertyValue,
        fieldName: entry.propertyName,
      }),
    )

    return { type, results }
  }

  private async getVCredentialsForAttribute(
    attribute: string,
  ): Promise<SignedCredential[]> {
    const entities = await this.connection
      .getRepository(VerifiableCredentialEntity)
      .createQueryBuilder('verifiableCredential')
      .leftJoinAndSelect('verifiableCredential.claim', 'claim')
      .leftJoinAndSelect('verifiableCredential.proof', 'proof')
      .leftJoinAndSelect('verifiableCredential.subject', 'subject')
      .where('claim.propertyValue = :attribute', { attribute })
      .getMany()

    return entities.map(e => e.toVerifiableCredential())
  }

  private async getEncryptedWallet(): Promise<EncryptedWalletAttributes | null> {
    const walletEntities = await this.connection.manager.find(EncryptedWalletEntity)
    if (walletEntities.length) {
      const w = walletEntities[0]
      return {
        id: w.id,
        encryptedWallet: w.encryptedWallet,
        timestamp: w.timestamp
      }
    }
    return null
  }

  private async getEncryptedSeed(): Promise<string | null> {
    const masterKeyEntity = await this.connection.manager.find(MasterKeyEntity)
    if (masterKeyEntity.length) {
      return masterKeyEntity[0].encryptedEntropy
    }
    return null
  }

  private async findTokens(attrs: {
    nonce?: string
    type?: string
    issuer?: string
  }): Promise<JSONWebToken<JWTEncodable>[]> {
    // return await connection.manager.find(InteractionTokenEntity)
    const entities = await this.connection.manager
      .find(InteractionTokenEntity, {
        where: [attrs],
      })
    return entities.map(entity =>
      JolocomLib.parse.interactionToken.fromJWT(entity.original),
    )
  }

  private async getMetadataForCredential({
    issuer,
    type: credentialType,
  }: SignedCredential) {
    const entryKey = buildMetadataKey(issuer, credentialType)
    const [entry] = await this.connection.manager.findByIds(CacheEntity, [entryKey])
    return (entry && entry.value) || {}
  }

  private async getPublicProfile(did: string): Promise<IdentitySummary> {
    const [issuerProfile] = await this.connection.manager.findByIds(CacheEntity, [did])
    return (issuerProfile && issuerProfile.value) || { did }
  }

  private async getCachedDIDDoc(did: string): Promise<DidDocument> {
    const [entry] = await this.connection.manager.findByIds(CacheEntity, [
      `didCache:${did}`,
    ])

    return DidDocument.fromJSON(entry.value)
  }

  private async storePersonaFromJSON(args: PersonaAttributes): Promise<void> {
    const persona = plainToClass(PersonaEntity, args)
    await this.connection.manager.save(persona)
  }

  private async storeEncryptedWallet(
    args: EncryptedWalletAttributes,
  ): Promise<void> {
    const encryptedWallet = plainToClass(EncryptedWalletEntity, args)
    await this.connection.manager.save(encryptedWallet)
  }

  private async storeEncryptedSeed(
    args: EncryptedSeedAttributes,
  ): Promise<void> {
    const encryptedSeed = plainToClass(MasterKeyEntity, args)
    await this.connection.manager.save(encryptedSeed)
  }

  private async storeCredentialMetadata(
    credentialMetadata: CredentialMetadataSummary,
  ) {
    const { issuer, type: credentialType } = credentialMetadata

    const cacheEntry = plainToClass(CacheEntity, {
      key: buildMetadataKey(issuer.did, credentialType),
      value: { ...credentialMetadata, issuer: credentialMetadata.issuer.did },
    })

    await this.connection.manager.save(cacheEntry)
  }

  private async storeIssuerProfile(issuer: IdentitySummary) {
    const cacheEntry = plainToClass(CacheEntity, {
      key: issuer.did,
      value: issuer,
    })

    await this.connection.manager.save(cacheEntry)
  }

  private async cacheDIDDoc(doc: DidDocument) {
    const cacheEntry = plainToClass(CacheEntity, {
      key: `didCache:${doc.did}`,
      value: doc.toJSON(),
    })

    await this.connection.manager.save(cacheEntry)
  }

  private async storeInteractionToken(token: JSONWebToken<JWTEncodable>) {
    const tokenEntry = InteractionTokenEntity.fromJWT(token)

    await this.connection.manager.save(tokenEntry)
  }


  private async storeVClaim(vCred: SignedCredential): Promise<void> {
    const verifiableCredential = VerifiableCredentialEntity.fromVerifiableCredential(
      vCred,
    )

    const signature = SignatureEntity.fromLinkedDataSignature(vCred.proof)

    const claims = CredentialEntity.fromVerifiableCredential(vCred)
    claims.forEach(claim => (claim.verifiableCredential = verifiableCredential))

    signature.verifiableCredential = verifiableCredential

    verifiableCredential.proof = [signature]
    verifiableCredential.claim = claims

    await this.connection.manager.save(verifiableCredential)
  }

  private async deleteVCred(id: string): Promise<void> {
    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(CredentialEntity)
      .where('verifiableCredential = :id', { id })
      .execute()

    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(SignatureEntity)
      .where('verifiableCredential = :id', { id })
      .delete()
      .execute()

    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(VerifiableCredentialEntity)
      .where('id = :id', { id })
      .execute()
  }

  private async readEventLog(id: string): Promise<string[]> {
    return await this.connection.manager.findOne(EventLogEntity, id).then(el => {
      if (!el) throw new Error("no Event Log found for id: " + id)
      return el.events
    })
  }
  
  private async appendEvent(id: string, events: string[]): Promise<boolean> {
    return await this.connection.manager.findOne(EventLogEntity, id).then(async (el) => {
      if (!el) return false
      el.events.push(...events)
      await this.connection.manager.save(el)
      return true
    })
  }

  private async deleteEventLog(id: string): Promise<boolean> {
    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(EventLogEntity)
      .where('id = :id', { id })
      .execute()
    return true
  }

  public eventDB: InternalDb = {
    read: this.readEventLog.bind(this),
    append: this.appendEvent.bind(this),
    delete: this.deleteEventLog.bind(this)
  }
}

export interface CredentialMetadata {
  type: string
  renderInfo: CredentialOfferRenderInfo
  metadata: CredentialOfferMetadata
}

export interface CredentialMetadataSummary extends CredentialMetadata {
  issuer: IdentitySummary
}

const buildMetadataKey = (
  issuer: string,
  credentialType: string | string[],
): string => {
  if (typeof credentialType === 'string') {
    return `${issuer}${credentialType}`
  }

  return `${issuer}${credentialType[credentialType.length - 1]}`
}


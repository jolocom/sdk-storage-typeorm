import { SettingEntity } from './entities/settingEntity'
import { CredentialEntity } from './entities/credentialEntity'
import { SignatureEntity } from './entities/signatureEntity'
import { VerifiableCredentialEntity } from './entities/verifiableCredentialEntity'
import { CacheEntity } from './entities/cacheEntity'
import { InteractionTokenEntity } from './entities/interactionTokenEntity'
import { EventLogEntity } from './entities/eventLogEntity'
import { EncryptedWalletEntity } from './entities/encryptedWalletEntity'

import { IStorage, EncryptedWalletAttributes, QueryOptions, CredentialQuery, InteractionTokenQuery, InteractionQuery, InteractionQueryAttrs } from '@jolocom/sdk/js/storage'
import { Connection, SelectQueryBuilder } from 'typeorm'
import { plainToClass } from 'class-transformer'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { groupAttributesByCredentialId } from './utils'
import { InternalDb } from '@jolocom/local-resolver-registrar/js/db'

import {
  JWTEncodable,
  JSONWebToken,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Identity } from 'jolocom-lib/js/identity/identity'
import { IdentityCacheEntity } from './entities/identityCacheEntity'
import { IdentitySummary, Interaction, JolocomLib } from '@jolocom/sdk'

export interface PersonaAttributes {
  did: string
  controllingKeyPath: string
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
    verifiableCredential: this.storeVClaim.bind(this),
    encryptedWallet: this.storeEncryptedWallet.bind(this),
    credentialMetadata: this.storeCredentialMetadata.bind(this),
    issuerProfile: this.storeIssuerProfile.bind(this),
    identity: this.cacheIdentity.bind(this),
    interactionToken: this.storeInteractionToken.bind(this),
  }

  public get = {
    settingsObject: this.getSettingsObject.bind(this),
    setting: this.getSetting.bind(this),
    verifiableCredential: this.getVCredential.bind(this),
    attributesByType: this.getAttributesByType.bind(this),
    vCredentialsByAttributeValue: this.getVCredentialsForAttribute.bind(this),
    encryptedWallet: this.getEncryptedWallet.bind(this),
    credentialMetadataById: this.getCredentialMetadata.bind(this),
    credentialMetadata: this.getMetadataForCredential.bind(this),
    publicProfile: this.getPublicProfile.bind(this),
    identity: this.getCachedIdentity.bind(this),
    interactionTokens: this.findTokens.bind(this),
    //TODO interactions: this.findInteractions.bind(this),
    interactionIds: this.findInteractionIds.bind(this)
  }

  public delete = {
    verifiableCredential: this.deleteVCred.bind(this),
    identity: this.deleteIdentity.bind(this),
    encryptedWallet: this.deleteEncryptedWallet.bind(this),
    verifiableCredentials: this.deleteVCreds.bind(this),
    interactions: this.deleteInteractions.bind(this),
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

  private async getVCredential(
    query?: CredentialQuery, queryOpts?: QueryOptions
  ): Promise<SignedCredential[]> {
    let query_arr = !query ? null : Array.isArray(query) ? query : [query]

    // TODO the query has a claims object whose properties need to be mapped to
    // where clauses on a leftJoin on credentials WHERE propertyName = '' and
    // propertyValue = ''
    // then distinct()
    //
    // can use/reuse getVCredentialsForAttribute? it only supports querying by 1
    // attribute....

    let full_query = query_arr?.map(credQuery => {
      /*
       *let claim = credQuery.claim && Object.keys(credQuery.claim).map(propertyName => {
       *  // NOTE: "|| undefined" so that a falsy value simply doesn't match
       *  // against values. This means we can't search for empty values though ''
       *  let propertyValue = credQuery.claim![propertyName] || undefined
       *  return {
       *    propertyName,
       *    ...(propertyValue && { propertyValue })
       *  }
       *})
       */

      /**
       * the In(credTypes) doesn't work inside a where
       *
       *let credTypes = credQuery.types?.map(t => t.toString())
       *if (!credTypes && credQuery.type) credTypes = [credQuery.type.toString()]
       */

      let credType = credQuery.type?.toString()

      return {
        ...credQuery,
        ...(credType && { type: credType }),
        //...(claim && { claim: In(['lol', 'ok']) }),
      }
    })

    const entities = await this.connection.manager.find(
      VerifiableCredentialEntity,
      {
        where: full_query,
        relations: ['claim', 'proof', 'subject'],
        ...queryOpts
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
      .where('verifiableCredential.type = :type', { type: type.toString() })
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
    queryOptions?: QueryOptions
  ): Promise<SignedCredential[]> {
    let query = await this.connection
      .getRepository(VerifiableCredentialEntity)
      .createQueryBuilder('verifiableCredential')
      .leftJoinAndSelect('verifiableCredential.claim', 'claim')
      .leftJoinAndSelect('verifiableCredential.proof', 'proof')
      .leftJoinAndSelect('verifiableCredential.subject', 'subject')
      .where('claim.propertyValue = :attribute', { attribute })

    if (queryOptions) {
      query = query
        .skip(queryOptions.skip)
        .take(queryOptions.take)
    }

    const entities = await query.getMany()
    return entities.map(e => e.toVerifiableCredential())
  }

  private async getEncryptedWallet(id?: string): Promise<EncryptedWalletAttributes | null> {
    const walletEntity = id
      ? await this.connection.manager.findOne(EncryptedWalletEntity, { id })
      : (await this.connection.manager.find(EncryptedWalletEntity))[0]
    if (walletEntity) {
      return {
        id: walletEntity.id,
        encryptedWallet: walletEntity.encryptedWallet,
        timestamp: walletEntity.timestamp
      }
    }
    return null
  }

  private async findTokens(
    query: InteractionTokenQuery,
    queryOptions?: QueryOptions
  ): Promise<JSONWebToken<JWTEncodable>[]> {
    // return await connection.manager.find(InteractionTokenEntity)
    const entities = await this.connection.manager
      .find(InteractionTokenEntity, {
        where: query,
        ...queryOptions
      })
    return entities.map(entity =>
      JolocomLib.parse.interactionToken.fromJWT(entity.original),
    )
  }

  private async findInteractionIds(query?: InteractionQuery, queryOptions?: QueryOptions) {
/*
 *    let qb = this.connection
 *      .getRepository(InteractionTokenEntity)
 *      .createQueryBuilder("tokens")
 *      .select('tokens.nonce')
 *      .distinct()
 *
 *    qb = FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
 *      where: query,
 *      ...queryOptions
 *    })
 */

    let qb = this._buildInteractionQueryBuilder(query, queryOptions)

    const tokens = await qb
      .getRawMany()


    return tokens.map(t => t.req_token_nonce)
  }

  private async getCredentialMetadata(id: string): Promise<CredentialMetadataSummary> {
    const [entry] = await this.connection.manager.findByIds(CacheEntity, [id])
    return (entry && entry.value) || {}
  }

  private async getMetadataForCredential({
    issuer,
    type: credentialType,
  }: SignedCredential) {
    const entryKey = buildMetadataKey(issuer, credentialType)
    return this.getCredentialMetadata(entryKey)
  }

  private async getPublicProfile(did: string): Promise<IdentitySummary> {
    const [issuerProfile] = await this.connection.manager.findByIds(CacheEntity, [did])
    return (issuerProfile && issuerProfile.value) || { did }
  }

  private async getCachedIdentity(did: string): Promise<undefined | Identity> {
    const [entry] = await this.connection.manager.findByIds(IdentityCacheEntity, [
      did
    ])

    return entry && entry.value && Identity.fromJSON(entry.value)
  }

  private async storeEncryptedWallet(
    args: EncryptedWalletAttributes,
  ): Promise<void> {
    const encryptedWallet = plainToClass(EncryptedWalletEntity, args)
    await this.connection.manager.save(encryptedWallet)
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

  private async cacheIdentity(identity: Identity) {
    const cacheEntry = plainToClass(IdentityCacheEntity, {
      key: identity.did,
      value: identity.toJSON()
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

  private async deleteIdentity(did: string) {
    await this.connection.manager.delete(IdentityCacheEntity, {
      key: did
    })
  }

  private async deleteEncryptedWallet(did: string) {
    await this.connection.manager.delete(EncryptedWalletEntity, {
      id: did
    })
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

  private async deleteVCreds(query: CredentialQuery): Promise<void> {
    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(VerifiableCredentialEntity)
      .where(query)
      .execute()
  }

  public _buildInteractionQueryBuilder(query?: InteractionQuery, options?: QueryOptions) {
    let qb = this.connection
      .getRepository(InteractionTokenEntity)
      .createQueryBuilder("req_token")
      .select("req_token.nonce")
      .distinct()
    qb = options ? this._applyQueryOptions(qb, options, "req_token") : qb
    qb = qb.leftJoin(
        (qb) => qb.from(InteractionTokenEntity, "res_token"),
        "res_token",
        "req_token.nonce == res_token.nonce AND res_token.id != req_token.id"
      )
    qb = this._applyInteractionQuery(qb, query)
    return qb
  }


  private _applyQueryOptions<T>(qb: SelectQueryBuilder<T>, options: QueryOptions, table?: string) {
    // we could have used this, but apparently skip/take don't work on joins
    //return FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder<T>(qb, options)

    let orderBy = options.order
    if (orderBy) {
      if (table) {
        orderBy = {}
        Object.keys(options.order!).forEach(k => {
          orderBy![`${table}.${k}`] = options.order![k]
        })
      }
      qb = qb.orderBy(orderBy)
    }
    if (options.skip) qb = qb.offset(options.skip)
    if (options.take) qb = qb.limit(options.take)

    return qb
  }

  public _applyInteractionQuery(qb: SelectQueryBuilder<InteractionTokenEntity>, query?: InteractionQuery) {
    let query_arr = !query ? null : Array.isArray(query) ? query : [query]
    if (query_arr) {
      // we do this manually since it doesn't work well on joins
      query_arr.forEach((q, i) => {
        let where: string[] = []
        let params: InteractionQueryAttrs = {}
        // we need to add a loop counter to the keys because otherwise the
        // parameters overwrite each other when we get/setParameters in
        // deleteInteractions
        Object.keys(q).forEach(k => params[`${k}${i}`] = q[k])
        if (q.initiator) where.push(`req_token.issuer == :initiator${i}`)
        if (q.responder) where.push(`res_token.issuer == :responder${i}`)
        if (q.id) where.push(`req_token.nonce == :id${i}`)
        if (q.type || q.types) {
          let types = q.types || [q.type!]
          where.push(`req_token.type IN (:...types${i})`)
          params[`types${i}`] = types.map(Interaction.getRequestTokenType)
        }
        qb = qb.orWhere(where.join(" AND "), params)
      })
    }

    return qb
  }


  private async deleteInteractions(query?: InteractionQuery): Promise<void> {
    let interxns_qb = this._buildInteractionQueryBuilder(query)
    let qb = this.connection
      .getRepository(InteractionTokenEntity)
      .createQueryBuilder()
      .delete()
      .where(`nonce IN (${ interxns_qb.getQuery() })`
      )
      .setParameters(interxns_qb.getParameters())
    await qb.execute()
  }

  private async readEventLog(id: string): Promise<string> {
    return await this.connection.manager.findOne(EventLogEntity, id).then(el => {
      if (!el) return ""
      return el.eventStream
    })
  }

  private async appendEvent(id: string, events: string): Promise<boolean> {
    return await this.connection.manager.findOne(EventLogEntity, id).then(async (el) => {
      if (!el) {
        const nel = plainToClass(EventLogEntity, { id, eventStream: events })
        await this.connection.manager.save(nel)
      } else {
        el.eventStream = el.eventStream + events
        await this.connection.manager.save(el)
      }
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


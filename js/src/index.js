"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const settingEntity_1 = require("./entities/settingEntity");
const credentialEntity_1 = require("./entities/credentialEntity");
const signatureEntity_1 = require("./entities/signatureEntity");
const verifiableCredentialEntity_1 = require("./entities/verifiableCredentialEntity");
const cacheEntity_1 = require("./entities/cacheEntity");
const interactionTokenEntity_1 = require("./entities/interactionTokenEntity");
const eventLogEntity_1 = require("./entities/eventLogEntity");
const encryptedWalletEntity_1 = require("./entities/encryptedWalletEntity");
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const identity_1 = require("jolocom-lib/js/identity/identity");
const identityCacheEntity_1 = require("./entities/identityCacheEntity");
const sdk_1 = require("@jolocom/sdk");
/**
 * @todo IdentitySummary is a UI type, which can always be
 * derived from a DID Doc and Public Profile.
 * Perhaps that's what we should store instead, since those
 * are more generic and can be reused.
 */
class JolocomTypeormStorage {
    constructor(conn) {
        this.store = {
            setting: this.saveSetting.bind(this),
            verifiableCredential: this.storeVClaim.bind(this),
            encryptedWallet: this.storeEncryptedWallet.bind(this),
            credentialMetadata: this.storeCredentialMetadata.bind(this),
            issuerProfile: this.storeIssuerProfile.bind(this),
            identity: this.cacheIdentity.bind(this),
            interactionToken: this.storeInteractionToken.bind(this),
        };
        this.get = {
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
        };
        this.delete = {
            verifiableCredential: this.deleteVCred.bind(this),
            identity: this.deleteIdentity.bind(this),
            encryptedWallet: this.deleteEncryptedWallet.bind(this),
            verifiableCredentials: this.deleteVCreds.bind(this),
            interactions: this.deleteInteractions.bind(this),
        };
        this.eventDB = {
            read: this.readEventLog.bind(this),
            append: this.appendEvent.bind(this),
            delete: this.deleteEventLog.bind(this)
        };
        this.connection = conn;
    }
    getSettingsObject() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const settingsList = yield this.connection.manager.find(settingEntity_1.SettingEntity);
            const settings = {};
            settingsList.forEach(setting => {
                settings[setting.key] = setting.value;
            });
            return settings;
        });
    }
    getSetting(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = yield this.connection.manager.findOne(settingEntity_1.SettingEntity, {
                key,
            });
            if (setting)
                return setting.value;
        });
    }
    saveSetting(key, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const repo = this.connection.getRepository(settingEntity_1.SettingEntity);
            const setting = repo.create({ key, value });
            yield repo.save(setting);
        });
    }
    getVCredential(query, queryOpts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let query_arr = !query ? null : Array.isArray(query) ? query : [query];
            // TODO the query has a claims object whose properties need to be mapped to
            // where clauses on a leftJoin on credentials WHERE propertyName = '' and
            // propertyValue = ''
            // then distinct()
            //
            // can use/reuse getVCredentialsForAttribute? it only supports querying by 1
            // attribute....
            let full_query = query_arr === null || query_arr === void 0 ? void 0 : query_arr.map(credQuery => {
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
                var _a;
                /**
                 * the In(credTypes) doesn't work inside a where
                 *
                 *let credTypes = credQuery.types?.map(t => t.toString())
                 *if (!credTypes && credQuery.type) credTypes = [credQuery.type.toString()]
                 */
                let credType = (_a = credQuery.type) === null || _a === void 0 ? void 0 : _a.toString();
                return Object.assign(Object.assign({}, credQuery), (credType && { type: credType }));
            });
            const entities = yield this.connection.manager.find(verifiableCredentialEntity_1.VerifiableCredentialEntity, Object.assign({ where: full_query, relations: ['claim', 'proof', 'subject'] }, queryOpts));
            return entities.map(e => e.toVerifiableCredential());
        });
    }
    getAttributesByType(type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const localAttributes = yield this.connection
                .getRepository(credentialEntity_1.CredentialEntity)
                .createQueryBuilder('credential')
                .leftJoinAndSelect('credential.verifiableCredential', 'verifiableCredential')
                .where('verifiableCredential.type = :type', { type: type.toString() })
                .getMany();
            const results = utils_1.groupAttributesByCredentialId(localAttributes).map((entry) => ({
                verification: entry.verifiableCredential.id,
                values: entry.propertyValue,
                fieldName: entry.propertyName,
            }));
            return { type, results };
        });
    }
    getVCredentialsForAttribute(attribute, queryOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let query = yield this.connection
                .getRepository(verifiableCredentialEntity_1.VerifiableCredentialEntity)
                .createQueryBuilder('verifiableCredential')
                .leftJoinAndSelect('verifiableCredential.claim', 'claim')
                .leftJoinAndSelect('verifiableCredential.proof', 'proof')
                .leftJoinAndSelect('verifiableCredential.subject', 'subject')
                .where('claim.propertyValue = :attribute', { attribute });
            if (queryOptions) {
                query = query
                    .skip(queryOptions.skip)
                    .take(queryOptions.take);
            }
            const entities = yield query.getMany();
            return entities.map(e => e.toVerifiableCredential());
        });
    }
    getEncryptedWallet(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const walletEntity = id
                ? yield this.connection.manager.findOne(encryptedWalletEntity_1.EncryptedWalletEntity, { id })
                : (yield this.connection.manager.find(encryptedWalletEntity_1.EncryptedWalletEntity))[0];
            if (walletEntity) {
                return {
                    id: walletEntity.id,
                    encryptedWallet: walletEntity.encryptedWallet,
                    timestamp: walletEntity.timestamp
                };
            }
            return null;
        });
    }
    findTokens(query, queryOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // return await connection.manager.find(InteractionTokenEntity)
            const entities = yield this.connection.manager
                .find(interactionTokenEntity_1.InteractionTokenEntity, Object.assign({ where: query }, queryOptions));
            return entities.map(entity => sdk_1.JolocomLib.parse.interactionToken.fromJWT(entity.original));
        });
    }
    findInteractionIds(query, queryOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            let qb = this._buildInteractionQueryBuilder(query, queryOptions);
            const tokens = yield qb
                .getRawMany();
            return tokens.map(t => t.req_token_nonce);
        });
    }
    getCredentialMetadata(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [entry] = yield this.connection.manager.findByIds(cacheEntity_1.CacheEntity, [id]);
            return (entry && entry.value) || {};
        });
    }
    getMetadataForCredential({ issuer, type: credentialType, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entryKey = buildMetadataKey(issuer, credentialType);
            return this.getCredentialMetadata(entryKey);
        });
    }
    getPublicProfile(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [issuerProfile] = yield this.connection.manager.findByIds(cacheEntity_1.CacheEntity, [did]);
            return (issuerProfile && issuerProfile.value) || { did };
        });
    }
    getCachedIdentity(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [entry] = yield this.connection.manager.findByIds(identityCacheEntity_1.IdentityCacheEntity, [
                did
            ]);
            return entry && entry.value && identity_1.Identity.fromJSON(entry.value);
        });
    }
    storeEncryptedWallet(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const encryptedWallet = class_transformer_1.plainToClass(encryptedWalletEntity_1.EncryptedWalletEntity, args);
            yield this.connection.manager.save(encryptedWallet);
        });
    }
    storeCredentialMetadata(credentialMetadata) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { issuer, type: credentialType } = credentialMetadata;
            const cacheEntry = class_transformer_1.plainToClass(cacheEntity_1.CacheEntity, {
                key: buildMetadataKey(issuer.did, credentialType),
                value: Object.assign(Object.assign({}, credentialMetadata), { issuer: credentialMetadata.issuer.did }),
            });
            yield this.connection.manager.save(cacheEntry);
        });
    }
    storeIssuerProfile(issuer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheEntry = class_transformer_1.plainToClass(cacheEntity_1.CacheEntity, {
                key: issuer.did,
                value: issuer,
            });
            yield this.connection.manager.save(cacheEntry);
        });
    }
    cacheIdentity(identity) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheEntry = class_transformer_1.plainToClass(identityCacheEntity_1.IdentityCacheEntity, {
                key: identity.did,
                value: identity.toJSON()
            });
            yield this.connection.manager.save(cacheEntry);
        });
    }
    storeInteractionToken(token) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tokenEntry = interactionTokenEntity_1.InteractionTokenEntity.fromJWT(token);
            yield this.connection.manager.save(tokenEntry);
        });
    }
    storeVClaim(vCred) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const verifiableCredential = verifiableCredentialEntity_1.VerifiableCredentialEntity.fromVerifiableCredential(vCred);
            const signature = signatureEntity_1.SignatureEntity.fromLinkedDataSignature(vCred.proof);
            const claims = credentialEntity_1.CredentialEntity.fromVerifiableCredential(vCred);
            claims.forEach(claim => (claim.verifiableCredential = verifiableCredential));
            signature.verifiableCredential = verifiableCredential;
            verifiableCredential.proof = [signature];
            verifiableCredential.claim = claims;
            yield this.connection.manager.save(verifiableCredential);
        });
    }
    deleteIdentity(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.connection.manager.delete(identityCacheEntity_1.IdentityCacheEntity, {
                key: did
            });
        });
    }
    deleteEncryptedWallet(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.connection.manager.delete(encryptedWalletEntity_1.EncryptedWalletEntity, {
                id: did
            });
        });
    }
    deleteVCred(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.connection.manager
                .createQueryBuilder()
                .delete()
                .from(credentialEntity_1.CredentialEntity)
                .where('verifiableCredential = :id', { id })
                .execute();
            yield this.connection.manager
                .createQueryBuilder()
                .delete()
                .from(signatureEntity_1.SignatureEntity)
                .where('verifiableCredential = :id', { id })
                .delete()
                .execute();
            yield this.connection.manager
                .createQueryBuilder()
                .delete()
                .from(verifiableCredentialEntity_1.VerifiableCredentialEntity)
                .where('id = :id', { id })
                .execute();
        });
    }
    deleteVCreds(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.connection.manager
                .createQueryBuilder()
                .delete()
                .from(verifiableCredentialEntity_1.VerifiableCredentialEntity)
                .where(query)
                .execute();
        });
    }
    _buildInteractionQueryBuilder(query, options) {
        let qb = this.connection
            .getRepository(interactionTokenEntity_1.InteractionTokenEntity)
            .createQueryBuilder("req_token")
            .select("req_token.nonce")
            .distinct();
        qb = options ? this._applyQueryOptions(qb, options, "req_token") : qb;
        qb = qb.leftJoin((qb) => qb.from(interactionTokenEntity_1.InteractionTokenEntity, "res_token"), "res_token", "req_token.nonce == res_token.nonce AND res_token.id != req_token.id");
        qb = this._applyInteractionQuery(qb, query);
        return qb;
    }
    _applyQueryOptions(qb, options, table) {
        // we could have used this, but apparently skip/take don't work on joins
        //return FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder<T>(qb, options)
        let orderBy = options.order;
        if (orderBy) {
            if (table) {
                orderBy = {};
                Object.keys(options.order).forEach(k => {
                    orderBy[`${table}.${k}`] = options.order[k];
                });
            }
            qb = qb.orderBy(orderBy);
        }
        if (options.skip)
            qb = qb.offset(options.skip);
        if (options.take)
            qb = qb.limit(options.take);
        return qb;
    }
    _applyInteractionQuery(qb, query) {
        let query_arr = !query ? null : Array.isArray(query) ? query : [query];
        if (query_arr) {
            // we do this manually since it doesn't work well on joins
            query_arr.forEach((q, i) => {
                let where = [];
                let params = {};
                // we need to add a loop counter to the keys because otherwise the
                // parameters overwrite each other when we get/setParameters in
                // deleteInteractions
                Object.keys(q).forEach(k => params[`${k}${i}`] = q[k]);
                if (q.initiator)
                    where.push(`req_token.issuer == :initiator${i}`);
                if (q.responder)
                    where.push(`res_token.issuer == :responder${i}`);
                if (q.id)
                    where.push(`req_token.nonce == :id${i}`);
                if (q.type || q.types) {
                    let types = q.types || [q.type];
                    where.push(`req_token.type IN (:...types${i})`);
                    params[`types${i}`] = types.map(sdk_1.Interaction.getRequestTokenType);
                }
                qb = qb.orWhere(where.join(" AND "), params);
            });
        }
        return qb;
    }
    deleteInteractions(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let interxns_qb = this._buildInteractionQueryBuilder(query);
            let qb = this.connection
                .getRepository(interactionTokenEntity_1.InteractionTokenEntity)
                .createQueryBuilder()
                .delete()
                .where(`nonce IN (${interxns_qb.getQuery()})`)
                .setParameters(interxns_qb.getParameters());
            yield qb.execute();
        });
    }
    readEventLog(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.connection.manager.findOne(eventLogEntity_1.EventLogEntity, id).then(el => {
                if (!el)
                    return "";
                return el.eventStream;
            });
        });
    }
    appendEvent(id, events) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.connection.manager.findOne(eventLogEntity_1.EventLogEntity, id).then((el) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!el) {
                    const nel = class_transformer_1.plainToClass(eventLogEntity_1.EventLogEntity, { id, eventStream: events });
                    yield this.connection.manager.save(nel);
                }
                else {
                    el.eventStream = el.eventStream + events;
                    yield this.connection.manager.save(el);
                }
                return true;
            }));
        });
    }
    deleteEventLog(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.connection.manager
                .createQueryBuilder()
                .delete()
                .from(eventLogEntity_1.EventLogEntity)
                .where('id = :id', { id })
                .execute();
            return true;
        });
    }
}
exports.JolocomTypeormStorage = JolocomTypeormStorage;
const buildMetadataKey = (issuer, credentialType) => {
    if (typeof credentialType === 'string') {
        return `${issuer}${credentialType}`;
    }
    return `${issuer}${credentialType[credentialType.length - 1]}`;
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const settingEntity_1 = require("./entities/settingEntity");
const credentialEntity_1 = require("./entities/credentialEntity");
const masterKeyEntity_1 = require("./entities/masterKeyEntity");
const signatureEntity_1 = require("./entities/signatureEntity");
const verifiableCredentialEntity_1 = require("./entities/verifiableCredentialEntity");
const cacheEntity_1 = require("./entities/cacheEntity");
const interactionTokenEntity_1 = require("./entities/interactionTokenEntity");
const eventLogEntity_1 = require("./entities/eventLogEntity");
const encryptedWalletEntity_1 = require("./entities/encryptedWalletEntity");
const class_transformer_1 = require("class-transformer");
const didDocument_1 = require("jolocom-lib/js/identity/didDocument/didDocument");
const utils_1 = require("./utils");
const jolocom_lib_1 = require("jolocom-lib");
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
            encryptedSeed: this.storeEncryptedSeed.bind(this),
            encryptedWallet: this.storeEncryptedWallet.bind(this),
            credentialMetadata: this.storeCredentialMetadata.bind(this),
            issuerProfile: this.storeIssuerProfile.bind(this),
            didDoc: this.cacheDIDDoc.bind(this),
            interactionToken: this.storeInteractionToken.bind(this),
        };
        this.get = {
            settingsObject: this.getSettingsObject.bind(this),
            setting: this.getSetting.bind(this),
            verifiableCredential: this.getVCredential.bind(this),
            attributesByType: this.getAttributesByType.bind(this),
            vCredentialsByAttributeValue: this.getVCredentialsForAttribute.bind(this),
            encryptedSeed: this.getEncryptedSeed.bind(this),
            encryptedWallet: this.getEncryptedWallet.bind(this),
            credentialMetadata: this.getMetadataForCredential.bind(this),
            publicProfile: this.getPublicProfile.bind(this),
            didDoc: this.getCachedDIDDoc.bind(this),
            interactionTokens: this.findTokens.bind(this)
        };
        this.delete = {
            verifiableCredential: this.deleteVCred.bind(this),
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
    getVCredential(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entities = yield this.connection.manager.find(verifiableCredentialEntity_1.VerifiableCredentialEntity, {
                where: query,
                relations: ['claim', 'proof', 'subject'],
            });
            return entities.map(e => e.toVerifiableCredential());
        });
    }
    getAttributesByType(type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const localAttributes = yield this.connection
                .getRepository(credentialEntity_1.CredentialEntity)
                .createQueryBuilder('credential')
                .leftJoinAndSelect('credential.verifiableCredential', 'verifiableCredential')
                .where('verifiableCredential.type = :type', { type })
                .getMany();
            const results = utils_1.groupAttributesByCredentialId(localAttributes).map((entry) => ({
                verification: entry.verifiableCredential.id,
                values: entry.propertyValue,
                fieldName: entry.propertyName,
            }));
            return { type, results };
        });
    }
    getVCredentialsForAttribute(attribute) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entities = yield this.connection
                .getRepository(verifiableCredentialEntity_1.VerifiableCredentialEntity)
                .createQueryBuilder('verifiableCredential')
                .leftJoinAndSelect('verifiableCredential.claim', 'claim')
                .leftJoinAndSelect('verifiableCredential.proof', 'proof')
                .leftJoinAndSelect('verifiableCredential.subject', 'subject')
                .where('claim.propertyValue = :attribute', { attribute })
                .getMany();
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
    getEncryptedSeed() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const masterKeyEntity = yield this.connection.manager.find(masterKeyEntity_1.MasterKeyEntity);
            if (masterKeyEntity.length) {
                return masterKeyEntity[0].encryptedEntropy;
            }
            return null;
        });
    }
    findTokens(attrs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // return await connection.manager.find(InteractionTokenEntity)
            const entities = yield this.connection.manager
                .find(interactionTokenEntity_1.InteractionTokenEntity, {
                where: [attrs],
            });
            return entities.map(entity => jolocom_lib_1.JolocomLib.parse.interactionToken.fromJWT(entity.original));
        });
    }
    getMetadataForCredential({ issuer, type: credentialType, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entryKey = buildMetadataKey(issuer, credentialType);
            const [entry] = yield this.connection.manager.findByIds(cacheEntity_1.CacheEntity, [entryKey]);
            return (entry && entry.value) || {};
        });
    }
    getPublicProfile(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [issuerProfile] = yield this.connection.manager.findByIds(cacheEntity_1.CacheEntity, [did]);
            return (issuerProfile && issuerProfile.value) || { did };
        });
    }
    getCachedDIDDoc(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [entry] = yield this.connection.manager.findByIds(cacheEntity_1.CacheEntity, [
                `didCache:${did}`,
            ]);
            return didDocument_1.DidDocument.fromJSON(entry.value);
        });
    }
    storeEncryptedWallet(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const encryptedWallet = class_transformer_1.plainToClass(encryptedWalletEntity_1.EncryptedWalletEntity, args);
            yield this.connection.manager.save(encryptedWallet);
        });
    }
    storeEncryptedSeed(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const encryptedSeed = class_transformer_1.plainToClass(masterKeyEntity_1.MasterKeyEntity, args);
            yield this.connection.manager.save(encryptedSeed);
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
    cacheDIDDoc(doc) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheEntry = class_transformer_1.plainToClass(cacheEntity_1.CacheEntity, {
                key: `didCache:${doc.did}`,
                value: doc.toJSON(),
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
    readEventLog(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.connection.manager.findOne(eventLogEntity_1.EventLogEntity, id).then(el => {
                if (!el)
                    throw new Error("no Event Log found for id: " + id);
                return JSON.parse(el.eventStream);
            });
        });
    }
    appendEvent(id, events) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.connection.manager.findOne(eventLogEntity_1.EventLogEntity, id).then((el) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!el)
                    return false;
                el.eventStream = JSON.stringify([...JSON.parse(el.eventStream), ...events]);
                yield this.connection.manager.save(el);
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

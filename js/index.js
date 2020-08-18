"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settingEntity_1 = require("./src/entities/settingEntity");
exports.SettingEntity = settingEntity_1.SettingEntity;
const credentialEntity_1 = require("./src/entities/credentialEntity");
exports.CredentialEntity = credentialEntity_1.CredentialEntity;
const encryptedWalletEntity_1 = require("./src/entities/encryptedWalletEntity");
exports.EncryptedWalletEntity = encryptedWalletEntity_1.EncryptedWalletEntity;
const eventLogEntity_1 = require("./src/entities/eventLogEntity");
exports.EventLogEntity = eventLogEntity_1.EventLogEntity;
const signatureEntity_1 = require("./src/entities/signatureEntity");
exports.SignatureEntity = signatureEntity_1.SignatureEntity;
const verifiableCredentialEntity_1 = require("./src/entities/verifiableCredentialEntity");
exports.VerifiableCredentialEntity = verifiableCredentialEntity_1.VerifiableCredentialEntity;
const cacheEntity_1 = require("./src/entities/cacheEntity");
exports.CacheEntity = cacheEntity_1.CacheEntity;
const interactionTokenEntity_1 = require("./src/entities/interactionTokenEntity");
exports.InteractionTokenEntity = interactionTokenEntity_1.InteractionTokenEntity;
exports.entityList = [
    settingEntity_1.SettingEntity,
    credentialEntity_1.CredentialEntity,
    encryptedWalletEntity_1.EncryptedWalletEntity,
    eventLogEntity_1.EventLogEntity,
    signatureEntity_1.SignatureEntity,
    verifiableCredentialEntity_1.VerifiableCredentialEntity,
    cacheEntity_1.CacheEntity,
    interactionTokenEntity_1.InteractionTokenEntity,
];
var src_1 = require("./src");
exports.JolocomTypeormStorage = src_1.JolocomTypeormStorage;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityList = exports.IdentityCacheEntity = exports.InteractionTokenEntity = exports.CacheEntity = exports.VerifiableCredentialEntity = exports.SignatureEntity = exports.EventLogEntity = exports.EncryptedWalletEntity = exports.CredentialEntity = exports.SettingEntity = void 0;
const settingEntity_1 = require("./src/entities/settingEntity");
Object.defineProperty(exports, "SettingEntity", { enumerable: true, get: function () { return settingEntity_1.SettingEntity; } });
const credentialEntity_1 = require("./src/entities/credentialEntity");
Object.defineProperty(exports, "CredentialEntity", { enumerable: true, get: function () { return credentialEntity_1.CredentialEntity; } });
const encryptedWalletEntity_1 = require("./src/entities/encryptedWalletEntity");
Object.defineProperty(exports, "EncryptedWalletEntity", { enumerable: true, get: function () { return encryptedWalletEntity_1.EncryptedWalletEntity; } });
const eventLogEntity_1 = require("./src/entities/eventLogEntity");
Object.defineProperty(exports, "EventLogEntity", { enumerable: true, get: function () { return eventLogEntity_1.EventLogEntity; } });
const signatureEntity_1 = require("./src/entities/signatureEntity");
Object.defineProperty(exports, "SignatureEntity", { enumerable: true, get: function () { return signatureEntity_1.SignatureEntity; } });
const verifiableCredentialEntity_1 = require("./src/entities/verifiableCredentialEntity");
Object.defineProperty(exports, "VerifiableCredentialEntity", { enumerable: true, get: function () { return verifiableCredentialEntity_1.VerifiableCredentialEntity; } });
const cacheEntity_1 = require("./src/entities/cacheEntity");
Object.defineProperty(exports, "CacheEntity", { enumerable: true, get: function () { return cacheEntity_1.CacheEntity; } });
const interactionTokenEntity_1 = require("./src/entities/interactionTokenEntity");
Object.defineProperty(exports, "InteractionTokenEntity", { enumerable: true, get: function () { return interactionTokenEntity_1.InteractionTokenEntity; } });
const identityCacheEntity_1 = require("./src/entities/identityCacheEntity");
Object.defineProperty(exports, "IdentityCacheEntity", { enumerable: true, get: function () { return identityCacheEntity_1.IdentityCacheEntity; } });
exports.entityList = [
    settingEntity_1.SettingEntity,
    credentialEntity_1.CredentialEntity,
    encryptedWalletEntity_1.EncryptedWalletEntity,
    eventLogEntity_1.EventLogEntity,
    signatureEntity_1.SignatureEntity,
    verifiableCredentialEntity_1.VerifiableCredentialEntity,
    cacheEntity_1.CacheEntity,
    interactionTokenEntity_1.InteractionTokenEntity,
    identityCacheEntity_1.IdentityCacheEntity
];
var src_1 = require("./src");
Object.defineProperty(exports, "JolocomTypeormStorage", { enumerable: true, get: function () { return src_1.JolocomTypeormStorage; } });

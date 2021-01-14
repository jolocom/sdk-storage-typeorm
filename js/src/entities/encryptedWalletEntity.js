"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptedWalletEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const utils_1 = require("../utils");
let EncryptedWalletEntity = class EncryptedWalletEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ length: 100 }),
    tslib_1.__metadata("design:type", String)
], EncryptedWalletEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column("bigint", { transformer: [utils_1.numberTransformer] }),
    tslib_1.__metadata("design:type", Number)
], EncryptedWalletEntity.prototype, "timestamp", void 0);
tslib_1.__decorate([
    typeorm_1.Column("text"),
    tslib_1.__metadata("design:type", String)
], EncryptedWalletEntity.prototype, "encryptedWallet", void 0);
EncryptedWalletEntity = tslib_1.__decorate([
    typeorm_1.Entity('encrypted_wallet')
], EncryptedWalletEntity);
exports.EncryptedWalletEntity = EncryptedWalletEntity;

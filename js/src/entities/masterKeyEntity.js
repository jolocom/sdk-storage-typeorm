"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let MasterKeyEntity = class MasterKeyEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ length: 100 }),
    tslib_1.__metadata("design:type", String)
], MasterKeyEntity.prototype, "encryptedEntropy", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", Number)
], MasterKeyEntity.prototype, "timestamp", void 0);
MasterKeyEntity = tslib_1.__decorate([
    typeorm_1.Entity('master_keys')
], MasterKeyEntity);
exports.MasterKeyEntity = MasterKeyEntity;

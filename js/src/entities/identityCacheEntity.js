"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
let IdentityCacheEntity = class IdentityCacheEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn(),
    tslib_1.__metadata("design:type", String)
], IdentityCacheEntity.prototype, "key", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ nullable: false, type: 'simple-json' }),
    tslib_1.__metadata("design:type", Object)
], IdentityCacheEntity.prototype, "value", void 0);
IdentityCacheEntity = tslib_1.__decorate([
    typeorm_1.Entity('identityCache'),
    class_transformer_1.Expose()
], IdentityCacheEntity);
exports.IdentityCacheEntity = IdentityCacheEntity;

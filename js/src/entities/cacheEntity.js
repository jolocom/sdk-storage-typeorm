"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
let CacheEntity = class CacheEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn(),
    tslib_1.__metadata("design:type", String)
], CacheEntity.prototype, "key", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ nullable: false, type: 'simple-json' }),
    tslib_1.__metadata("design:type", Object)
], CacheEntity.prototype, "value", void 0);
CacheEntity = tslib_1.__decorate([
    typeorm_1.Entity('cache'),
    class_transformer_1.Expose()
], CacheEntity);
exports.CacheEntity = CacheEntity;

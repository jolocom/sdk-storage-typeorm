"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let SettingEntity = class SettingEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn(),
    tslib_1.__metadata("design:type", String)
], SettingEntity.prototype, "key", void 0);
tslib_1.__decorate([
    typeorm_1.Column('simple-json'),
    tslib_1.__metadata("design:type", Object)
], SettingEntity.prototype, "value", void 0);
SettingEntity = tslib_1.__decorate([
    typeorm_1.Entity('settings')
], SettingEntity);
exports.SettingEntity = SettingEntity;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let PersonaEntity = class PersonaEntity {
};
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], PersonaEntity.prototype, "controllingKeyPath", void 0);
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ length: 75 }),
    tslib_1.__metadata("design:type", String)
], PersonaEntity.prototype, "did", void 0);
PersonaEntity = tslib_1.__decorate([
    typeorm_1.Entity('personas')
], PersonaEntity);
exports.PersonaEntity = PersonaEntity;

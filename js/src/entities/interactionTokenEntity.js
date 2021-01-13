"use strict";
var InteractionTokenEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionTokenEntity = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const utils_1 = require("../utils");
let InteractionTokenEntity = InteractionTokenEntity_1 = class InteractionTokenEntity {
    static fromJWT(jwt) {
        return class_transformer_1.plainToClass(InteractionTokenEntity_1, {
            nonce: jwt.nonce,
            type: jwt.interactionType,
            issuer: jwt.issuer,
            timestamp: jwt.issued,
            original: jwt.encode(),
        });
    }
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], InteractionTokenEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], InteractionTokenEntity.prototype, "nonce", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], InteractionTokenEntity.prototype, "type", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], InteractionTokenEntity.prototype, "issuer", void 0);
tslib_1.__decorate([
    typeorm_1.Column("bigint", { transformer: [utils_1.numberTransformer] }),
    tslib_1.__metadata("design:type", Number)
], InteractionTokenEntity.prototype, "timestamp", void 0);
tslib_1.__decorate([
    typeorm_1.Column("text"),
    tslib_1.__metadata("design:type", String)
], InteractionTokenEntity.prototype, "original", void 0);
InteractionTokenEntity = InteractionTokenEntity_1 = tslib_1.__decorate([
    typeorm_1.Entity('interaction_tokens')
], InteractionTokenEntity);
exports.InteractionTokenEntity = InteractionTokenEntity;

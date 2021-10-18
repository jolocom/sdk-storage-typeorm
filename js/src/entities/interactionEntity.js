"use strict";
//import { plainToClass } from 'class-transformer'
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
/*
 *import {
 *  JSONWebToken,
 *} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
 * import { numberTransformer } from '../utils'
 */
const encryptedWalletEntity_1 = require("./encryptedWalletEntity");
const interactionTokenEntity_1 = require("./interactionTokenEntity");
let InteractionEntity = class InteractionEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], InteractionEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], InteractionEntity.prototype, "nonce", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], InteractionEntity.prototype, "type", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(type => encryptedWalletEntity_1.EncryptedWalletEntity, wallet => wallet.id, {
        onDelete: 'CASCADE'
    }),
    tslib_1.__metadata("design:type", encryptedWalletEntity_1.EncryptedWalletEntity)
], InteractionEntity.prototype, "owner", void 0);
tslib_1.__decorate([
    typeorm_1.OneToMany(type => interactionTokenEntity_1.InteractionTokenEntity, token => token.id),
    tslib_1.__metadata("design:type", Array)
], InteractionEntity.prototype, "tokens", void 0);
InteractionEntity = tslib_1.__decorate([
    typeorm_1.Entity('interactions')
], InteractionEntity);
exports.InteractionEntity = InteractionEntity;

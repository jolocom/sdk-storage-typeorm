"use strict";
var SignatureEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const verifiableCredentialEntity_1 = require("./verifiableCredentialEntity");
const class_transformer_1 = require("class-transformer");
let SignatureEntity = SignatureEntity_1 = class SignatureEntity {
    static fromJSON(json) {
        return class_transformer_1.plainToClass(SignatureEntity_1, json);
    }
    static fromLinkedDataSignature(lds) {
        const json = lds.toJSON();
        return this.fromJSON(json);
    }
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], SignatureEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(type => verifiableCredentialEntity_1.VerifiableCredentialEntity, vCred => vCred.proof, {
        onDelete: 'CASCADE'
    }),
    tslib_1.__metadata("design:type", verifiableCredentialEntity_1.VerifiableCredentialEntity)
], SignatureEntity.prototype, "verifiableCredential", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], SignatureEntity.prototype, "type", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", Date)
], SignatureEntity.prototype, "created", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], SignatureEntity.prototype, "creator", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], SignatureEntity.prototype, "nonce", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], SignatureEntity.prototype, "signatureValue", void 0);
SignatureEntity = SignatureEntity_1 = tslib_1.__decorate([
    typeorm_1.Entity('signatures'),
    typeorm_1.Unique(['verifiableCredential', 'signatureValue'])
], SignatureEntity);
exports.SignatureEntity = SignatureEntity;

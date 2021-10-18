"use strict";
var CredentialEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const verifiableCredentialEntity_1 = require("./verifiableCredentialEntity");
let CredentialEntity = CredentialEntity_1 = class CredentialEntity {
    static fromJSON(json) {
        return class_transformer_1.plainToClass(CredentialEntity_1, json);
    }
    // TODO Handle encryption
    static fromVerifiableCredential(vCred) {
        const credentialSection = vCred.claim;
        const presentClaims = Object.keys(credentialSection).find(k => k !== 'id');
        if (!presentClaims) {
            throw new Error('Only entry in the claim is the id.');
        }
        return convertClaimObjectToArray(credentialSection).map(el => this.fromJSON(el));
    }
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], CredentialEntity.prototype, "id", void 0);
tslib_1.__decorate([
    class_transformer_1.Type(() => verifiableCredentialEntity_1.VerifiableCredentialEntity),
    typeorm_1.ManyToOne(type => verifiableCredentialEntity_1.VerifiableCredentialEntity, vCred => vCred.claim, {
        onDelete: 'CASCADE'
    }),
    tslib_1.__metadata("design:type", verifiableCredentialEntity_1.VerifiableCredentialEntity)
], CredentialEntity.prototype, "verifiableCredential", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ length: 50 }),
    tslib_1.__metadata("design:type", String)
], CredentialEntity.prototype, "propertyName", void 0);
tslib_1.__decorate([
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], CredentialEntity.prototype, "propertyValue", void 0);
CredentialEntity = CredentialEntity_1 = tslib_1.__decorate([
    typeorm_1.Entity('credentials'),
    typeorm_1.Unique(['verifiableCredential', 'propertyName'])
], CredentialEntity);
exports.CredentialEntity = CredentialEntity;
const convertClaimObjectToArray = (claimSection) => Object.keys(claimSection)
    .filter(key => key !== 'id')
    .map(key => ({
    propertyName: key,
    propertyValue: claimSection[key],
}));

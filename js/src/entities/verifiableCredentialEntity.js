"use strict";
var VerifiableCredentialEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifiableCredentialEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const signedCredential_1 = require("jolocom-lib/js/credentials/signedCredential/signedCredential");
const encryptedWalletEntity_1 = require("./encryptedWalletEntity");
const signatureEntity_1 = require("./signatureEntity");
const credentialEntity_1 = require("./credentialEntity");
let VerifiableCredentialEntity = VerifiableCredentialEntity_1 = class VerifiableCredentialEntity {
    static fromJSON(json) {
        return class_transformer_1.plainToClass(VerifiableCredentialEntity_1, json);
    }
    // TODO typo
    static fromVerifiableCredential(vCred) {
        const json = vCred.toJSON();
        json.subject = vCred.subject;
        return this.fromJSON(json);
    }
    // TODO handle decryption
    toVerifiableCredential() {
        const json = class_transformer_1.classToPlain(this);
        const entityData = Object.assign(Object.assign({}, json), { claim: convertClaimArrayToObject(this.claim, this.subject.id), proof: this.proof[0] });
        return signedCredential_1.SignedCredential.fromJSON(entityData);
    }
};
tslib_1.__decorate([
    class_transformer_1.Expose({ name: '@context' }),
    typeorm_1.Column({ name: '@context', type: 'simple-json' }),
    tslib_1.__metadata("design:type", Object)
], VerifiableCredentialEntity.prototype, "_context", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.PrimaryColumn({ length: 50 }),
    tslib_1.__metadata("design:type", String)
], VerifiableCredentialEntity.prototype, "id", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.Column({ type: 'simple-array' }),
    tslib_1.__metadata("design:type", String)
], VerifiableCredentialEntity.prototype, "type", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.Column({ length: 20, nullable: true }),
    tslib_1.__metadata("design:type", String)
], VerifiableCredentialEntity.prototype, "name", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.Column({ length: 75 }),
    tslib_1.__metadata("design:type", String)
], VerifiableCredentialEntity.prototype, "issuer", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", Date)
], VerifiableCredentialEntity.prototype, "issued", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.Column({ nullable: true }),
    tslib_1.__metadata("design:type", Date)
], VerifiableCredentialEntity.prototype, "expires", void 0);
tslib_1.__decorate([
    class_transformer_1.Expose(),
    typeorm_1.ManyToOne(type => encryptedWalletEntity_1.EncryptedWalletEntity, wallet => wallet.id),
    tslib_1.__metadata("design:type", encryptedWalletEntity_1.EncryptedWalletEntity)
], VerifiableCredentialEntity.prototype, "subject", void 0);
tslib_1.__decorate([
    typeorm_1.OneToMany(type => signatureEntity_1.SignatureEntity, sig => sig.verifiableCredential, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    tslib_1.__metadata("design:type", Array)
], VerifiableCredentialEntity.prototype, "proof", void 0);
tslib_1.__decorate([
    typeorm_1.OneToMany(type => credentialEntity_1.CredentialEntity, cred => cred.verifiableCredential, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    tslib_1.__metadata("design:type", Array)
], VerifiableCredentialEntity.prototype, "claim", void 0);
VerifiableCredentialEntity = VerifiableCredentialEntity_1 = tslib_1.__decorate([
    class_transformer_1.Exclude(),
    typeorm_1.Entity('verifiable_credentials')
], VerifiableCredentialEntity);
exports.VerifiableCredentialEntity = VerifiableCredentialEntity;
const convertClaimArrayToObject = (claims, did) => claims.reduce((acc, claim) => {
    const { propertyName, propertyValue } = claim;
    return Object.assign(Object.assign({}, acc), { [propertyName]: propertyValue });
}, { id: did });

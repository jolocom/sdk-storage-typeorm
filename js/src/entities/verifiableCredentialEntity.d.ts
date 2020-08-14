import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential';
import { ISignedCredentialAttrs } from 'jolocom-lib/js/credentials/signedCredential/types';
import { EncryptedWalletEntity } from './encryptedWalletEntity';
import { SignatureEntity } from './signatureEntity';
import { CredentialEntity } from './credentialEntity';
export declare class VerifiableCredentialEntity {
    _context: any;
    id: string;
    type: string;
    name: string;
    issuer: string;
    issued: Date;
    expires: Date;
    subject: EncryptedWalletEntity;
    proof: SignatureEntity[];
    claim: CredentialEntity[];
    static fromJSON(json: ISignedCredentialAttrs): VerifiableCredentialEntity;
    static fromVerifiableCredential(vCred: SignedCredential): VerifiableCredentialEntity;
    toVerifiableCredential(): SignedCredential;
}

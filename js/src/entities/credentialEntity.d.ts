import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential';
import { VerifiableCredentialEntity } from './verifiableCredentialEntity';
interface JsonAttributes {
    propertyName: string;
    propertyValue: string;
}
export declare class CredentialEntity {
    id: number;
    verifiableCredential: VerifiableCredentialEntity;
    propertyName: string;
    propertyValue: string;
    static fromJSON(json: JsonAttributes): CredentialEntity;
    static fromVerifiableCredential(vCred: SignedCredential): CredentialEntity[];
}
export {};

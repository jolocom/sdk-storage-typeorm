import { VerifiableCredentialEntity } from './verifiableCredentialEntity';
import { ILinkedDataSignature, ILinkedDataSignatureAttrs } from 'jolocom-lib/js/linkedDataSignature/types';
export declare class SignatureEntity {
    id: number;
    verifiableCredential: VerifiableCredentialEntity;
    type: string;
    created: Date;
    creator: string;
    nonce: string;
    signatureValue: string;
    static fromJSON(json: ILinkedDataSignatureAttrs): SignatureEntity;
    static fromLinkedDataSignature(lds: ILinkedDataSignature): SignatureEntity;
}

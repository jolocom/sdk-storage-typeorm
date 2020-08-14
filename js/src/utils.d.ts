import { CredentialEntity } from './entities/credentialEntity';
/**
 * Given an array of Credential Entities, will attempt to group them by
 * the credential they are part of, and return a sumarry, contain a key name
 * and an array of aggregated values
 *
 * TODO this function must be changed to use vanilla types, NOT entities
 * this is the only thing making the sdk dependant on local entity definitions
 *
 * @param credentials - Credential Entities to group. If all claims are part of different
 * credentials, the array is returned unmodified
 */
export declare const groupAttributesByCredentialId: (credentials: CredentialEntity[]) => {
    propertyValue: string[];
    id: number;
    verifiableCredential: import("..").VerifiableCredentialEntity;
    propertyName: string;
}[];

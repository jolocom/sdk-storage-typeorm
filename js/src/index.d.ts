import { InteractionTokenEntity } from './entities/interactionTokenEntity';
import { IStorage, EncryptedWalletAttributes, QueryOptions, CredentialQuery, InteractionTokenQuery, InteractionQuery, InteractionQueryAttrs } from '@jolocom/sdk/js/storage';
import { Connection, SelectQueryBuilder } from 'typeorm';
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential';
import { CredentialOfferMetadata, CredentialOfferRenderInfo } from 'jolocom-lib/js/interactionTokens/interactionTokens.types';
import { InternalDb } from '@jolocom/local-resolver-registrar/js/db';
import { JWTEncodable, JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken';
import { Identity } from 'jolocom-lib/js/identity/identity';
import { IdentitySummary } from '@jolocom/sdk';
export interface PersonaAttributes {
    did: string;
    controllingKeyPath: string;
}
/**
 * @todo IdentitySummary is a UI type, which can always be
 * derived from a DID Doc and Public Profile.
 * Perhaps that's what we should store instead, since those
 * are more generic and can be reused.
 */
export declare class JolocomTypeormStorage implements IStorage {
    private connection;
    store: {
        setting: (key: string, value: any) => Promise<void>;
        verifiableCredential: (vCred: SignedCredential) => Promise<void>;
        encryptedWallet: (args: EncryptedWalletAttributes) => Promise<void>;
        credentialMetadata: (credentialMetadata: CredentialMetadataSummary) => Promise<void>;
        issuerProfile: (issuer: IdentitySummary) => Promise<void>;
        identity: (identity: Identity) => Promise<void>;
        interactionToken: (token: JSONWebToken<JWTEncodable>) => Promise<void>;
    };
    get: {
        settingsObject: () => Promise<{
            [key: string]: any;
        }>;
        setting: (key: string) => Promise<any>;
        verifiableCredential: (query?: import("@jolocom/sdk/js/storage").CredentialQueryAttrs | import("@jolocom/sdk/js/storage").CredentialQueryAttrs[] | undefined, queryOpts?: QueryOptions | undefined) => Promise<SignedCredential[]>;
        attributesByType: (type: string[]) => Promise<{
            type: string[];
            results: {
                verification: any;
                values: any;
                fieldName: any;
            }[];
        }>;
        vCredentialsByAttributeValue: (attribute: string, queryOptions?: QueryOptions | undefined) => Promise<SignedCredential[]>;
        encryptedWallet: (id?: string | undefined) => Promise<EncryptedWalletAttributes | null>;
        credentialMetadata: ({ issuer, type: credentialType, }: SignedCredential) => Promise<any>;
        publicProfile: (did: string) => Promise<IdentitySummary>;
        identity: (did: string) => Promise<Identity | undefined>;
        interactionTokens: (query: InteractionTokenQuery, queryOptions?: QueryOptions | undefined) => Promise<JSONWebToken<JWTEncodable>[]>;
        interactionIds: (query?: InteractionQueryAttrs | InteractionQueryAttrs[] | undefined, queryOptions?: QueryOptions | undefined) => Promise<any[]>;
    };
    delete: {
        verifiableCredential: (id: string) => Promise<void>;
        identity: (did: string) => Promise<void>;
        encryptedWallet: (did: string) => Promise<void>;
        verifiableCredentials: (query: CredentialQuery) => Promise<void>;
        interactions: (query?: InteractionQueryAttrs | InteractionQueryAttrs[] | undefined) => Promise<void>;
    };
    constructor(conn: Connection);
    private getSettingsObject;
    private getSetting;
    private saveSetting;
    private getVCredential;
    private getAttributesByType;
    private getVCredentialsForAttribute;
    private getEncryptedWallet;
    private findTokens;
    private findInteractionIds;
    private getMetadataForCredential;
    private getPublicProfile;
    private getCachedIdentity;
    private storeEncryptedWallet;
    private storeCredentialMetadata;
    private storeIssuerProfile;
    private cacheIdentity;
    private storeInteractionToken;
    private storeVClaim;
    private deleteIdentity;
    private deleteEncryptedWallet;
    private deleteVCred;
    private deleteVCreds;
    _buildInteractionQueryBuilder(query?: InteractionQuery, options?: QueryOptions): SelectQueryBuilder<InteractionTokenEntity>;
    private _applyQueryOptions;
    _applyInteractionQuery(qb: SelectQueryBuilder<InteractionTokenEntity>, query?: InteractionQuery): SelectQueryBuilder<InteractionTokenEntity>;
    private deleteInteractions;
    private readEventLog;
    private appendEvent;
    private deleteEventLog;
    eventDB: InternalDb;
}
export interface CredentialMetadata {
    type: string;
    renderInfo: CredentialOfferRenderInfo;
    metadata: CredentialOfferMetadata;
}
export interface CredentialMetadataSummary extends CredentialMetadata {
    issuer: IdentitySummary;
}

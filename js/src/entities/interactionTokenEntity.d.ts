import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken';
export declare class InteractionTokenEntity {
    id: number;
    nonce: string;
    type: string;
    issuer: string;
    timestamp: number;
    original: string;
    static fromJWT(jwt: JSONWebToken<any>): InteractionTokenEntity;
}

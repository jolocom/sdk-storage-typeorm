import { EncryptedWalletEntity } from './encryptedWalletEntity';
import { InteractionTokenEntity } from './interactionTokenEntity';
export declare class InteractionEntity {
    id: number;
    nonce: string;
    type: string;
    owner: EncryptedWalletEntity;
    tokens: InteractionTokenEntity[];
}

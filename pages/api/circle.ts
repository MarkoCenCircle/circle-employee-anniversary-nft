import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { initiateSmartContractPlatformClient } from '@circle-fin/smart-contract-platform';

export const CIRCLE_NFT_CONTRACT_ID = '0190ba51-42fc-7ab3-a022-46fd64ad3f45';
export const CIRCLE_NFT_CONTRACT_ADDRESS = '0xd11eb0bb91aabfb7c0301795be00a23837a79ea7';
export const CIRCLE_NFT_MINTER_WALLET_ID = '0c3d2384-0f01-55e5-891f-1d7df9ec3e13';
export const CIRCLE_EMPLOYEE_NFTS_WALLET_SET_ID = 'e025e5af-929b-57a3-968b-802a314b26bf';
export const CREATE_SIGNUP_IDP_KEY_UUID_NAMESPACE: string = '11c3d5a1-2c77-4f33-9133-bb3e0abb98bd';


export function getDevWalletsClient() {
    if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
        throw new Error('Invalid Circle SDK Configuration');
    }
    return initiateDeveloperControlledWalletsClient({
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
        apiKey: process.env.CIRCLE_API_KEY
    })
}

export function getSmartContractPlatformClient() {
    if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
        throw new Error('Invalid Circle SDK Configuration');
    }
    return initiateSmartContractPlatformClient({
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
        apiKey: process.env.CIRCLE_API_KEY
    })
}

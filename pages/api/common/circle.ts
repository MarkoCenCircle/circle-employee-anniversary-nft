import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { initiateSmartContractPlatformClient } from '@circle-fin/smart-contract-platform';

// Note: if you are updating the NFT contract, make sure to update the entity monitored tokens too
export const CIRCLE_NFT_CONTRACT_ID = '0190c683-eccb-776c-bd24-e64d7f4074b1';
export const CIRCLE_NFT_CONTRACT_ADDRESS = '0x9dea7821dd0957dc02751bf48f50429a9751cdc9';

export const CIRCLE_NFT_MINTER_WALLET_ID = '0c3d2384-0f01-55e5-891f-1d7df9ec3e13';
export const CIRCLE_EMPLOYEE_NFTS_WALLET_SET_ID = 'e025e5af-929b-57a3-968b-802a314b26bf';
export const CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE = 'f818de74-e307-4251-9900-204172912dc7';


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

export async function getNftOwnerCompanySummary() {
    const circleScpClient = getSmartContractPlatformClient();

    const readContractResp = await circleScpClient.readContract({
        id: CIRCLE_NFT_CONTRACT_ID,
        abiFunctionSignature: "getCompanySummary()"
    })
    return readContractResp.data?.outputValues;
}

export async function getNftOwnerCompanyFoundingDate(): Promise<number> {
    const circleScpClient = getSmartContractPlatformClient();

    const readContractResp = await circleScpClient.readContract({
        id: CIRCLE_NFT_CONTRACT_ID,
        abiFunctionSignature: "companyFoundingDate()"
    })
    return readContractResp.data?.outputValues?.[0];
}

export async function mintNftsHelper(idempotencyKey: string, nftTokenIds: number[], userWalletAddress: string) {
    const circlePwClient = getDevWalletsClient();
    const nftTokenAmounts = nftTokenIds.map(() => 1);       // Mint one nft for each nftTokenId

    // ERC-1155 batch mint contract execution from dev controlled wallet
    const res = await circlePwClient.createContractExecutionTransaction({
        idempotencyKey: idempotencyKey,
        walletId: CIRCLE_NFT_MINTER_WALLET_ID,
        fee: {
            type: 'level',
            config: {
                feeLevel: 'MEDIUM',
            },
        },
        contractAddress: CIRCLE_NFT_CONTRACT_ADDRESS,

        abiFunctionSignature: "mintBatch(address,uint256[],uint256[],bytes)",
        abiParameters: [
            userWalletAddress,
            nftTokenIds,
            nftTokenAmounts,
            "0x01"      // Random data ("0x00" was giving an error for some reason)
        ],
    });

    console.log("PW NFT mint call details: ", res.data);
    if (!res.data || res.data?.state === 'FAILED') {
        throw new Error(`Failed to mint NFTs to user wallet ${userWalletAddress}`)
    }
    return res.data?.state === 'INITIATED'
}
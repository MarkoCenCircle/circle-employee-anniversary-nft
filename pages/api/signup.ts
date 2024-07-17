import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { User } from '@prisma/client'
import {
    getDevWalletsClient,
    CREATE_SIGNUP_IDP_KEY_UUID_NAMESPACE,
    CIRCLE_EMPLOYEE_NFTS_WALLET_SET_ID,
    CIRCLE_NFT_MINTER_WALLET_ID,
    CIRCLE_NFT_CONTRACT_ADDRESS
} from './circle';
import { v5 as uuidv5 } from 'uuid';
import { Wallet } from "@circle-fin/developer-controlled-wallets/dist/types/clients/developer-controlled-wallets";
import prisma from '../../prisma'
import { getYearsElapsed, dateToUnixSeconds } from './utils/time'

// Attempts to batch create Circleversary NFTs. Returns whether or not the initial request succeeded.
//  Note: it is still possible for the request to fail async on-chain. 
async function mintWorkAnniversaryNfts(user: User, userWallet: Wallet): Promise<boolean> {
    const circlePwClient = getDevWalletsClient();
    const numYearsEmployed = getYearsElapsed(user.employmentStartDate)

    const tokenIds: number[] = [];
    const nftTokenAmounts: number[] = [];

    for (let i = 0; i <= numYearsEmployed; i++) {
        // Token ID i corresponds to the employee's <i>-versary
        tokenIds.push(i);
        nftTokenAmounts.push(1);
    }

    const res = await circlePwClient.createContractExecutionTransaction({
        idempotencyKey: uuidv5(numYearsEmployed + user.email, CREATE_SIGNUP_IDP_KEY_UUID_NAMESPACE),
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
            userWallet.address,
            tokenIds,
            nftTokenAmounts,
            "0x01"
        ],
    });

    const didFail = !res.data || res.data.state === 'FAILED'
    if (!didFail) {
        console.log(`Creating NFT(s) for user ${user.id}'s ${numYearsEmployed}-year work anniversary. PW tx details: `, res.data)
    }
    return !didFail;
}


const signupHandler: NextApiHandler<void> = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    if (req.method === 'POST') {
        // Request body validation. For testing purposes, skipping the +alias de-duping validation for now.
        if (!req.body.email || !req.body.email.includes("@circle.com")) {
            res.status(400).end('Invalid email')
            return
        }

        // Query DB to see if user has already signed up
        let user = await prisma.user.findFirst({
            where: { email: req.body.email }
        })
        if (user) {
            console.log(`User ${user.id} has already signed up. Updating details and searching for new unlocked NFTs.`)
        }

        // Create wallet to hold user's NFTs
        const circlePwClient = getDevWalletsClient();
        const userWallets = await circlePwClient.createWallets({
            idempotencyKey: uuidv5(req.body.email, CREATE_SIGNUP_IDP_KEY_UUID_NAMESPACE),
            blockchains: ["MATIC"],
            accountType: "EOA",
            count: 1,
            walletSetId: CIRCLE_EMPLOYEE_NFTS_WALLET_SET_ID
        });
        if (!userWallets.data) {
            res.status(500).end('Unable to create user wallet')
            return
        }
        const userWallet = userWallets.data.wallets[0];

        // Upsert DB record of user
        const employmentStartDate = new Date(req.body.joinDate * 1000);

        user = await prisma.user.upsert({
            where: {
                email: req.body.email,
            },
            update: {
                position: req.body.position,
                employmentStartDate: employmentStartDate,
                circleWalletId: userWallet.id,
            },
            create: {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                position: req.body.position,
                employmentStartDate: employmentStartDate,
                circleWalletId: userWallet.id
            },
        })

        // Mint work anniversary NFTs for user based on their employmentStartDate
        if (!await mintWorkAnniversaryNfts(user, userWallet)) {
            res.status(500).end('Unable to create user work anniversary NFTs')
            return
        }

        // Build and return response
        res.json({
            userId: user.id,
            email: user.email,
            walletAddress: userWallet.address,
            joinDate: dateToUnixSeconds(employmentStartDate)
        })
    } else {
        res.status(405).end('Method Not Allowed')
    }
}

export default signupHandler

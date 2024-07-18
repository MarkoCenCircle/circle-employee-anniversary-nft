import type { NextApiHandler } from "next"
import { UnredeemedNft, User, Nft } from '@prisma/client'
import {
    mintNftsHelper,
    getDevWalletsClient,
    CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE,
    CIRCLE_NFT_MINTER_WALLET_ID,
    CIRCLE_NFT_CONTRACT_ADDRESS
} from './common/circle';
import { v5 as uuidv5 } from 'uuid';
import prisma from '../../prisma'
import { getYearsElapsed } from './common/time'
import { verifyAuthorizationHeader } from './common/auth'

export const CIRCLEVERSARY_LIMIT = 10

// Attempts to batch create Circleversary NFTs. Returns whether or not the initial request succeeded.
//  Note: it is still possible for the request to fail async on-chain.
async function mintWorkAnniversaryNfts(user: User, userWalletAddress: string): Promise<boolean> {
    let numYearsEmployed = getYearsElapsed(user.employmentStartDate)
    numYearsEmployed = Math.min(numYearsEmployed, CIRCLEVERSARY_LIMIT)

    const nftTokenIds: number[] = [];
    for (let i = 0; i <= numYearsEmployed; i++) {
        // Token ID i corresponds to the employee's <i>-versary
        nftTokenIds.push(i);
    }

    // We only need to remint if the number of years the user was employed has changed
    const idempotencyKey = uuidv5(numYearsEmployed + user.email, CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE)
    const didMintNewNfts = await mintNftsHelper(idempotencyKey, nftTokenIds, userWalletAddress)

    if (didMintNewNfts) {
        console.log(`Creating NFT(s) for user ${user.id}'s ${numYearsEmployed}-year work anniversary.`)
    }
    return didMintNewNfts;
}

async function mintDbUnredeemedNfts(userWalletAddress: string, userUnredeemedNfts: (UnredeemedNft & { nft: Nft })[]) {
    if (userUnredeemedNfts.length == 0) { return false }
    const nftTokenIds = userUnredeemedNfts.map(n => n.nft.tokenId)

    // Construct idempotency key based on IDs on NFT tokens pending for user
    const serOrderedNftIds = nftTokenIds.sort().join("-")
    const idempotencyKey = uuidv5(serOrderedNftIds + userWalletAddress, CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE)

    // Mint NFTs and return result
    const didMintNewNfts = await mintNftsHelper(idempotencyKey, nftTokenIds, userWalletAddress)
    if (didMintNewNfts) {
        console.log(`Creating NFTs ${nftTokenIds} for user wallet ${userWalletAddress}.`)
    }
    return didMintNewNfts;
}

const redeemNftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'POST') {
        // Verify authorization headers
        const userId = verifyAuthorizationHeader(req.headers.authorization)
        if (!userId) {
            res.status(401).end('Missing or invalid authorization')
            return
        }

        // Update user status to verified and fetch user
        let user: User
        try {
            user = await prisma.user.update({
                where: { id: userId },
                data: { isVerified: true }
            })
        } catch (err) {
            // @ts-ignore record not found error, see https://www.prisma.io/docs/orm/reference/error-reference#error-codes
            if (err.code === "P2001") {
                res.status(404).end(`User with ID ${userId} specified in JWT not found in DB`)
            }
            res.status(500).end({ msg: "Encountered error while updating user profile", error: err })
            return
        }

        // Get user wallet address
        const circlePwClient = getDevWalletsClient();
        const userWallet = await circlePwClient.getWallet({
            id: user.circleWalletId
        });
        if (!userWallet.data) {
            res.status(404).end('Unable to find user wallet in Circle SDKs')
            return
        }
        const userWalletAddress = userWallet.data.wallet.address;

        // Mint Circleversary NFTs
        let didMintCircleversaryNfts = false
        try {
            didMintCircleversaryNfts = await mintWorkAnniversaryNfts(user, userWalletAddress);
        } catch (err) {
            res.status(500).end(`Encountered error while trying to mint Circleversary NFTs for user ${user.id}`)
            return
        }

        // Mint pending NFTs from DB
        let didMintDbNfts = false
        const userUnredeemedNfts = await prisma.unredeemedNft.findMany({
            where: { email: user.email },
            include: { nft: true }
        })
        try {
            didMintDbNfts = await mintDbUnredeemedNfts(userWalletAddress, userUnredeemedNfts);
        } catch (err) {
            res.status(500).end(`Encountered error while trying to mint unredeemed NFTs from DB for user ${user.id}`)
            return
        }

        // We are optimistically assuming the DB unreedemed NFT mints will succeed. In reality, these could fail on-chain
        //  and we would have out-of-sync DB data here.
        if (didMintDbNfts) {
            const updateNfts = await prisma.unredeemedNft.updateMany({
                where: { email: user.email },
                data: { redeemDate: new Date() }
            })
            console.log(`Marked ${updateNfts.count} as redeemed for user ${user.id}`);
        }

        // Build and send API response
        res.json({ 
            userId: user.id,
            didMintNewNfts: didMintCircleversaryNfts || didMintDbNfts
        })
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default redeemNftsHandler
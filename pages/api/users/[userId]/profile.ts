import type { NextApiHandler } from "next";
import { getDevWalletsClient } from '../../circle';
import { NftResponse } from '../../nfts/[nftContractAddress]/[nftTokenId]'
import prisma from '../../../../prisma'
import { dateToUnixSeconds } from '../../utils/time'

type ProfileResponse = {
    userId: number
    email: string
    firstName: string
    lastName: string
    joinDate: number

    walletAddress: string
    nfts: NftResponse[];
};

const nftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    // Parse path parameters
    const { userId: userIdStr } = req.query;

    if (req.method === 'GET') {
        // Parse and validate path parameters
        if (!userIdStr || typeof userIdStr !== "string") {
            res.status(400).end('Invalid user ID path parameter')
            return
        }
        let userId: number
        try {
            userId = parseInt(userIdStr)
        } catch (err) {
            res.status(400).end('Unable to parse user ID path parameter as number')
            return
        }

        // Find user in DB
        let user = await prisma.user.findFirst({
            where: { id: userId }
        })
        if (!user) {
            res.status(404).end('User not found')
            return
        }

        // Get wallet address
        const circlePwClient = getDevWalletsClient();
        const userWallet = await circlePwClient.getWallet({
            id: user.circleWalletId
        });
        if (!userWallet.data) {
            res.status(500).end('Unable to find user wallet in Circle SDKs')
            return
        }
        const walletAddress = userWallet.data?.wallet.address;

        // Get token balances from Circle SDK
        const walletNftBalances = await circlePwClient.getWalletNFTBalance({
            id: user.circleWalletId
        })
        if (!walletNftBalances.data) {
            res.status(500).end('Unable to find user wallet')
            return
        }
        console.log(`Retrieved ${walletNftBalances.data.nfts?.length ?? 0} NFTs from PW for wallet ${user.circleWalletId}`)

        // Annotate NFT with details from DB
        let nftsResponse: NftResponse[] = []
        if (walletNftBalances.data.nfts) {
            // TODO: optimize
            await Promise.all(walletNftBalances.data.nfts.map(async (pwNft) => {
                const nftMetadata = await prisma.nft.findFirst({
                    where: {
                        tokenAddress: pwNft.token.tokenAddress,
                        tokenId: parseInt(pwNft.nftTokenId)
                    }
                })
                if (!nftMetadata) return

                nftsResponse.push({
                    address: nftMetadata.tokenAddress,
                    tokenId: nftMetadata.tokenId,
                    title: nftMetadata.title,
                    description: nftMetadata.description,
                    imageUrl: nftMetadata.imageUrl
                })
            }))
        }

        // Build and send response
        const response: ProfileResponse = {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            joinDate: dateToUnixSeconds(user.employmentStartDate),

            walletAddress: walletAddress,
            nfts: nftsResponse
        };
        res.json(response)
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

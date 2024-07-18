import type { NextApiHandler } from "next";
import { getNftOwnerCompanySummary } from '../../common/circle'
import prisma from '../../../../prisma'
import {NftResponse} from "@/models/userProfile";


const nftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'GET') {
        // Parse and validate path parameters
        const { nftContractAddress, nftTokenId } = req.query;
        if (!nftContractAddress || typeof nftContractAddress !== "string") {
            res.status(400).end('Invalid nft token address parameter parameter')
            return
        }
        if (!nftTokenId || typeof nftTokenId !== "string") {
            res.status(400).end('Invalid nft token ID parameter parameter')
            return
        }

        // Query DB for token metadata
        const nft = await prisma.nft.findUnique({
            where: {
                tokenAddress_tokenId: {
                    tokenAddress: nftContractAddress,
                    tokenId: parseInt(nftTokenId)
                }
            }
        })
        if (!nft) {
            res.status(404).end('No metadata found for the given NFT')
            return
        }

        // Query NFT smart contract for company info
        const companySummary = await getNftOwnerCompanySummary();

        // Build and send response
        const response: NftResponse = {
            address: nft.tokenAddress,
            tokenId: nft.tokenId,
            title: nft.title,
            description: nft.description,
            imageUrl: nft.imageUrl,

            // @ts-ignore
            ownerCompanyInfo: companySummary
        };
        res.json(response)
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

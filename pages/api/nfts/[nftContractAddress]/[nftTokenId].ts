import type { NextApiHandler } from "next";
import { getSmartContractPlatformClient, CIRCLE_NFT_CONTRACT_ID } from '../../circle'
import prisma from '../../../../prisma'

export type NftResponse = {
    address: string
    tokenId: number
    imageUrl: string
    title: string | null
    description: string | null
    ownerCompanyInfo?: NftCompanyOwnerResponse
};

type NftCompanyOwnerResponse = {
    companyName: string
    companyDomain: string
    companyFoundingDate: number
}

async function getNftOwnerCompanySummary() {
    const circleScpClient = getSmartContractPlatformClient();

    // TODO: replace with single contract read call to get the company summary
    const abiFunctionCalls = [
        'companyName()',
        'companyDomain()',
        'companyFoundingDate()',
    ];
    const contractReadRes = await Promise.all(abiFunctionCalls.map(
        async abiFuncSig => {
            // TODO: replace with queryContract function once it becomes available on the SDK
            const readContractResp = await circleScpClient.readContract({
                id: CIRCLE_NFT_CONTRACT_ID,
                abiFunctionSignature: abiFuncSig
            })
            return readContractResp.data?.outputValues?.[0]
        }
    ))

    return contractReadRes
}

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
        const nft = await prisma.nft.findFirst({
            where: {
                tokenAddress: nftContractAddress,
                tokenId: parseInt(nftTokenId)
            }
        })
        if (!nft) {
            res.status(404).end('No metadata found for the given NFT')
            return
        }

        // Query NFT smart contract for company info
        const [companyName, companyDomain, companyFoundingDate] = await getNftOwnerCompanySummary()

        // Build and send response
        const response: NftResponse = {
            address: nft.tokenAddress,
            tokenId: nft.tokenId,
            title: nft.title,
            description: nft.description,
            imageUrl: nft.imageUrl,

            ownerCompanyInfo: {
                companyName: companyName,
                companyDomain: companyDomain,
                companyFoundingDate: parseInt(companyFoundingDate)
            }
        };
        res.json(response)
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

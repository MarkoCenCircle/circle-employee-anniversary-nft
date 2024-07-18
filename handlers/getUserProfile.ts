import prisma from "@/prisma";
import {getDevWalletsClient} from "@/pages/api/common/circle";
import {dateToUnixSeconds} from "@/pages/api/common/time";
import { HttpResponseWrapper } from "@/models/httpResponse";
import { NftResponse, ProfileResponse } from "@/models/userProfile";

interface Input {
  userId: number
}

export const getUserProfile = async ({ userId }: Input): Promise<HttpResponseWrapper<ProfileResponse>> => {
  let user = await prisma.user.findUnique({
    where: { 
        id: userId,
        isVerified: true
    }
  })

  if (!user) {
    return { httpStatus: 404, errMsg: 'User not found' }
  }

  // Get wallet address
  const circlePwClient = getDevWalletsClient();

  const userWallet = await circlePwClient.getWallet({
    id: user.circleWalletId
  });

  if (!userWallet.data) {
    return { httpStatus: 404, errMsg: 'Unable to find user wallet in Circle SDKs' }
  }

  const walletAddress = userWallet.data?.wallet.address;

  // TODO future: need to handle pagination if we reach > 50 NFTs per wallet
  // Get token balances from Circle SDK
  const walletNftBalances = await circlePwClient.getWalletNFTBalance({
    id: user.circleWalletId,
    pageSize: 50
  })
  if (!walletNftBalances.data) {
    return { httpStatus: 404, errMsg: 'Unable to find user wallet' }
  }

  console.log(`Retrieved ${walletNftBalances.data.nfts?.length ?? 0} NFTs from PW for wallet ${user.circleWalletId}`)

  // Annotate NFT with details from DB
  let nftsResponse: NftResponse[] = []

  if (walletNftBalances.data.nfts) {
    // TODO future: optimize
    await Promise.all(walletNftBalances.data.nfts.map(async (pwNft) => {
      if (!pwNft.token.tokenAddress) return
      const nftMetadata = await prisma.nft.findUnique({
        where: {
            tokenAddress_tokenId: {
                tokenAddress: pwNft.token.tokenAddress,
                tokenId: parseInt(pwNft.nftTokenId)
            }
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
    return {
        httpStatus: 200,
        data: {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position ?? undefined,
            joinDate: dateToUnixSeconds(user.employmentStartDate),

            walletAddress: walletAddress,
            nfts: nftsResponse,
        },
    };
}

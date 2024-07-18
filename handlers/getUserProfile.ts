import prisma from "@/prisma";
import {getDevWalletsClient} from "@/pages/api/circle";
import {dateToUnixSeconds} from "@/pages/api/utils/time";
import {NftResponse, ProfileResponse} from "@/models/userProfile";

interface Input {
  userId: number
}

export const getUserProfile = async ({ userId }: Input): Promise<ProfileResponse> => {
  let user = await prisma.user.findFirst({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('user not found')
  }

  // Get wallet address
  const circlePwClient = getDevWalletsClient();

  const userWallet = await circlePwClient.getWallet({
    id: user.circleWalletId
  });

  if (!userWallet.data) {
    throw new Error('Unable to find user wallet in Circle SDKs')
  }

  const walletAddress = userWallet.data?.wallet.address;

  // Get token balances from Circle SDK
  const walletNftBalances = await circlePwClient.getWalletNFTBalance({
    id: user.circleWalletId
  })
  if (!walletNftBalances.data) {
    throw new Error('Unable to find user wallet')
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
  return {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    joinDate: dateToUnixSeconds(user.employmentStartDate),
    walletAddress: walletAddress,
    nfts: nftsResponse
  };
}

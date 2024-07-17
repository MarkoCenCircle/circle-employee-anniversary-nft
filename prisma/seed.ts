// Using seed strategy documented in https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import { PrismaClient } from '@prisma/client'
import { CIRCLE_NFT_CONTRACT_ADDRESS } from '../pages/api/circle'

const prisma = new PrismaClient()

const NUM_CIRCLEVERSARY_NFTS = 10;

async function seedFirstDayNft() {
    const nftTitle = `First Day at Circle`
    const nftDescription = `Given to employees of Circle on their first day.`

    // TODO: replace this image with Adam's NFT images
    const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/0.png`;

    const createdNft = await seedCircleNftHelper(0, nftTitle, nftDescription, nftImageUrl);
    console.log("Created ", createdNft);
}

// Seed NFT metadata for Circleversary NFTs
async function seedCircleversaryNfts() {
    console.log("Beginning Circleversary NFT metadata seeding process");
    for (let i = 1; i <= NUM_CIRCLEVERSARY_NFTS; i++) {
        const nftTitle = `${i}-year Circleversary`
        const nftDescription = `Given to employees of Circle who have worked at the company for at least ${i} year.`

        // TODO: replace this image with Adam's NFT images
        const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${i}.png`;

        const createdNft = await seedCircleNftHelper(i, nftTitle, nftDescription, nftImageUrl);
        console.log("Created ", createdNft);
    }
}

async function seedCircleNftHelper(nftTokenId: number, nftTitle: string, nftDescription: string, nftImageUrl: string) {
    return await prisma.nft.upsert({
        where: {
            tokenAddress_tokenId: {
                tokenAddress: CIRCLE_NFT_CONTRACT_ADDRESS,
                tokenId: nftTokenId
            }
        },
        update: {
            title: nftTitle,
            description: nftDescription,
            imageUrl: nftImageUrl,
        },
        create: {
            tokenAddress: CIRCLE_NFT_CONTRACT_ADDRESS,
            tokenId: nftTokenId,
            title: nftTitle,
            description: nftDescription,
            imageUrl: nftImageUrl,
        }
    })
}

async function main() {
    await Promise.all([
        seedFirstDayNft(),
        seedCircleversaryNfts(),
    ]);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

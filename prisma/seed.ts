// Using seed strategy documented in https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import { PrismaClient } from '@prisma/client'
import { CIRCLE_NFT_CONTRACT_ADDRESS } from '../pages/api/common/circle'

const prisma = new PrismaClient()

const NUM_CIRCLEVERSARY_NFTS = 10;
const JUL_2024_HACKATHON_PARTICIPANT_NFT_TOKEN_ID = 101;
const JUL_2024_HACKATHON_ORGANIZER_NFT_TOKEN_ID = 102;
const APP_FOUNDING_TEAM_NFT_TOKEN_ID = 103;
const BUDDING_WEB3_DEV_NFT_TOKEN_ID = 10000;

async function seedBuddingWeb3DevNft() {
    const nftTitle = `Budding Web3 Developer`
    const nftDescription = `Given to those who successfully execute mintWeb3BuddingDevNft(address) function on the Circle Achievement NFT contract (with their user wallet address as the argument). Can be done via any Web3 ecosystem tool. Note: you need to send 0.05 MATIC along with the contract execution (should only be a few cents).`
    const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${BUDDING_WEB3_DEV_NFT_TOKEN_ID}.png`;

    const nft = await seedNftMetadataHelper(BUDDING_WEB3_DEV_NFT_TOKEN_ID, nftTitle, nftDescription, nftImageUrl);
    console.log("Upserted nft ", nft);
}

async function seedFirstDayNft() {
    const nftTitle = `First Day at Circle`
    const nftDescription = `Given to employees of Circle on their first day.`
    const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/0.png`;

    const nft = await seedNftMetadataHelper(0, nftTitle, nftDescription, nftImageUrl);
    console.log("Upserted nft ", nft);
}

async function seedCircleversaryNfts() {
    console.log("Beginning Circleversary NFT metadata seeding process");
    for (let i = 1; i <= NUM_CIRCLEVERSARY_NFTS; i++) {
        const nftTitle = `${i}-year Circleversary`
        const nftDescription = `Given to employees of Circle who have worked at the company for at least ${i} year.`
        const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${i}.png`;

        const nft = await seedNftMetadataHelper(i, nftTitle, nftDescription, nftImageUrl);
        console.log("Upserted nft ", nft);
    }
}

async function seedJul2024HackathonNfts() {
    // Seed the NFTs' metadata
    const participantNftTitle = `Circle Hackathon Participant (Jul 2024)`
    const participantNftDescription = `Given to everyone who participated in the Circle internal hackathon hosted by the Developer Experience Billing Team.`
    const participantNftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${JUL_2024_HACKATHON_PARTICIPANT_NFT_TOKEN_ID}.png`;

    const participantNft = await seedNftMetadataHelper(JUL_2024_HACKATHON_PARTICIPANT_NFT_TOKEN_ID, participantNftTitle, participantNftDescription, participantNftImageUrl);
    console.log("Upserted nft ", participantNft);

    const organizerNftTitle = `Circle Hackathon Organizer (Jul 2024)`
    const organizerNftDescription = `Given to main organizers of the Circle internal hackathon hosted by the Developer Experience Billing Team.`
    const organizerNftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${JUL_2024_HACKATHON_ORGANIZER_NFT_TOKEN_ID}.png`;

    const organizerNft = await seedNftMetadataHelper(JUL_2024_HACKATHON_ORGANIZER_NFT_TOKEN_ID, organizerNftTitle, organizerNftDescription, organizerNftImageUrl);
    console.log("Upserted nft ", organizerNft);

    // Seed the NFT recipients
    const participantNftRecipientEmails = [
        'xiaoyu.cen@circle.com',
        'ashutosh.ukey@circle.com',
        'adam.block@circle.com',
        'heondo.kim@circle.com',
        'kieran.agterberg@circle.com',
        'al.luken@circle.com',
        'hung.nguyen@circle.com',
        'porter.christensen@circle.com',
        'antony.fleischer@circle.com',
        'arav.dalwani@circle.com',
        'gabe.hyun@circle.com'
    ]
    const organizerNftRecipientEmails = [
        'hanna.kalosha@circle.com',
        'tobias.golbs@circle.com',
        'subha.subramanian@circle.com',
        'mayur.oza@circle.com',
        'ian.lin@circle.com',
        'han.chen@circle.com',
        'rebecca.wald@circle.com',
        'corey.cooper@circle.com'
    ]
    
    await Promise.all(participantNftRecipientEmails.map(pEmail => seedNftRecipientHelper(participantNft.id, pEmail)))
    await Promise.all(organizerNftRecipientEmails.map(oEmail => seedNftRecipientHelper(organizerNft.id, oEmail)))
}

async function seedFoundingTeamNfts() {
    // Seed the NFTs' metadata
    const nftTitle = `Founding Team (Wombat BUIDLers)`
    const nftDescription = `Given to the founding team of the Circle Achievement NFTs App built during the Jul 2024 Circle hackathon. The members called their team the "Wombat BUIDLers".`
    const nftImageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${APP_FOUNDING_TEAM_NFT_TOKEN_ID}.png`;

    const nft = await seedNftMetadataHelper(APP_FOUNDING_TEAM_NFT_TOKEN_ID, nftTitle, nftDescription, nftImageUrl);
    console.log("Upserted nft ", nft);

    // Seed the NFT recipients
    const organizerNftRecipientEmails = [
        'xiaoyu.cen@circle.com',
        'ashutosh.ukey@circle.com',
        'adam.block@circle.com',
    ]
    await Promise.all(organizerNftRecipientEmails.map(oEmail => seedNftRecipientHelper(nft.id, oEmail)))
}

async function seedNftRecipientHelper(nftTokenId: number, email: string) {
    return prisma.unredeemedNft.upsert({
        update: {},
        where: {
            unredeemedNftId: {
                email: email,
                nftId: nftTokenId,
            }
        },
        create: {
            email: email,
            nftId: nftTokenId,
        }
    })
}

async function seedNftMetadataHelper(nftTokenId: number, nftTitle: string, nftDescription: string, nftImageUrl: string) {
    return await prisma.nft.upsert({
        update: {
            title: nftTitle,
            description: nftDescription,
            imageUrl: nftImageUrl,
        },
        where: {
            tokenAddress_tokenId: {
                tokenAddress: CIRCLE_NFT_CONTRACT_ADDRESS,
                tokenId: nftTokenId
            }
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
        seedJul2024HackathonNfts(),
        seedFoundingTeamNfts(),
        seedBuddingWeb3DevNft()
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

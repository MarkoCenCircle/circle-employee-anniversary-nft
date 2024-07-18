import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import {
    getDevWalletsClient,
    getNftOwnerCompanyFoundingDate,
    CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE,
    CIRCLE_EMPLOYEE_NFTS_WALLET_SET_ID,
} from './common/circle';
import { v5 as uuidv5 } from 'uuid';
import prisma from '../../prisma'
import { capitalizeFirstLetter } from './common'
import { getEmailTransporter, validateEmail, normalizeEmail } from './common/email'
import { dateToUnixSeconds, unixSecondsToDate } from './common/time'
import { generateUserJwt } from './common/auth'
import { SignUpRequest, SignUpResponse } from "@/models/signUp";


async function sendNewAccountVerifcationEmail(recipientFirstName: string, recipientEmail: string, jwtToken: string, hasActivatedProfile: boolean) {
    recipientFirstName = capitalizeFirstLetter(recipientFirstName);

    const appVerifyEmailUrl = `https://circle-employee-anniversary-nft.vercel.app/redeemNfts?tok=${jwtToken}`
    const emailContent = {
        subject: 'Create Your Profile and Recieve Your Circle NFTs 🏆',
        body: [
            `Hello ${recipientFirstName},`,
            `Welcome to the Circle Achievement NFTs app 😎! Create your profile and redeem your NFTs by clicking on <a href="${appVerifyEmailUrl}">this link</a>. If you did not request a new profile, please ignore this email. No follow-up action is needed.`
        ]
    }

    const resp = await getEmailTransporter().sendMail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: '<p>' + emailContent.body.join('<br><br>') + '</p>'
    });
    console.log("Successfully sent new account signup email", resp);
}


const signupHandler: NextApiHandler<void> = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    if (req.method === 'POST') {
        // Request body validation
        const payload = req.body as SignUpRequest
        const companyFoundingDate = await getNftOwnerCompanyFoundingDate();
        if (payload.joinDate < companyFoundingDate) {
            res.status(400).json('Invalid start date. Please make sure your time stamp is in Unix seconds.')
            return
        }

        // Validate and parse email
        if (!payload.email || !validateEmail(payload.email)) {
            res.status(400).json('Invalid email')
            return
        }
        const email: string = normalizeEmail(payload.email)
        const [firstName, lastName] = email.split('@')[0].split('.')

        // Create wallet to hold user's NFTs
        const circlePwClient = getDevWalletsClient();
        const userWallets = await circlePwClient.createWallets({
            idempotencyKey: uuidv5(email, CREATE_USER_PROFILE_IDP_KEY_UUID_NAMESPACE),
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

        // Check for existing DB record to determine whether user has an existing profile
        let user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {  console.log(`Creating DB user entry for new user with email ${payload.email}`) }

        const hasActivatedProfile = user?.isVerified ?? false;

        // Upsert user in DB
        user = await prisma.user.upsert({
            update: { position: payload.position },
            where: { email },

            create: {
                email,
                firstName: firstName ?? '',
                lastName: lastName ?? '',
                position: payload.position ?? '',
                employmentStartDate: unixSecondsToDate(payload.joinDate),
                circleWalletId: userWallet.id,
                isVerified: false
            },
        })

        // Send new account email
        const userJwt = generateUserJwt(user.id)
        try {
            if (!user.isVerified) {
                await sendNewAccountVerifcationEmail(user.firstName, user.email, userJwt, hasActivatedProfile);
            }
        } catch (err) {
            res.status(500).end('Something went wrong while trying to send email')
            return
        }

        // Build and return response
        res.json({
            userId: user.id,
            email: user.email,
            walletAddress: userWallet.address,
            joinDate: dateToUnixSeconds(user.employmentStartDate),
            isEmailAlreadyVerified: user.isVerified
        } as SignUpResponse)
    } else {
        res.status(405).end('Method Not Allowed')
    }
}

export default signupHandler

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import prisma from '../../prisma'
import { capitalizeFirstLetter } from './common'
import { getEmailTransporter, validateEmail, normalizeEmail } from './common/email'
import { generateUserJwt } from './common/auth'
import { CheckNewNftsRequest, CheckNewNftsResponse } from "@/models/checkNewNfts";


async function sendNewAccountVerifcationEmail(recipientFirstName: string, recipientEmail: string, jwtToken: string) {
    recipientFirstName = capitalizeFirstLetter(recipientFirstName);
    const appVerifyEmailUrl = `https://circle-employee-anniversary-nft.vercel.app/redeemNfts?tok=${jwtToken}`

    const emailContent = {
        subject: 'Check for New Unlocked Circle NFTs 🏆',
        body: [
            `Hi ${recipientFirstName},`,
            `Welcome back to the Circle Achievement NFTs app 🥳! Click on <a href="${appVerifyEmailUrl}">this link</a> to check if you've unlocked any new Circle NFTs. If you did not make this request, you may safely ignore this email.`,
        ]
    };
    const resp = await getEmailTransporter().sendMail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: '<p>' + emailContent.body.join('<br><br>') + '</p>'
    });
    console.log("Successfully sent new account signup email", resp);
}


const checkNewNftsHandler: NextApiHandler<void> = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    if (req.method === 'POST') {
        // Request body validation
        const payload = req.body as CheckNewNftsRequest

        // Validate and parse email
        if (!payload.email || !validateEmail(payload.email)) {
            res.status(400).json('Invalid email')
            return
        }
        const email = normalizeEmail(payload.email)

        // Check for existing DB record to determine whether user has an existing profile
        let user = await prisma.user.findUnique({
            where: {  email: email, isVerified: true }
        })
        if (!user) { 
            res.status(404).end(`No verified user with email ${email} found. Please signup or finish signing up.`)
            return
         }

        // Send email
        const userJwt = generateUserJwt(user.id)
        try {
            await sendNewAccountVerifcationEmail(user.firstName, user.email, userJwt);
        } catch (err) {
            res.status(500).end('Something went wrong while trying to send email')
            return
        }

        // Build and return response
        res.json({
            userId: user.id,
            email: user.email,
        } as CheckNewNftsResponse)
    } else {
        res.status(405).end('Method Not Allowed')
    }
}

export default checkNewNftsHandler

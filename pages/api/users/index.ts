import type { NextApiHandler } from "next";
import prisma from '../../../prisma'
import { validateEmail, normalizeEmail } from '../common/email'

const nftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'GET') {
        // Parse and validate query parameters
        let email: string = (req.query.email as string ?? '')
        if (!email || !validateEmail(email)) {
            res.json([])
            return
        }
        email = normalizeEmail(email)

      // Search DB for users
        let users = await prisma.user.findMany({
            where: {
                email: {
                    contains: email
                },
                isVerified: true
            },
            take: 20,
        })

        // Build and send response
        res.json(users.map(user => {
            return { userId: user.id, userEmail: user.email }
        }))
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

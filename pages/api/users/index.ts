import type { NextApiHandler } from "next";
import prisma from '../../../prisma'

const nftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'GET') {
        // Parse and validate query parameters
        let email: string = (req.query.email as string ?? '').trim()

        if (!email) {
            res.json([])
            return
        }

      // remove the alias part
      email = email.replace(/\+.*@/, '@')

      // Search DB for users
        let users = await prisma.user.findMany({
            where: {
                email: {
                    contains: email
                }
            },
            take: 20,
        })

        // Build and send response
        const foundUsers = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            foundUsers.push({
                userId: user.id,
            })
        }
        res.json(foundUsers)
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

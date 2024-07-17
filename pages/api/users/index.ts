import type { NextApiHandler } from "next";
import prisma from '../../../prisma'

const nftsHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'GET') {
        // Parse and validate query parameters
        const { email } = req.query;
        if (!email) {
            res.json([])
            return
        }
        if (typeof email !== "string") {
            res.status(400).end('Invalid email query parameter')
            return
        }

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
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                joinDate: user.employmentStartDate,
                position: user.position
            })
        }
        res.json(foundUsers)
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

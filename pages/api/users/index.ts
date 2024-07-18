import type { NextApiHandler } from "next";
import prisma from '../../../prisma'
import { dateToUnixSeconds } from '../common/time'

const searchUsersHandler: NextApiHandler = async (
    req,
    res,
) => {
    if (req.method === 'GET') {
        // Parse and validate query parameters
        let queryTerm: string = (req.query.email as string ?? '')

        // Search DB for users
        let users = await prisma.user.findMany({
            where: {
                email: {
                    contains: queryTerm
                },
                isVerified: true
            },
            take: 25,
        })

        // Build and send response
        res.json(users.map(user => {
            return { 
                userId: user.id, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                joinDate: dateToUnixSeconds(user.employmentStartDate),
                position: user.position
            }
        }))
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default searchUsersHandler

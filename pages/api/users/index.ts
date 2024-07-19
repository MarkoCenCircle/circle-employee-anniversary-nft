import type { NextApiHandler } from "next";
import prisma from '../../../prisma'
import { dateToUnixSeconds } from '../common/time'
import { maskEmail } from "../common/email";
import { maskFullName } from "../common";

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
        res.json(users
          .filter(u => u.isVerified) // only return verified profile
          .map(user => {
            return {
                userId: user.id,
                email: maskEmail(user.email),
                name: maskFullName(user.firstName, user.lastName),
            }
        }))
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default searchUsersHandler

import type { NextApiHandler } from "next";
import {getUserProfile} from "@/handlers/getUserProfile";

const userProfileHandler: NextApiHandler = async (
    req,
    res,
) => {
    // Parse path parameters
    const { userId: userIdStr } = req.query;

    if (req.method === 'GET') {
        // Parse and validate path parameters
        if (!userIdStr || typeof userIdStr !== "string") {
            res.status(400).end('Invalid user ID path parameter')
            return
        }
        let userId: number
        try {
            userId = parseInt(userIdStr)
        } catch (err) {
            res.status(400).end('Unable to parse user ID path parameter as number')
            return
        }

        try {
          const response = await getUserProfile({ userId })
          if (response.data) {
            res.json(response.data)
          } else {
            res.status(response.httpStatus).end(response.errMsg);
          }
        } catch (ex) {
          res.status(500).json(ex)
        }
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default userProfileHandler

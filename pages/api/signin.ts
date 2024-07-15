import type { NextApiHandler } from "next";


const signinHandler: NextApiHandler<void> = (
  req,
  res,
) => {
    if (req.method === 'POST') {
        // sign in logic goes here...
        res.json()
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default signinHandler

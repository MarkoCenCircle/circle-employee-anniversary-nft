import type { NextApiHandler } from "next";


const signupHandler: NextApiHandler<void> = (
  req,
  res,
) => {
    if (req.method === 'POST') {
        // sign up logic goes here...
        res.json()
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default signupHandler

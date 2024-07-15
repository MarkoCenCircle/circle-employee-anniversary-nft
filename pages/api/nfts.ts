import type { NextApiHandler } from "next";

type NftResponse = {
  name: string;
};

const nftsHandler: NextApiHandler<NftResponse[]> = (
  req,
  res,
) => {
    if (req.method === 'GET') {
        // get nfts logic goes here...
        res.json([])
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

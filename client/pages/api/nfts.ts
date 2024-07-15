import type { NextApiHandler } from "next";
import { defaultBaseUrl } from '@circle-fin/developer-controlled-wallets'

type NftResponse = {
  name: string;
};

const nftsHandler: NextApiHandler = (
  req,
  res,
) => {
    if (req.method === 'GET') {
        // get nfts logic goes here...
        res.json({ defaultBaseUrl })
    } else {
        res.status(405).end('405 Method Not Allowed')
    }
}

export default nftsHandler

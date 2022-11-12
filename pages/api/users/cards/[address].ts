import { NextApiRequest } from 'next';
import rateLimit from '../../../../utils/rate-limit';
import absoluteUrl from 'next-absolute-url'
import { gql, request } from 'graphql-request';
import { isAddress } from 'ethers/lib/utils';

const QUERY = gql`
    query Card(
        $owner: Bytes!
    ) {
        cards (where: {owner: $owner}) {
            id
            level {
                id
                name
            }
            cellar {
                id
                capacity
            }
    }
    }
`;

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req: NextApiRequest, res) {
	let { address } = req.query;
    const { origin } = absoluteUrl(req);

	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
        
        address = (address as string).toLowerCase();

        if (!isAddress(address)) throw new Error(`${address} is not a valid Ethereum address.`)

        const { cards } = await request(process.env.SUBGRAPH, QUERY, { owner: address });

        cards.forEach((card) => {
            card.metadata = `${origin}/cards/metadata/${card.id}`;
        });
	
		res.status(200).json({
            user: address,
            owned: cards.length,
            cards,
        });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

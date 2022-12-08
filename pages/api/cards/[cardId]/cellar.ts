import { NextApiRequest } from 'next';
import rateLimit from '../../../../utils/rate-limit';
import absoluteUrl from 'next-absolute-url'
import { gql, request } from 'graphql-request';

const QUERY = gql`
    query Card(
        $cardId: String!
    ) {
        card (id: $cardId) {
            cellar {
                id
                capacity
                aum
                owned {
                    id
                    bottleId
                    expiry
                    collection {
                        id
                        name
                        symbol
                    }
                }
            }
        }
    }
`;

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req: NextApiRequest, res) {
	const { cardId } = req.query;

	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		
        let { card } = await request(process.env.SUBGRAPH, QUERY, { cardId });

        if (!card) throw new Error(`Card #${cardId} does not exist.`);
        
        card.cellar.owned = card.cellar.owned.map((bottle) => {
            const arranged = {
                ...bottle,
                id: bottle.bottleId,
            }

            delete arranged.bottleId;

            return arranged;
        });

		res.status(200).json(card.cellar);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

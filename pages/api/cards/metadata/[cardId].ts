import { NextApiRequest } from 'next';
import rateLimit from '../../../../utils/rate-limit';
import absoluteUrl from 'next-absolute-url'
import { gql, request } from 'graphql-request';

const QUERY = gql`
    query Card(
        $cardId: String!
    ) {
        card(id: $cardId) {
            id
            cellar {
                id
                capacity
            }
            level {
                name
                defaultPerks {
                    name
                }
            }
        }
    }
`


const metadata = {
    name: "",
    description: "Winible Club Card - FOR TESTNET ONLY",
    image: "",
    cellar : {
        address: '',
        capacity: 0
    },
    attributes: []
}

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
})

export default async function handler(req: NextApiRequest, res) {
	const { cardId } = req.query;
    const { origin } = absoluteUrl(req)

	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		
        metadata.image = `${origin}/images/alpha_card_tamplate.png`

        const { card } = await request(process.env.SUBGRAPH, QUERY, { cardId });

        if(!card) throw new Error(`Card #${cardId} does not exist.`);

        //card level
        metadata.name = `Winible ${card.level.name} (Alpha) - #${cardId}`;
        
        // default perks
        card.level.defaultPerks.forEach((perk) => {
            metadata.attributes.push({
                trait_type: perk.name, 
                value: "Active"
            });
        });

        // extra @TODO

        //cellar
        metadata.cellar.address = card.cellar.id;
        metadata.cellar.capacity = card.cellar.capacity;

	
		res.status(200).json(metadata)
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
}

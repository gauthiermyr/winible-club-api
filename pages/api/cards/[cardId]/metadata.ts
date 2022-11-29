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
`;


const metadata = {
    name: "",
    description: "Winible Club Card - FOR TESTNET ONLY",
    image: "",
    tokenId: 0,
    level: "",
    nickname: "Satoshi Nakamoto",
    pfp : {
        image: 'https://img.seadn.io/files/a5aedf3c9cd2d0d0bc2d8e42d9ef796f.png',
        chain: 1,
        contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        id: 2405
    },
    cellar : {
        address: "",
        capacity: 0
    },
    attributes: []
}

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req: NextApiRequest, res) {
	const { cardId } = req.query;
    const { origin } = absoluteUrl(req);

	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		
        metadata.image = `${origin}/images/alpha_card_tamplate.png` //fetch from S3 

        const { card } = await request(process.env.SUBGRAPH, QUERY, { cardId });

        if (!card) throw new Error(`Card #${cardId} does not exist.`);

        metadata.tokenId = parseInt(cardId as string);

        //card level
        metadata.name = `Winible ${card.level.name} (Alpha) - #${cardId}`;
        metadata.level = card.level.name;
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

	
		res.status(200).json(metadata);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
}

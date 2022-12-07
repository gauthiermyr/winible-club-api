import { isAddress } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { NextApiRequest } from "next";
import rateLimit from "../../../../utils/rate-limit";

const QUERY = gql`
query Collection(
    $collection: Bytes!
) {
    collection (id: $collection) {
        id
        name
        symbol
        maxSupply
        currentSupply
        minPrice
    }
}
`;

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

/**

/bottles/{collection}
get:
    description: get collection infos
    parameters:
        - in: path
            name: collection
            description: collection contract address
            schema:
                type: address
            required: true
    responses:
        200:
            description: bleb

*/
export default async function (req: NextApiRequest, res) {
    let { collection } = req.query;

    try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
        
        collection = (collection as string).toLowerCase();

        if (!isAddress(collection)) throw new Error(`${collection} is not a valid Ethereum address.`)

        const { collection: collec } = await request(process.env.SUBGRAPH, QUERY, { collection: collection });
	
		res.status(200).json({
            id: collec.id,
            name: collec.name,
            symbol: collec.symbol,
            maxSupply: parseInt(collec.maxSupply),
            minPrice: parseInt(collec.minPrice),
            currentSupply: parseInt(collec.currentSupply),
            available: collec.maxSupply - collec.currentSupply,
        });

	} catch (err) {
		res.status(400).json({ error: err.message });
	}

}
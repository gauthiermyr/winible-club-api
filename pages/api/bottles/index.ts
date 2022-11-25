import { isAddress } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { NextApiRequest } from "next";
import rateLimit from "../../../utils/rate-limit";

const QUERY = gql`
query Collection {
    collections {
        id
        name
        symbol
        maxSupply
        currentSupply
    }
}
`;

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});


export default async function (req: NextApiRequest, res) {

    try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
        
        const { collections } = await request(process.env.SUBGRAPH, QUERY, {});
	
		res.status(200).json(collections);

	} catch (err) {
		res.status(400).json({ error: err.message });
	}

}
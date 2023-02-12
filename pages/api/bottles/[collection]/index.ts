import { NextApiRequest } from 'next';
import rateLimit from '../../../../utils/rate-limit';
import absoluteUrl from 'next-absolute-url'
import { gql, request } from 'graphql-request';

const QUERY = gql`
    query Collection(
        $address: String!
    ) {
        collection(id: $address) {
            name
            symbol
            maxSupply
            currentSupply
            minPrice
        }
    }
`;


const metadata = {
    name: "",
    description: "",
    image: "",
    image3D: "",
    attributes: {},
    maxSupply: 0,
    currentSupply: 0,
    minPrice: 0
}

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req: NextApiRequest, res) {
	const { collection: collectionAddress } = req.query;
    const { origin } = absoluteUrl(req);

	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		
        metadata.image = `${origin}/bottles_data/${(collectionAddress as string).toLowerCase()}/image.png` //fetch from S3 
        metadata.image3D = `${origin}/bottles_data/${(collectionAddress as string).toLowerCase()}/image.gltf` //fetch from S3 

        const { collection } = await request(process.env.SUBGRAPH, QUERY, { address: collectionAddress });

        if (!collection) throw new Error(`#${collectionAddress} does not exist.`);


        //card level
        metadata.name = `${collection.name}`;       
        metadata.description = `Tesnet collection`;

        // default perks
        const fixed = await import(`/public/bottles_data/${(collectionAddress as string).toLowerCase()}/fixed_data.json`);
        metadata.attributes = fixed;
        // extra @TODO
        metadata.currentSupply = collection.currentSupply;
        metadata.minPrice = collection.minPrice;
        metadata.maxSupply = collection.maxSupply;

	
		res.status(200).json(metadata);
	} catch (err) {
        console.log(err)
		res.status(400).json({ error: err.message });
	}
}

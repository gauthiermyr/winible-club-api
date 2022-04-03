import * as uuid from 'uuid'
import rateLimit from '../../utils/rate-limit'
import { getOwner } from '../../utils/ownership'
import { getMetadata } from '../../utils/metadata'
import { createCanvas, loadImage } from 'canvas';
import download from 'image-downloader';
import fs from 'fs';

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
})

export default async function handler(req, res) {
	const { contract, tokenId, chainId } = req.body;
	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		const currentUuid = uuid.v4();
		
		//0. verify ownership and fetch pfp data
		const owner = await getOwner(contract, tokenId, chainId);
		//TODO check if owner = request signer
		
		const metadata = await getMetadata(contract, tokenId, chainId);
		let pfpURI = metadata.image;
		if(pfpURI.startsWith('ipfs://')){
			pfpURI = pfpURI.replace('ipfs://',`${process.env.IPFS_GATEWAY}/`)
        }
		const path = `${process.cwd()}/public/build/${currentUuid}`;
		await fs.mkdir(path, { recursive: true }, (err) => {
			if (err) throw err;
		});

		const options = {
			url: pfpURI,
			dest: path
		};

		const { filename } = await download.image({
			extractFilename: true,
			...options
		});

		//1. create the new metadata image
		const canvas = createCanvas(837, 347);
		const ctx = canvas.getContext('2d');
		const background = await loadImage('constants/images/0.png'); //TODO fetch good one
		ctx.drawImage(background, 0, 0, 837, 347)
		const pfp = await loadImage(filename);
		ctx.drawImage(pfp, 50, 50, 200, 200);
		const out = fs.createWriteStream(`${path}/test.png`); //TODO name it
		const stream = canvas.createPNGStream();
		await stream.pipe(out);

		//2. upload the new image to ipfs
		//3. update the metadata: image, contract, id, chain, locked
		//4. upload metadata to ipfs
		//5. sign the new metadata
		//6. return



	
		res.status(200).json({ owner, image: `/build/${currentUuid}/test.png` })
	} catch (err) {
		res.status(429).json({ error: err })
	}
}

import * as uuid from 'uuid'
import rateLimit from '../../utils/rate-limit'
import { getOwner } from '../../utils/ownership'
import { getMetadata } from '../../utils/metadata'
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import pinataClient from '@pinata/sdk';
import { downloadImage } from '../../utils/image';

const limiter = rateLimit({
	interval: 60 * 1000, // 60 seconds
	uniqueTokenPerInterval: 500, // Max 500 users per second
})

export default async function handler(req, res) {
	const { cardContract, cardId, contract, tokenId, chainId } = req.body;
	try {
		await limiter.check(res, 10, 'CACHE_TOKEN') // 10 requests per minute
		const currentUuid = uuid.v4();

		//0. verify ownership and fetch pfp data
		const owner = await getOwner(contract, tokenId, chainId);
		//TODO check if owner = request signer 
		//TODO check if card owner as well
		
		const metadata = await getMetadata(contract, tokenId, chainId);
		let pfpURI = metadata.image;
		if(pfpURI.startsWith('ipfs://')){
			pfpURI = pfpURI.replace('ipfs://',`${process.env.IPFS_GATEWAY}/`)
        }
		const path = `${process.cwd()}/public/build/${currentUuid}`;
		fs.mkdir(path, { recursive: true }, (err) => {
			if (err)
				throw err;
		});

		const pfpFile = await downloadImage(pfpURI, path);

		//1. create the new metadata image

		//get background image
		let cardMetadata = await getMetadata(cardContract, cardId, 43113);

		const canvas = createCanvas(837, 347);
		const ctx = canvas.getContext('2d');
		const background = await loadImage('constants/images/0.png'); //TODO fetch good one
		ctx.drawImage(background, 0, 0, 837, 347)
		const pfp = await loadImage(pfpFile);
		ctx.drawImage(pfp, 50, 50, 200, 200);
		const out = fs.createWriteStream(`${path}/test.png`); //TODO name it
		const stream = canvas.createPNGStream();
		stream.pipe(out);

		//2. upload the new image to ipfs
		const pinata = pinataClient(process.env.IPFS_API_KEY, process.env.IPFS_API_SECRET);
		const readableStreamForFile = fs.createReadStream(`${path}/test.png`);

		const { IpfsHash } = await pinata.pinFileToIPFS(readableStreamForFile,  {
			pinataMetadata: {
				name: `test`,
			},
			pinataOptions: {
				cidVersion: 0
			}
		});

		//3. update the metadata: image, contract, id, chain, locked
		cardMetadata.image = `ipfs://${IpfsHash}`;
		cardMetadata.attributes[3] = true; //pfp locked
		cardMetadata.attributes[4] = chainId; //pfp chain id
		cardMetadata.attributes[5] = contract; //pfp contract address
		cardMetadata.attributes[6] = tokenId; //pfp token id

		//4. upload metadata to ipfs
		//5. sign the new metadata
		//6. return



	
		res.status(200).json({ owner, image: `${process.env.IPFS_GATEWAY}/${IpfsHash}` })
	} catch (err) {
		res.status(400).json({ error: err })
	}
}

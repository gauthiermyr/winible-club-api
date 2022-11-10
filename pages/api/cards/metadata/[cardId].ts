import * as uuid from 'uuid'
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import pinataClient from '@pinata/sdk';
import { NextApiRequest } from 'next';
import rateLimit from '../../../../utils/rate-limit';
import absoluteUrl from 'next-absolute-url'


const metadata = {
    "name": "",
    "description": "Winible Club Card - FOR TESTNET ONLY",
    "image": "",
    "attributes": [
        {
            "name": "Green#21.8",
            "rarity": "original"
        },
        {
            "name": "Albino#4",
            "rarity": "original"
        },
        {
            "name": "Glasses#6",
            "rarity": "original"
        },
        {
            "name": "Goatee#10",
            "rarity": "original"
        },
        {
            "name": "TinfoilHat#1",
            "rarity": "original"
        },
        {
            "name": "Guitar#1",
            "rarity": "original"
        }
    ]
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
		
        metadata.name = `Winible Flex (Alpha) - #${cardId}`;
        metadata.image = `${origin}/images/alpha_card_tamplate.png`

	
		res.status(200).json(metadata)
	} catch (err) {
		res.status(400).json({ error: err })
	}
}

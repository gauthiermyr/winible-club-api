import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { CHAINS } from '../constants/chains';
import { ERC721_ABI } from '../constants/ABIS/erc721';
import axios from 'redaxios';

export const getMetadata = async (contract: string, tokenId: number, chainId: number) => {
    const supported = Object.keys(CHAINS);

    if (!supported.includes(chainId.toString())) throw "Unsupported chain";

    const provider = new JsonRpcProvider(CHAINS[chainId].RPC);
    const collection = new Contract(contract, ERC721_ABI, provider);
    let tokenURI;
    let metadata;
    try {
        tokenURI = await collection.tokenURI(tokenId);
        //if ipfs URI:
        if(tokenURI.startsWith('ipfs://')){
            tokenURI = tokenURI.replace('ipfs://',`${process.env.IPFS_GATEWAY}/`);

        }

        const { data } = await axios.get(tokenURI);
        metadata = data;
    }
    catch (err) {
        console.log(err);
    }

    return metadata;
}
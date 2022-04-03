import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { CHAINS } from '../constants/chains';
import { ERC721_ABI } from '../constants/ABIS/erc721';

export const getOwner = async (contract: string, tokenId: number, chainId: number) => {
    const supported = Object.keys(CHAINS);

    if (!supported.includes(chainId.toString())) throw "Unsupported chain";

    const provider = new JsonRpcProvider(CHAINS[chainId].RPC);
    const collection = new Contract(contract, ERC721_ABI, provider);

    let owner;
    try {
        owner = await collection.ownerOf(tokenId);
    }
    catch (err) {
        console.log(err);
    }

    return owner;
}
export const CHAINS = {
    1: {
        name: "Ethereum",
        // RPC: `https://mainnet.infura.io/v3/${process.env.INFURA_APY_KEY}`,
        RPC: `https://cloudflare-eth.com`,
    },
    137: {
        name: "Polygon",
        RPC: `https://polygon-rpc.com`,
    },
    42161: {
        name: "Arbitrum",
        RPC: `https://arb1.arbitrum.io/rpc`,
    },
    43113: {
        name: "Fuji (testnet)",
        RPC: `https://api.avax-test.network/ext/bc/C/rpc`,
    },
    43114: {
        name: "Avalanche",
        RPC: `https://api.avax.network/ext/bc/C/rpc`,
    },
}
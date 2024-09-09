// chainDefinitions.js
import {
  base,
  baseSepolia,
  celo,
  optimism,
  optimismSepolia,
  defineChain,
} from "thirdweb/chains";

const liskSepolia = defineChain({
  id: 4202,
  name: "Lisk Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpc: "https://4202.rpc.thirdweb.com",
  blockExplorers: [
    {
      name: "Etherscan",
      url: "https://sepolia-blockscout.lisk.com/",
      apiUrl: "https://sepolia-blockscout.lisk.com/api",
    },
  ],
});

const  Alfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "Celo Ether", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
  blockExplorers: [
      {
          name: "Celo Explorer",
          url: "https://explorer.celo.org/alfajores",
          apiUrl: "https://explorer.celo.org/api",
      },
  ],
});

const lisk = defineChain({
  id: 1135,
  name: "Lisk",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: "https://1135.rpc.thirdweb.com",
});

const baseSepolia = defineChain({
  id: 11155111,  // Example chain ID for Base Sepolia (replace with correct one)
  name: "Base Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: "https://base.rpc.thirdweb.com",
});

const optimismSepolia = defineChain({
  id: 11111111,  // Example chain ID for Optimism Sepolia (replace with correct one)
  name: "Optimism Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: "https://optimism-sepolia.rpc.thirdweb.com",
});

const optimism = defineChain({
  id: 10,
  name: "Optimism",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: "https://mainnet.optimism.io",
});

const networks = [
  { name: "Lisk Sepolia Testnet", chain: liskSepolia },
  { name: "Lisk", chain: lisk },
  { name: "Base Sepolia Testnet", chain: baseSepolia },
  { name: "Celo Alfajores Testnet", chain: Alfajores },
  { name: "Optimism", chain: optimism },
  { name: "Optimism Sepolia", chain: optimismSepolia },
];

// contractConfig.js
// contractConfig.js

const contractConfig = {
  // Ethereum Mainnet
  1: {
    paymentToken: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // USDC on Ethereum
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Ethereum
    chainName: 'Ethereum'
  },
  // Binance Smart Chain (BSC)
  56: {
    paymentToken: {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',  // USDC on BSC
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'BNB',
      name: 'Binance Coin'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on BSC
    chainName: 'Binance Smart Chain'
  },
  // Polygon
  137: {
    paymentToken: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',  // USDC on Polygon
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'MATIC',
      name: 'Polygon'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Polygon
    chainName: 'Polygon'
  },
  // Arbitrum
  42161: {
    paymentToken: {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',  // USDC on Arbitrum
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Arbitrum
    chainName: 'Arbitrum'
  },
  // Optimism
  10: {
    paymentToken: {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',  // USDC on Optimism
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Optimism
    chainName: 'Optimism'
  },
  // Lisk Sepolia
  4202: {
    paymentToken: {
      address: '0x...',  // Replace with the USDC address if available on Lisk Sepolia
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'ETH',
      name: 'Sepolia Ether'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Lisk Sepolia
    chainName: 'Lisk Sepolia'
  },
  // Celo Alfajores
  44787: {
    paymentToken: {
      address: '0x...',  // Replace with the USDC address if available on Celo Alfajores
      symbol: 'USDC',
      name: 'USD Coin'
    },
    nativeToken: {
      symbol: 'CELO',
      name: 'Celo Ether'
    },
    invoiceContract: '0x...',  // Replace with your invoice contract address on Celo Alfajores
    chainName: 'Celo Alfajores'
  },
  // Add more chains as needed
};

// Function to get config for a specific chain
function getChainConfig(chainId) {
  const config = contractConfig[chainId];
  if (!config) {
    throw new Error(`Configuration for chain ID ${chainId} not found`);
  }
  return config;
}

export { contractConfig, getChainConfig };

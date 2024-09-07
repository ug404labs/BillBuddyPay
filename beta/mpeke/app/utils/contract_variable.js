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
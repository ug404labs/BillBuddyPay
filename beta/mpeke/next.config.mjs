/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      // Enable WebAssembly
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
  
      // Optionally, add a rule for .wasm files
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
  
      return config;
    },
  };
  
  export default nextConfig;
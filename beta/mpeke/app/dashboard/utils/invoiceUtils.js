// invoiceUtils.js
import { prepareContractCall, toWei, sendTransaction } from "thirdweb";
import {
  base,
  baseSepolia,
  celo,
  optimism,
  optimismSepolia,
  defineChain,
} from "thirdweb/chains";


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

export async function createInvoice(factoryContract, activeAccount, newInvoice) {
  if (!factoryContract || !activeAccount) {
    console.error("Factory contract or active account not available");
    return null;
  }

  try {
    const recipientAddresses = newInvoice.recipients.map(r => r.address);
    const percentages = newInvoice.recipients.map(r => BigInt(parseFloat(r.percentage) * 10000));

    const tx = prepareContractCall({
      contract: factoryContract,
      method: "createInvoice",
      params: [
        newInvoice.tokenAddress,
        toWei(newInvoice.totalAmount),
        recipientAddresses,
        percentages,
      ],
    });

    const result = await sendTransaction({
      account: activeAccount,
      transaction: tx,
    });

    console.log("Transaction result:", result);
    return result;
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return null;
  }
}
// Import necessary modules and types
import { SocialConnectIssuer } from "@/SocialConnect";
import { RPC } from "@/SocialConnect/utils";
import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";
import { AuthenticationMethod } from "@celo/identity/lib/odis/query";
import { providers, Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

const MINIPAY_ISSUER_ADDRESS = "0x7888612486844Bb9BE598668081c59A9f7367FBc";

// Define the response type for the lookup function
export type LookupResponse = {
    accounts: string[]; // Array of account addresses
    obfuscatedId: string; // Obfuscated identifier
};

// Define the default export function 'lookup' for handling API requests
export default async function lookup(
    req: NextApiRequest, // Incoming API request
    res: NextApiResponse<LookupResponse> // API response
) {
    // Handle different request methods
    switch (req.method) {
        case "GET":
            // Create a new wallet instance using the private key and JSON RPC provider
            let wallet = new Wallet(
                process.env.ISSUER_PRIVATE_KEY as string,
                new providers.JsonRpcProvider(RPC)
            );

            // Create a new instance of the SocialConnectIssuer
            const issuer = new SocialConnectIssuer(wallet, {
                authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
                // Use the recommended authentication method to save on ODIS quota
                // For steps to set up DEK, refer to the provided GitHub link - https://github.com/celo-org/social-connect/blob/main/docs/key-setup.md
                rawKey: process.env.DEK_PRIVATE_KEY as string,
            });

            // Extract the identifier and its type from the request query
            const identifier = req.query.handle as string;
            const identifierType = IdentifierPrefix.PHONE_NUMBER;

            // Define the issuer addresses under which to perform the lookup
            // In this example, we are using our own issuer's address
            // However, SocialConnect allows looking up under other issuers by providing their addresses
            let issuerAddresses = [MINIPAY_ISSUER_ADDRESS];

            // Perform the lookup using the issuer instance
            let lookupResponse: LookupResponse = await issuer.lookup(
                identifier,
                identifierType,
                issuerAddresses
            );

            // Return the lookup response with a 200 status code
            return res.status(200).json(lookupResponse);
        default:
            // For unsupported request methods, return a 400 status code with an empty response
            return res.status(400).json({
                accounts: [],
                obfuscatedId: "",
            });
    }
}

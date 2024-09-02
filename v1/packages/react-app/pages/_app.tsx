
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import "../styles/globals.css";
import Layout from "../components/Layout";
import Dashboard from "@/components/Dashboard";
import UserProfile from "../components/Profile";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Celo, Alfajores } from "@celo/rainbowkit-celo/chains";
import celoGroups from "@celo/rainbowkit-celo/lists";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string; // get one at https://cloud.walletconnect.com/app
const { chains, publicClient } = configureChains([Alfajores], [publicProvider()]);

const connectors = celoGroups({
    chains,
    projectId,
    appName:
        (typeof document === "object" && document.title) || "Your App Name",
});

const appInfo = {
    appName: "Celo Composer",
};
const wagmiConfig = createConfig({
    connectors,
    publicClient: publicClient,
});

function App({
    Component,
    pageProps,
}: AppProps) {
    return (
        <WagmiConfig
            config={wagmiConfig}
        >
            <RainbowKitProvider
                chains={chains}
                appInfo={appInfo}
                coolMode={true}
            >
                <Layout>
                    <Toaster />
                    <Component {...pageProps} />
                </Layout>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
export default App
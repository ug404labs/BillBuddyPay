import { useState } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import Layout from "../components/Layout";
import Home from "../pages";
import UserProfile from "../components/profile"; // Adjust the import path as necessary
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string;
console.log("project id", projectId);
const { chains, publicClient } = configureChains([Alfajores], [publicProvider()]);

const connectors = celoGroups({
    chains,
    projectId,
    appName: (typeof document === "object" && document.title) || "Your App Name",
});

const appInfo = {
    appName: "Celo Composer",
};

const wagmiConfig = createConfig({
    connectors,
    publicClient: publicClient,
});

function App() {
    const [showUserProfile, setShowUserProfile] = useState(false);

    const toggleUserProfile = () => {
        setShowUserProfile(!showUserProfile);
    };

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} appInfo={appInfo} coolMode={true}>
                <Layout>
                    <Toaster />
                    {showUserProfile ? (
                        <UserProfile toggleUserProfile={toggleUserProfile} />
                    ) : (
                        <Home toggleUserProfile={toggleUserProfile} />
                    )}
                </Layout>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;

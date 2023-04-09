import React from "react";
import ReactDOM from "react-dom";
import { App } from './app';
import { ThirdwebSDKProvider } from "@thirdweb-dev/react";
import { ethers } from "ethers";

const app = (
    <ThirdwebSDKProvider
      signer={new ethers.providers.Web3Provider(window.ethereum).getSigner()} 
      activeChain={{
        // === Required information for connecting to the network === \\
        chainId: 71401, // Chain ID of the network
        // Array of RPC URLs to use
        rpc: ["https://godwoken-testnet-v1.ckbapp.dev"],

        // === Information for adding the network to your wallet (how it will appear for first time users) === \\
        // Information about the chains native currency (i.e. the currency that is used to pay for gas)
        nativeCurrency: {
          decimals: 18,
          name: "godwoken CKB",
          symbol: "CKB",
        },
        shortName: "godwoken", // Display value shown in the wallet UI
        slug: "godwoken", // Display value shown in the wallet UI
        testnet: true, // Boolean indicating whether the chain is a testnet or mainnet
        chain: "Godwoken", // Name of the network
        name: "Godwoken Testnet", // Name of the network
      }}>
      <App />
    </ThirdwebSDKProvider>);

ReactDOM.render(app, document.getElementById("root"));
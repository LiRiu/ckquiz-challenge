import { MetaMaskWallet } from "@thirdweb-dev/wallets";
import { itemAddresses, itemSymbols, itemIconsIPFSUri } from "../avatars/items";

const Godwoken = {
    // === Required information for connecting to the network === \\
    chainId: 71401, // Chain ID of the network
    // Array of RPC URLs to use
    rpc: ["https://godwoken-testnet-v1.ckbapp.dev"],

    // === Information for adding the network to your wallet (how it will appear for first time users) === \\
    // Information about the chains native currency (i.e. the currency that is used to pay for gas)
    nativeCurrency: {
      decimals: 18,
      name: "Godwoken CKB",
      symbol: "CKB",
    },
    shortName: "Godwoken", // Display value shown in the wallet UI
    slug: "Godwoken", // Display value shown in the wallet UI
    testnet: true, // Boolean indicating whether the chain is a testnet or mainnet
    chain: "Godwoken", // Name of the network
    name: "Godwoken", // Name of the network
  }

const wallet = new MetaMaskWallet({
    chains: [ Godwoken ],
    dappMetadata: {
        name: "CKQuiz",
        url: "https://ckquiz-home.vercel.app/",
        description: "Challenge for CKB",
        logoUrl: "https://ckquiz-home.vercel.app/favicon.ico",
    },
});

function addGodwokenToMetaMask() {
    window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: "0x116e9",
            rpcUrls: ["https://godwoken-testnet-v1.ckbapp.dev"],
            chainName: "Godwoken",
            nativeCurrency: {
                name: "CKB",
                symbol: "CKB",
                decimals: 18
            },
            blockExplorerUrls: ["https://v1.testnet.gwscan.com/"]
        }]
    });
}

export function connectToMetaMask(_callback) {
    wallet.connect().then(() => {
        wallet.switchChain(71401).then(
            _callback()
        ).catch(()=>{
            addGodwokenToMetaMask();
        });
    })
}

export async function addNewTokenToMetamask(_rewardId) {
    const rewardId = Number(_rewardId);
    if(rewardId === 0) return;
    const tokenAddress = itemAddresses[rewardId];
    const tokenSymbol = itemSymbols[rewardId];
    const tokenDecimals = 18;
    const tokenImage = itemIconsIPFSUri[rewardId];
    
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
}
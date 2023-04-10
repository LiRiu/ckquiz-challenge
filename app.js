import React, { useEffect, useState } from "react";
import { MetaMaskWallet } from "@thirdweb-dev/wallets";
import './index.css';
import {
  Group,
  TextInput,
  IconButton,
  Spinner,
  LogInIcon,
  ArchiveIcon,
  TickIcon,
  Avatar
} from "evergreen-ui";
import { Challenge, getQuiz, getWinner } from "./lib";

export function App() {
  const ethereum = window.ethereum;
  const [ethAddr, setEthAddr] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isInvalidAns, setIsInvalidAns] = useState(false);
  const [quizAns, setQuizAns] = useState("");
  const [txHash, setTxHash] = useState("");
  const [rewardPng, setRewardPng] = useState(require("./avatars/item0.png"));
  const [rewardAlt, setRewardAlt] = useState("1CKB|10CKB|\nNative Token on Godwoken");
  const [isStop, setIsStop] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

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

  const url = window.location.search.split("?")[1];
  const quizId = url.split("=")[1].split("&")[0];
  const quizText = url.split("=")[2];

  useEffect(() => {
    asyncSleep(100).then(() => {
      if (ethereum.selectedAddress){ 
        connectToMetaMask();
        getQuiz(quizId, setRewardPng, setIsStop, setRewardInfo).then();
        getWinner(quizId, setIsDone).then();
      }
      ethereum.addListener("accountsChanged", connectToMetaMask);
    });
  }, []);

  function connectToMetaMask() {
    wallet.connect().then(()=>{
      wallet.switchChain(71401).then(()=>{
        setEthAddr(ethereum.selectedAddress);
      }).catch(()=>{
        addGodwokenToMetaMask();
      });
    })
  }

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

  function asyncSleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleClick(){
    if(ethAddr && !isDone && !isSending){
      setIsSending(true);

      function succ(e){
        setIsDone(true);
        setIsSending(false);
        setTxHash(e.receipt.transactionHash);
        setIsInvalidAns(false);
      }

      function wrong(e){
        setIsInvalidAns(true);
        setIsSending(false);
        setQuizAns("Wrong Answer...");
      }

      Challenge(quizId, quizAns, succ, wrong).then();
    }else{
      connectToMetaMask();
    }    
  }

  function getTextPlaceholder(){
    if(!ethereum){
      return "Browser without Metamask..";
    }
    if(ethereum.selectedAddress && !showAlt){
      return decodeURI(quizText);
    }

    if(ethereum.selectedAddress && showAlt){
      return rewardAlt;
    }
    return "Connect to Metamask...";
  }

  function getIcon(){
    if(!ethereum){
      return null;
    }else if(!ethereum.selectedAddress){
      return LogInIcon;
    }else if(isSending){
      return Spinner;
    }else if(isDone){
      return TickIcon;
    }else{
      return ArchiveIcon;
    }
  }

  function getInvalid(){
    if(isInvalidAns || isStop){
      return true;
    }else{
      return false;
    }
  }

  function onChangeInput(e){
    setQuizAns(e.target.value);
  }

  function setRewardInfo(itemIcon, itemDess, amountPerWinner, balance, name){
    setRewardPng(itemIcon);
    const alt = amountPerWinner + name + "|" + balance + name + "|" + itemDess;
    setRewardAlt(alt);
  }

  return (
    <div id="quiz-box">
      <Group>
        <div id={"avatar"}>
          <Avatar
            src={rewardPng}
            shape={"square"}
            size={32}
            marginRight={1}
            onMouseEnter={() => setShowAlt(true)}
            onMouseLeave={() => setShowAlt(false)}
          />
        </div>
        <TextInput
          disabled={!ethereum.selectedAddress || isSending || isDone || isStop}
          placeholder={getTextPlaceholder()}
          id={"quiz-text"}
          isInvalid={getInvalid()}
          onChange={onChangeInput}
          onKeyUp={(e)=>{
            if(e.key === "Enter"){
              handleClick();
            }
          }}
          value={quizAns}
        />
        <IconButton
          disabled={isSending || !ethereum || isStop || isDone}
          icon={getIcon()}
          onClick={handleClick}
        />
      </Group>
    </div>
  );

}

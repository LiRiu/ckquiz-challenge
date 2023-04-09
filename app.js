import React, { useEffect, useState } from "react";
import './index.css';
import {
  Group,
  TextInput,
  IconButton,
  SearchIcon,
  Spinner,
  LogInIcon,
  ArchiveIcon,
  TickIcon,
  Avatar
} from "evergreen-ui";
import { Challenge } from "./lib";
const coinPng = require("./avatars/coin4.png");

export function App() {
  const ethereum = window.ethereum;
  const [ethAddr, setEthAddr] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isInvalidAns, setIsInvalidAns] = useState(false);
  const [quizAns, setQuizAns] = useState("");
  const [txHash, setTxHash] = useState("");
  const url = window.location.search.split("?")[1];
  const quizId = url.split("=")[1].split("&")[0];
  const quizText = url.split("=")[2];

  useEffect(() => {
    asyncSleep(100).then(() => {
      if (ethereum.selectedAddress) connectToMetaMask();
      ethereum.addListener("accountsChanged", connectToMetaMask);
    });
  }, []);

  function asyncSleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function connectToMetaMask() {
    ethereum
      .enable()
      .then(([ethAddr]) => {
        setEthAddr(ethAddr);
      })
  }

  function handleClick(){
    if(ethereum.selectedAddress && !isDone && !isSending){
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
    }else if(isDone){
      window.open("https://v1.testnet.gwscan.com/zh-CN/tx/" + txHash, "_blank");
    }else{
      connectToMetaMask();
    }    
  }

  function getTextPlaceholder(){
    if(!ethereum){
      return "Browser without Metamask..";
    }
    if(ethereum.selectedAddress){
      return decodeURI(quizText);
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
    if(isInvalidAns){
      return true;
    }else{
      return false;
    }
  }

  function onChangeInput(e){
    setQuizAns(e.target.value);
  }

  return (
    <div id="quiz-box">
      <Group>
        <div id={"avatar"}>
          <Avatar
            src={coinPng}
            shape={"square"}
            size={32}
            marginRight={1}
          />
        </div>
        <TextInput
          disabled={!ethereum.selectedAddress || isSending || isDone}
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
          disabled={isSending || !ethereum}
          icon={getIcon()}
          onClick={handleClick}
        />
      </Group>
    </div>
  );

}

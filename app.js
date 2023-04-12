import React, { useEffect, useState } from "react";
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
import { connectToMetaMask, addNewTokenToMetamask } from './ether/wallet';

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
  const [rewardId, setRewardId] = useState(0);
  const [isStop, setIsStop] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

  const url = window.location.search.split("?")[1];
  const quizId = url.split("=")[1].split("&")[0];
  const quizText = url.split("=")[2];

  useEffect(() => {
    asyncSleep(100).then(() => {
      if (ethereum.selectedAddress){ 
        connectToMetaMask(()=>{
          setEthAddr(ethereum.selectedAddress);
        });
        getQuiz(quizId, setRewardPng, setIsStop, setRewardInfo).then();
        getWinner(quizId, setIsDone).then();
      }
    });
  }, []);

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
        addNewTokenToMetamask(rewardId);
      }

      function wrong(e){
        setIsInvalidAns(true);
        setIsSending(false);
        setQuizAns("Wrong Answer...");
      }

      Challenge(quizId, quizAns, succ, wrong).then();
    }else{
      connectToMetaMask(()=>{
          setEthAddr(ethereum.selectedAddress);
        });
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

  function setRewardInfo(itemId, itemIcon, itemDess, amountPerWinner, balance, name){
    setRewardId(itemId);
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

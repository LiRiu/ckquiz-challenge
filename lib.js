import { ethers } from 'ethers';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keccak256 = require('keccak256');
const Web3 = require("web3");
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const abi = require('./ether/abi.json');
const quiz_contract_address = "0x611443f495395d4b4a650C9E6f18f7E9825a3904";
const w3 = new Web3("https://godwoken-testnet-v1.ckbapp.dev");
const randomPrivKey = process.env.RANDOMKEY;
const alice = w3.eth.accounts.privateKeyToAccount(randomPrivKey);
const BN = Web3.utils.toBN;

async function make(knowledge) {
    const knowledgeLowercase = knowledge.toLowerCase();
    const knowledgeHex = '0x' + keccak256(knowledgeLowercase).toString('hex');
    const a = BN(knowledgeHex);
    const random = Math.random();
    const randomHex = '0x' + keccak256(random).toString('hex');
    const r = BN(randomHex);
    const blocknumber = await w3.eth.getBlockNumber();
    const sigObj = w3.eth.accounts.sign("readforckb" + (blocknumber + 1), alice.privateKey);
    const c = BN(sigObj.signature.slice(0, 66));
    
    const z = c.mul(a).add(r).umod(ec.n);
    const _R = ec.g.mul(r);
    return {
        'z': z.toString(16),
        'Rx': _R.getX().toString(16),
        'Ry': _R.getY().toString(16),
        'c': c.toString(16),
        'c_full': sigObj.signature
    };
}

export async function Challenge(quizId, knowledge, succCallback, wrongCallback) {
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
    const sdk = ThirdwebSDK.fromSigner(signer);

    const param = await make(knowledge);
    const z = '0x' + BN(param['z']).toString(16);
    const Rx = '0x' + BN(param['Rx']).toString(16);
    const Ry = '0x' + BN(param['Ry']).toString(16);
    const c_full = param['c_full'];
    
    sdk.getContract(
      quiz_contract_address, // The address of your smart contract
      abi, // The ABI of your smart contract
    ).then((contract) => {
      contract.call("challenge", [quizId, z, Rx, Ry, c_full],{gasLimit: "0x6b8d80"}).then((result) => {
        const receipt = result;
        succCallback(receipt);
      }).catch((error) => {
        wrongCallback(error);
      });
    });
}
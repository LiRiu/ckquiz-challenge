import { ethers } from 'ethers';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keccak256 = require('keccak256');
const Web3 = require("web3");
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const abi = require('./ether/abi.json');
const { itemDes, itemIcons } = require("./avatars/items");
const quiz_contract_address = "0x5B74e4546296ED6e085a8dc908ee02D952ad0b28";
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
            console.log(error);
            wrongCallback(error);
        });
    });
}

export async function getQuiz(quizId, succCallback, setIsStop, setRewardAlt) {
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
    const sdk = ThirdwebSDK.fromSigner(signer);

    sdk.getContract(
        quiz_contract_address, // The address of your smart contract
        abi, // The ABI of your smart contract
    ).then((contract) => {
        const idHex = w3.utils.toHex(quizId);
        const id = w3.utils.hexToNumber(idHex);
        contract.call("get_quiz_status", [id]).then((result) => {
            const data = result;
            const itemId = data[0];
            const amountPerWinner = data[1] / 10**18;
            const balance = data[2] / 10**18;
            const name = w3.utils.hexToAscii(data[3]);
            const status = ( balance == 0 );
            if(status){
                setIsStop(true);
            }
            setRewardAlt(itemId, itemIcons[itemId], itemDes[itemId], amountPerWinner, balance, name);
        }).catch((error) => {
            console.log(error);
        });
    });
}

export async function getWinner(quizId, setIsDone) {
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
    const sdk = ThirdwebSDK.fromSigner(signer);

    sdk.getContract(
        quiz_contract_address,
        abi,
    ).then(async (contract) => {
        const idHex = w3.utils.toHex(quizId);
        const id = w3.utils.hexToNumber(idHex);
        const address = await signer.getAddress();
        const status = await contract.call("winners", [id, address]);
        setIsDone(status);
    });
}
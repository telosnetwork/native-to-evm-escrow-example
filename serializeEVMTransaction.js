
import  { TelosEvmApi } from "@telosnetwork/telosevm-js";
import fetch from "node-fetch";
import  Transaction from '@ethereumjs/tx'
import  {BigNumber, ethers}  from  'ethers';
import 'dotenv/config';
import contractABI from './abi/TelosEscrow.js'

const nativeAccount = process.env.NATIVE_ACCOUNT_ADDRESS;
const contractAddress = process.env.EVM_CONTRACT_ADDRESS;

const provider = ethers.getDefaultProvider();
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const evmApi = new TelosEvmApi({
    endpoint: "https://testnet.telos.net",
    chainId: '41',
    ethPrivateKeys: [],
    fetch: fetch,
    telosContract: 'eosio.evm',
    telosPrivateKeys: []
});
(async () => {
    try {
        var evmAccount = await evmApi.telos.getEthAccountByTelosAccount(nativeAccount);
        var linkedAddress = evmAccount.address;
        var nonce = parseInt(await evmApi.telos.getNonce(linkedAddress), 16);
    } catch(e) {
        console.log(e.message);
        return;
    }

    const feeData = await provider.getFeeData()
    const gasPrice = BigNumber.from(`0x${await evmApi.telos.getGasPrice()}`)
    const gasLimit = 26166;

    // POPULATE TRANSACTION
    try {
        var unsignedTrx =  await contract.populateTransaction.setLockDuration(3600);
    } catch(e) {
        console.log(e.message);
        return;
    }
    unsignedTrx.nonce = nonce;
    unsignedTrx.gasLimit = gasLimit;
    unsignedTrx.gasPrice = gasPrice;

    // SERIALIZE IT
    try {
        var raw = await ethers.utils.serializeTransaction(unsignedTrx);
    } catch(e) {
        console.log(e.message);
        return;
    }
    raw = raw.replace(/^0x/, '');

    // PRINT IT OUT
    console.log("SERIALIZED_TX: ", raw);
    console.log("LINKED_ADDRESS: ", linkedAddress.replace(/^0x/, ''));

})()

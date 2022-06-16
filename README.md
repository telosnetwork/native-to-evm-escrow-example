# Native to Telos Ecrow

This repository contains a script to generate the EVM transaction data of a call to the setLockDuration() function of the TelosEscrow EVM contracts.
It will also go over how-to propose a multisig in order to send that transaction from Native Telos.

## Requirements

This repository requires NodeJS 14+ as well as EOSIO's `cleos` & `keosk` and a running `nodeos` instance

**⚠️ The EVM address linked to the prods.evm native account MUST have enough TLOS in balance to pay for gas fees !**

## Install


## Rundown

Sending transactions to EVM requires the use of the eosio.evm contract's raw method
This method takes in the serialized **EVM Transaction data**, the **native account** that will pay the RAM and the **sender address** that transaction will be sent from on EVM.
In our case the native account will be "prods.evm" and the sender address will be the EVM address linked to that native account, which also owns the TelosEscrow contract and hence is the only one that can modify the settings.

### 1. Get the EVM Transaction data

The serializeEVMTransaction scripts populates & serializes the EVM Transaction for you. This example uses the setLockDuration function of the TelosEscrow EVM Contract which can only be called by the linked EVM address of the native prods.evm (eosio) account.


To use it run:

`node serializeEVMTransaction.js`

Which will give you back the raw transaction data and the EVM Address linked to your native account, something like:

```SERIALIZED_TX: f8450685746050fb5682a0f49420027f1e6f597c9e2049ddd5ffb0040aa47f613580a44eb665af0000000000....```

```LINKED_ADDRESS: 0xe7209d65c5BB05cdf799b20fF0EC09E691FC3f12```

This script is just a few lines of code that can easily be adapted to call other methods of the contract such as `setMaxDeposits` or `transferOwnership` or even another contract entirely ! 

### 2. Setup & propose a Native multisig

Our Native multisig will call the eosio.evm contract's `raw` action with the serialized EVM transaction and the linked address

You could also use EOSJS to create the Multisig proposal directly from your script.


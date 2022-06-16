# Native to Telos Ecrow Example

This repository contains a script that serializes the EVM transaction data of a call to the `setLockDuration()` function of the `TelosEscrow` EVM contract and generates the associated `Cleos propose` command from it.

## Requirements

This repository requires NodeJS 14+ as well as EOSIO's `cleos` & `keosk` and a running `nodeos` instance

**⚠️ The EVM address linked to the prods.evm native account MUST have enough TLOS in balance to pay for gas fees !**

## Install


## Rundown

Sending transactions to EVM requires the use of the eosio.evm contract's `raw(...)` method.

This method takes in the serialized **EVM Transaction data**, the **native account** that will pay the RAM and the **sender address** that transaction will be sent from on EVM.

In our case the native account will be `prods.evm` and the sender address will be the EVM address linked to that native account, which also owns the TelosEscrow contract and hence is the only one that can modify the settings.

### 1. Get the EVM Transaction data

The serializeEVMTransaction scripts populates & serializes the EVM Transaction for you and stores it into a file. This example uses the setLockDuration function of the TelosEscrow EVM Contract which can only be called by the linked EVM address of the native prods.evm (eosio) account. 

To use it run:

`node serializeEVMTransaction.js`

It will generate an actions.json file in the output folder

This script is just a few lines of code that can easily be adapted to call other methods of the contract such as `setMaxDeposits` or `transferOwnership` or even another contract entirely ! 

### 2. Prepare the Native multisig

To send a multisig, we need to setup the list of signers' permissions. In this Telos Escrow case our signers are the current active BPs.
The generateSignerList script saves those BPs permissions into a file.

To use it run:

`node generateSignerList.js`

It will generate a signers.json file in the output folder

### 3. Setup & propose a Native multisig

Run the following cleos command, replacing `yournativeaccount` with your Telos native account name.

```cleos --url https://testnet.telos.net multisig propose escrowld ./output/signers.json ./output/actions.js -p yournativeaccount```


You could also use EOSJS to create the Multisig proposal directly from your script.


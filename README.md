# Native to Telos Ecrow Example

This repository contains two scripts to help you construct a `cleos propose` command:

that serializes the EVM transaction data of a call to the `setLockDuration()` function of the `TelosEscrow` EVM contract and generates the associated `Cleos propose` command from it.

## Requirements

This repository requires NodeJS 14+ as well as EOSIO's `cleos` & `keosk` and a running `nodeos` instance

**⚠️ The EVM address linked to the prods.evm native account MUST have enough TLOS in balance to pay for gas fees !**

## Install


## Rundown

Sending transactions to EVM requires the use of the eosio.evm contract's `raw(...)` method.

This method takes in the serialized **EVM Transaction data**, the **native account** that will pay the RAM and the **sender address** that transaction will be sent from on EVM.

In our case the native account will be `prods.evm` and the sender address will be the EVM address linked to that native account, which also owns the TelosEscrow contract and hence is the only one that can modify the settings.

### 1. Prepare the data with `generateEVMActions`

The generateEVMActions script populates & serializes the EVM Transaction for you and uses that to store an action that calls eosio.evm `raw(...)` method into a file. This example uses the `setLockDuration` function of the TelosEscrow EVM Contract which can only be called by the linked EVM address of the native `prods.evm` account. 

To use it run:

`node generateEVMActions.js`

It will generate an `actions.json` file in the `output` folder

_This script, taken from our Native EVM Actions repository can easily be adapted to call other methods of the contract such as `setMaxDeposits` or `transferOwnership` or even another contract entirely !_

### 2. Prepare the permissions with `generatePermissions`

To send a multisig, we need to setup the list of signers' permissions. In this Telos Escrow case our signers are the current active BPs.
The generateSignerList script saves those BPs permissions into a file.

To use it run:

`node generatePermissions.js`

It will generate a `permissions.json` file in the `output` folder

### 3. Send your proposal using `cleos`

Run the following cleos command, replacing `yournativeaccount` with your Telos native account name.

```cleos --url https://testnet.telos.net multisig propose escrowld ./output/permissions.json ./output/actions.js -p yournativeaccount```


You could also use EOSJS to create the Multisig proposal directly from your script.


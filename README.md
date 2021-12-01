# Final project - Cat Hotel Booking

## Deployed version url

<https://amazing-snyder-f790cc.netlify.app>

## How to run this project locally

### Prerequisites

- Node.js >= v14
- Truffle and Ganache
- Yarn
- `git checkout master`

### Contracts

- Run `yarn install` in project root to install Truffle build and smart contract dependencies
- Run local testnet in port `7545` with an Ethereum client, e.g. Ganache
- `truffle migrate --network development`
- `truffle console --network development`
- Run tests in Truffle console: `test`
- `development` network id is 1337, remember to change it in Metamask as well!

### Frontend

- `cd client`
- `npm install`
- `npm run build`
- `npm run export`
- `npm run start`
- Open `http://localhost:3000`

## Screencast link

<https://www.loom.com/share/8b84d7a770df4ae28e83f5b8ed7668ad>

## Public Ethereum wallet for certification

`0xCbAfb2906a3C2acb4207295779b59d4909aDce12`

## Project description

A simple cat hotel, where a user can book a room for their cats for a number of days at a cost.

User logs into the app with metamask, views list of available cat rooms, and books one for a number of days. The user can choose to book more rooms for any number of days they choose, so far the room is available. The user can also extend their booking in a room, sio far they are able to pay the right amount.

The contract owner can change the booking price of the rooms and also able to withdraw all funds in the contract as booking profits

## Simple workflow

1. Enter service web site
2. Login with Metamask
3. Browse list of available cat rooms
4. Book an available cat room
5. Extend room booking

## Directory structure

- `client`: Project's React frontend.
- `contracts`: Smart contracts that are deployed in the Ropsten testnet.
- `migrations`: Migration files for deploying contracts in `contracts` directory.
- `test`: Tests for smart contracts.

## Environment variables (not needed for running project locally)

```
ROPSTEN_INFURA_PROJECT_ID=
ROPSTEN_MNEMONIC=
```

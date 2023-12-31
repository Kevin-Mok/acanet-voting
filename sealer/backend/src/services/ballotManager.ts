import { FFelGamal } from '@meck93/evote-crypto'
import BN = require('bn.js')

import { BALLOT_ADDRESS_TABLE, getValueFromDB } from '../database/database'
import { VotingState } from '../models/states'
import { Account } from '../utils'
import { getWeb3 } from '../utils/web3'
import { privateKey } from '../private-key'
// import { unlockAccountRPC } from './rpc'
import { unlockAccountRPC, getAccount, getAccountNonce } from './rpc'
import { Transaction } from "@ethereumjs/tx";
import { Common } from "@ethereumjs/common";

const ballotContract = require('../contract-abis/Ballot.json')

const web3 = getWeb3()
const account = Account.getAccount()
const Tx = require('ethereumjs-tx').Transaction
const toHex = (number: BN): string => web3.utils.toHex(number)

/**
 * Returns a Contract object with which one can interface with the Ballot.
 */
const getContract = (): any => {
  const web3 = getWeb3()

  const contractAddress: string = getValueFromDB(BALLOT_ADDRESS_TABLE)
  console.log("contractAddress", contractAddress)
  const contract = new web3.eth.Contract(ballotContract.abi, contractAddress)
  return contract
}

/**
 * Returns the authority account and unlocks it
 */
export const getAuthAccount = async (): Promise<string> => {
  // read out wallet address
  const wallet = Account.getWallet()
  const password = Account.getPassword()
  const port = process.env.PARITY_NODE_PORT as string
  const url = `http://${process.env.PARITY_NODE_IP}:${port}`

  try {
    return await unlockAccountRPC(url, password, wallet)
  } catch (error) {
    console.log(error)
    throw new Error(`Unable to unlock account for ${wallet}.`)
  }
}

/**
 * Get the system parameters
 */
export const getSystemParameters = async (): Promise<number[]> => {
  const contract = getContract()
  try {
    return await contract.methods.getParameters().call()
  } catch (error) {
    console.log(error)
    throw new Error('Could not get system parameters.')
  }
}

/**
 * Returns a boolean indicating if the ballot is still open.
 */
export const isBallotOpen = async (): Promise<boolean> => {
  const contract = getContract()
  try {
    const status = await contract.methods.getBallotStatus().call()
    return status === VotingState.VOTING
  } catch (error) {
    console.log(error)
    throw new Error('Could not determine if ballot is open.')
  }
}

export const getBallotState = async (): Promise<VotingState> => {
  const contract = getContract()
  try {
    console.log("getBallotStatus")
    const status: string = await contract.methods.getBallotStatus().call()
    console.log(`BallotStatus: ${status}`)
    // casting to state enum
    return (<any>VotingState)[status]
  } catch (error) {
    console.log(error)
    throw new Error('The status of the Ballot could no be fetched.')
  }
}

export const getVotingQuestion = async (): Promise<string> => {
  const contract = getContract()
  try {
    const question: string = await contract.methods.getVotingQuestion().call()
    return question
  } catch (error) {
    console.log(error)
    throw new Error('Could not get the voting question from the contract')
  }
}

/**
 * Distributed key generation. Submits one the public key to the Ballot Contract.
 *
 * @param keyShare the sealers public key share
 * @param keyGenProof the sealers proof for the key generation
 */
export const submitPublicKeyShare = async (
  keyShare: FFelGamal.KeyPair,
  keyGenProof: FFelGamal.Proof.KeyGenerationProof
): Promise<void> => {
  const contract = getContract()
  // const account = await getAuthAccount()
  try {
    console.log("getNrOfPublicKeyShares")
    let nrOfPublicKeyShares = await getNrOfPublicKeyShares() 
    console.log(nrOfPublicKeyShares)
    // console.log("getPublicKeyShares")
    // let publicKeyShares = await getPublicKeyShares()
    // console.log(publicKeyShares)
    const txData = await contract.methods.submitPublicKeyShare(toHex(keyShare.h), toHex(keyGenProof.c), toHex(keyGenProof.d)).encodeABI()
    // const rawTxOptions = {
      // nonce: await Account.getAccountNonce(),
      // from: account.address,
      // to: getValueFromDB(BALLOT_ADDRESS_TABLE), //public tx
      // data: txData, // contract binary appended with initialization value

      // // maxPriorityFeePerGas: '0x3B9ACA00',
      // // maxFeePerGas: '0x2540BE400',
      // // gasPrice: "0xBA43B7400", //ETH per unit of gas, legacy 50
      // // gasPrice: "0x4A817C800", //ETH per unit of gas, legacy 20
      // gasPrice: "0x3B9ACA00", //ETH per unit of gas, legacy 1
      // gasLimit: "0xF4240" //max number of gas units the tx is allowed to use
    // };
    await sendTx(txData)
    console.log("getNrOfPublicKeyShares")
    nrOfPublicKeyShares = await getNrOfPublicKeyShares() 
    console.log(nrOfPublicKeyShares)

    // console.log("getPublicKeyShares")
    // publicKeyShares = await getPublicKeyShares()
    // console.log(publicKeyShares)
    // console.log(rawTxOptions)
    // const tx = new Tx(rawTxOptions, {'chain':'goerli'});
    // console.log("Signing transaction...");
    // tx.sign(Buffer.from(Account.getPrivateKey().slice(2), 'hex'));
    // console.log("Serializing transaction...");
    // var serializedTx = tx.serialize();
    // console.log("Sending transaction...");
    // const pTx = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex').toString("hex"));
    // console.log("tx transactionHash: " + pTx.transactionHash);
    // console.log("tx contractAddress: " + pTx.contractAddress);
    // await contract.methods
      // .submitPublicKeyShare(toHex(keyShare.h), toHex(keyGenProof.c), toHex(keyGenProof.d))
      // .send({ from: account })
  } catch (error) {
    console.log(error)
    throw new Error('The public key share could not be submitted.')
  }
}

const sendTx = async (txData) => { 
    const rawTxOptions = {
      nonce: await Account.getAccountNonce(),
      from: account.address,
      to: getValueFromDB(BALLOT_ADDRESS_TABLE), //public tx
      data: txData, // contract binary appended with initialization value

      // maxPriorityFeePerGas: '0x3B9ACA00',
      // maxFeePerGas: '0x2540BE400',
      // gasPrice: "0xBA43B7400", //ETH per unit of gas, legacy 50
      gasPrice: "0x2540BE400", //ETH per unit of gas, legacy 10
      gasLimit: "0x1AB3F00" //max number of gas units the tx is allowed to use
    };
  const common = Common.custom(
    {
      chainId: 1337,
      defaultHardfork: "shanghai",
    },
    { baseChain: "mainnet" }
  );
    console.log(rawTxOptions)
    // const tx = new Tx(rawTxOptions, {'chain':'goerli'});
  console.log("Creating transaction...");
  const tx = new Transaction(rawTxOptions, { common });
    console.log("Signing transaction...");
    // tx.sign(Buffer.from(privateKey.slice(2), 'hex'));
    const signed = tx.sign(Buffer.from(Account.getPrivateKey().slice(2), 'hex'));
    console.log("Serializing transaction...");
    // var serializedTx = tx.serialize();
    var serializedTx = signed.serialize();
    console.log("Sending transaction...");
    const pTx = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex').toString("hex"));
    console.log("tx transactionHash: " + pTx.transactionHash);
}

/**
 * Returns the number of public key shares inside the ballot contract
 */
export const getNrOfPublicKeyShares = async (): Promise<number> => {
  const contract = getContract()
  try {
    return parseInt(await contract.methods.getNrOfPublicKeyShares().call())
  } catch (error) {
    console.log(error)
    throw new Error('The number of public key shares could not be fetched.')
  }
}

export const getPublicKeyShares = async (): Promise<number> => {
  const contract = getContract()
  try {
    return await contract.methods.getPublicKeyShares().call()
  } catch (error) {
    console.log(error)
    throw new Error('The number of public key shares could not be fetched.')
  }
}

/**
 * Fetches the final voting result -> number of yes votes.
 */
export const getVoteResult = async (): Promise<number> => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    return await contract.methods.getVoteResult().call({ from: authAcc })
  } catch (error) {
    console.log(error)
    throw new Error(
      'The final voting result could not be fetched. Maybe the voting is still ongoing or something went wrong.'
    )
  }
}

/**
 * Gets number of votes
 */
export const getNumberOfVotes = async (): Promise<number> => {
  const contract = getContract()
  // const authAcc = await getAuthAccount()
  try {
    // return await contract.methods.getNumberOfVotes().call({ from: authAcc })
    return await contract.methods.getNumberOfVotes().call()
  } catch (error) {
    console.log(error)
    throw new Error('The number of votes could not be assessed.')
  }
}

/**
 * Gets one vote from the ballot
 *
 * @param index the index of the vote
 */
export const getVote = async (index: number): Promise<BN[]> => {
  const contract = getContract()
  // const authAcc = await getAuthAccount()
  try {
    // return await contract.methods.getVote(index).call({ from: authAcc })
    return await contract.methods.getVote(index).call()
  } catch (error) {
    console.log(error)
    throw new Error(`Could not fetch vote ${index}`)
  }
}

// HELPERS
export const toSystemParams = (params: number[]): FFelGamal.SystemParameters => {
  const systemParams: FFelGamal.SystemParameters = {
    p: new BN(params[0]),
    q: new BN(params[1]),
    g: new BN(params[2]),
  }
  return systemParams
}

export const getAllVotes = async (): Promise<FFelGamal.Cipher[]> => {
  const votes: FFelGamal.Cipher[] = []
  const voteCount = await getNumberOfVotes()
  console.log(`voteCount: ${voteCount}`)

  for (let i = 0; i < voteCount; i++) {
    const vote: BN[] = await getVote(i)
    const c: FFelGamal.Cipher = { a: vote[0], b: vote[1] }
    votes.push(c)
  }
  return votes
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const homomorphicallyAddVotes = (
  votes: FFelGamal.Cipher[],
  systemParameters: FFelGamal.SystemParameters
): FFelGamal.Cipher => {
  // homomorphically add votes
  return FFelGamal.Voting.addVotes(votes, systemParameters)
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const decryptShare = (
  sumCipher: FFelGamal.Cipher,
  systemParameters: FFelGamal.SystemParameters,
  privateKeyShare: BN
): BN => {
  // create decrypted share
  return FFelGamal.Encryption.decryptShare(systemParameters, sumCipher, privateKeyShare)
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const generateDecryptionProof = (
  sumCipher: FFelGamal.Cipher,
  systemParameters: FFelGamal.SystemParameters,
  privateKeyShare: BN
): FFelGamal.Proof.DecryptionProof => {
  const uniqueAddress: string = Account.getWallet()

  // create proof for homomorphic sum
  const decryptedShareProof: FFelGamal.Proof.DecryptionProof = FFelGamal.Proof.Decryption.generate(
    sumCipher,
    systemParameters,
    privateKeyShare,
    uniqueAddress
  )
  return decryptedShareProof
}

const sendTx = async (txData) => { 
    const rawTxOptions = {
      nonce: await getAccountNonce(),
      from: account.address,
      to: getValueFromDB(BALLOT_ADDRESS_TABLE), //public tx
      data: txData, // contract binary appended with initialization value

      // maxPriorityFeePerGas: '0x3B9ACA00',
      // maxFeePerGas: '0x2540BE400',
      // gasPrice: "0xBA43B7400", //ETH per unit of gas, legacy 50
      gasPrice: "0x2540BE400", //ETH per unit of gas, legacy 10
      gasLimit: "0x1AB3F00" //max number of gas units the tx is allowed to use
    };
  const common = Common.custom(
    {
      chainId: 1337,
      defaultHardfork: "shanghai",
    },
    { baseChain: "mainnet" }
  );
    console.log(rawTxOptions)
    // const tx = new Tx(rawTxOptions, {'chain':'goerli'});
  console.log("Creating transaction...");
  const tx = new Transaction(rawTxOptions, { common });
    console.log("Signing transaction...");
    // tx.sign(Buffer.from(privateKey.slice(2), 'hex'));
    const signed = tx.sign(Buffer.from(privateKey.slice(2), 'hex'));
    console.log("Serializing transaction...");
    // var serializedTx = tx.serialize();
    var serializedTx = signed.serialize();
    console.log("Sending transaction...");
    const pTx = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex').toString("hex"));
    console.log("tx transactionHash: " + pTx.transactionHash);
}

export const submitDecryptedShare = async (
  sumCipher: FFelGamal.Cipher,
  decryptedShare: BN,
  decryptedShareProof: FFelGamal.Proof.DecryptionProof
): Promise<any> => {
    console.log("submitDecryptedShare")
  const contract = getContract()
  // const authAcc = await getAuthAccount()

  // submit decrypted share to the contract with a proof
  try {
    const txData = await contract.methods.submitDecryptedShare(
        toHex(decryptedShare),
        toHex(sumCipher.a),
        toHex(sumCipher.b),
        toHex(decryptedShareProof.a1),
        toHex(decryptedShareProof.b1),
        toHex(decryptedShareProof.d),
        toHex(decryptedShareProof.f)
        ).encodeABI()
    await sendTx(txData)
    // return await contract.methods
      // .submitDecryptedShare(
        // toHex(decryptedShare),
        // toHex(sumCipher.a),
        // toHex(sumCipher.b),
        // toHex(decryptedShareProof.a1),
        // toHex(decryptedShareProof.b1),
        // toHex(decryptedShareProof.d),
        // toHex(decryptedShareProof.f)
      // )
      // .send({ from: authAcc })
  } catch (error) {
    console.log(error)
    throw new Error('The decrypted share + proof could not be submitted.')
  }
}

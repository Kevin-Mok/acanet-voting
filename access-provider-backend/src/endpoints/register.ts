import axios from 'axios'
import express from 'express'

import { serverConfig } from '../config'
import {
  addToList,
  DOES_ACCOUNT_EXIST,
  getListFromDB,
  REGISTERED_VOTERS_TABLE,
  USED_TOKENS_TABLE,
  VALID_TOKENS_TABLE,
} from '../database/database'
import { VotingState } from '../models/state'
import { verifyAddress } from '../utils/addressVerification'
import { createAccount, unlockAccountRPC } from '../utils/rpc'
import { fundWallet } from '../utils/web3'

const router: express.Router = express.Router()

// http response messages
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const TOKEN_INVALID: string = 'Address registration failed. Signup token is not valid or has already been used.'
const NO_BALLOT_ADDRESS: string = 'Could not get ballot address!'
const WRONG_PHASE: string = 'Wallet funding only possible if in phase VOTING.'
const ACCOUNT_CREATION_FAILED: string = 'The wallet could not be created!'
const ACCOUNT_UNLOCK_FAILED: string = 'The wallet could not be unlocked!'
const SUCCESS_MSG: string = 'Successfully verified token and registered address. Happy Voting!'

export const isTokenValid = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const validTokens = getListFromDB(VALID_TOKENS_TABLE)
  return validTokens.includes(token)
}

export const hasTokenAlreadyBeenUsed = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const usedTokens = getListFromDB(USED_TOKENS_TABLE)
  return usedTokens.includes(token)
}

export const verifyVoterToken = (token: string): boolean => {
  return isTokenValid(token) && !hasTokenAlreadyBeenUsed(token)
}

router.post('/register', async (req, res) => {
  const voterToken: string = req.body.token
  const voterAddress: string = req.body.address

  let state: VotingState
  try {
    const response = await axios.get(`${serverConfig.authUrl}/state`)
    state = response.data.state
    console.log(state)
  } catch (error) {
    throw new Error('Could not fetch state from authority.')
  }

  // wallets can and should only be funded in the VOTING phase
  if (state !== VotingState.VOTING) {
    res.status(400).json({ success: false, msg: WRONG_PHASE })
    return
  }

  // verify that the provided address is valid and not already registered
  if (!verifyAddress(REGISTERED_VOTERS_TABLE, voterAddress)) {
    res.status(400).json({ success: false, msg: ADDRESS_INVALID })
    return
  }

  // verify that the provided token is valid and has not already been used
  // if (!verifyVoterToken(voterToken)) {
    // res.status(400).json({ success: false, msg: TOKEN_INVALID })
    // return
  // }

  // get ballot address from voting authority backend (to later return it to the user so that he can cast his vote)
  // If this is reached, then the ballot is for sure deployed and open, therefore we can return it at the end
  let ballotAddress = ''
  try {
    const data = await axios.get(`${serverConfig.authUrl}/deploy`)
    ballotAddress = data.data.address
    if (!ballotAddress) {
      throw new Error()
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: NO_BALLOT_ADDRESS })
    return
  }

  // create access provider account and unlock it if this not already happened
  // if (!getListFromDB(DOES_ACCOUNT_EXIST)) {
    // let accountAddress: string = ''
    // try {
      // accountAddress = await createAccount(
        // serverConfig.nodeUrl,
        // serverConfig.accountPassword,
        // serverConfig.accountPassword
      // )
    // } catch (error) {
      // res.status(500).json({ msg: ACCOUNT_CREATION_FAILED, error: error.message })
      // return
    // }

    // if (accountAddress !== serverConfig.accountAddress) {
      // res.status(500).json({
        // msg: ACCOUNT_CREATION_FAILED,
        // expectedAddress: serverConfig.accountAddress,
        // createdAddress: accountAddress,
      // })
      // return
    // }

    // try {
      // await unlockAccountRPC(serverConfig.nodeUrl, serverConfig.accountPassword, serverConfig.accountAddress)
    // } catch (error) {
      // res.status(500).json({ msg: ACCOUNT_UNLOCK_FAILED, error: error.message })
      // return
    // }
  // }

  // fund wallet of voter
  // try {
    // await fundWallet(voterAddress)
  // } catch (error) {
    // res.status(500).json({ msg: error.message })
    // return
  // }

  // store used token and address of registered voter
  addToList(USED_TOKENS_TABLE, [voterToken])
  const registeredAddressess = getListFromDB(REGISTERED_VOTERS_TABLE)
  if (!registeredAddressess.includes(voterAddress)) {
      addToList(REGISTERED_VOTERS_TABLE, [voterAddress])
  }

  res.status(201).json({ success: true, msg: SUCCESS_MSG, ballot: ballotAddress })
})

export default router

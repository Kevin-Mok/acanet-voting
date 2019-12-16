import axios, { AxiosResponse } from 'axios'
import fs from 'fs'
import { VotingState } from '../models/states'

const authBackendUrl = () => `http://${process.env.VOTING_AUTH_BACKEND_IP}:${process.env.VOTING_AUTH_BACKEND_PORT}`

export const fetchAndStoreChainspec = async () => {
  let result
  let chainspec
  try {
    result = await axios.get(authBackendUrl() + '/chainspec')
  } catch (error) {
    console.log(error)
    throw new Error('Unable to fetch the chainspec from the auth backend. Check if the system is in the correct state.')
  }

  try {
    chainspec = JSON.stringify(result.data)
    fs.writeFileSync('src/chainspec/chain.json', chainspec)
  } catch (error) {
    console.log(error)
    throw new Error('Could not store the chainspec to src/chainspec/chain.json')
  }
}

export const getBootNodeUrl = async (myUrl: string) => {
  let bootnode
  try {
    // get bootnode from auth backend
    const response = await axios.post(authBackendUrl() + '/connectionNode', {
      url: myUrl,
    })
    bootnode = response.data.connectTo
  } catch (error) {
    console.log(error)
    throw new Error('Could not get the bootnode from the authority backend.')
  }
  return bootnode
}

export const registerWallet = async (addressToRegister: string) => {
  try {
    await axios.post(authBackendUrl() + '/chainspec', {
      address: addressToRegister,
    })
  } catch (error) {
    console.log(error.response.data.msg)
    throw new Error(`Could not register ${addressToRegister} with the authority backend. ${error.response.data.msg}`)
  }
}

export const getBallotAddress = async () => {
  try {
    const response = await axios.get(authBackendUrl() + '/deploy')
    if (response.status === 204) {
      return ''
    }
    return response.data.address
  } catch (error) {
    console.log(error)
    console.log(error.response.data.msg)
    throw new Error(`Unable to get the address of the ballot from the authority backend. ${error.response.data.msg}`)
  }
}

interface StateResponse {
  state: VotingState
}

export const fetchState = async (): Promise<VotingState> => {
  try {
    const response: AxiosResponse<StateResponse> = await axios.get(authBackendUrl() + '/state')
    if (response.status === 200) {
      return response.data.state
    } else {
      throw new Error(`Status: ${response.status}`)
    }
  } catch (error) {
    throw new Error(`Unable to get state from authority backend. ${error.msg}`)
  }
}

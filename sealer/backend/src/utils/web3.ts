import Web3 from 'web3'

// export const getWeb3 = (): Web3 => {
  // const port = process.env.PARITY_NODE_PORT as string
  // const url = `http://${process.env.PARITY_NODE_IP}:${port}`
  // const provider = new Web3.providers.HttpProvider(url)
  // const web3: Web3 = new Web3(provider)
  // return web3
// }
import { parityConfig } from '../config'

export const getWeb3 = (): Web3 => {
  const url = parityConfig.nodeUrl
  const provider = new Web3.providers.HttpProvider(url)
  return new Web3(provider)
}


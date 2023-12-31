import { Paper } from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core/styles'
import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

import ChainInfo from '../components/ChainInfo/ChainInfo'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import Question from '../components/Question/Question'
import VotingPanel from '../components/VotingPanel/VotingPanel'
import BallotContract from '../contract-abis/Ballot.json'
import { useVoterStore } from '../store'
import getWeb3 from '../util/getWeb3'

const VotingPage: React.FC = () => {
  const classes = useStyles()
  const [balance, setBalance] = useState('')
  const [votingQuestion, setVotingQuestion] = useState('')
  const [ballot, setBallot] = useState()
  const state = useVoterStore()

  const initializePage = async (): Promise<void> => {
    // get web3 context and the ballot contract
    console.log(state)
    const web3: Web3 = await getWeb3(state.getConnectionNodeUrl())
    console.log(`node url: ${state.getConnectionNodeUrl()}`)
    //@ts-ignore
    const contract = new web3.eth.Contract(BallotContract.abi, state.getBallotContractAddress())
    // const contract = new web3.eth.Contract(BallotContract.abi, state.getBallotContractAddress())
    // const contract = [state.getBallotContractAddress(), BallotContract.abi]
    // const contractInfo = [state.getBallotContractAddress(), BallotContract.abi]
    console.log(`contract: ${contract}`)
    setBallot(contract)
    // query the balance of the voter wallet
    const balance = await web3.eth.getBalance(state.getWallet())
    setBalance(balance)
    console.log(`balance: ${balance}`)

    // get the voting question to display
    const question = await contract.methods.getVotingQuestion().call({ from: state.getBallotContractAddress() })
    // const question = await contract.methods.getVotingQuestion().call()
    setVotingQuestion(question)
    console.log(`question: ${question}`)
  }

  useEffect(() => {
    initializePage()
  }, [])

  return (
    <Paper>
      <Header />
      <div className={classes.root}>
        <Question votingQuestion={votingQuestion} />
        <VotingPanel contract={ballot}  contractAddress={state.contractAddress} walletAddress={state.wallet} />
        <ChainInfo contractAddress={state.contractAddress} walletAddress={state.wallet} balance={balance} />
      </div>
      <Footer />
    </Paper>
  )
}

export default VotingPage

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: 748,
    padding: theme.spacing(3, 2),
  },
}))

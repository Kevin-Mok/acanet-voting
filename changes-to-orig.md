# Election Process (Phases)
## Registration
- bypass sealer registration since using Ganache blockchain
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/voting-authority/backend/src/endpoints/state.ts#L228-L236

## Pairing
- skip signing up sealers as validators

## Key Generation
### Public Key Shares from Sealers
- generate/submit public key shares from sealers automatically
- calls [`/generateKeys` endpoint](https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/sealer/backend/src/routes/generateKeys.ts#L10) from sealers when 
  deploying contract which generate/submits public key
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/voting-authority/backend/src/endpoints/deploy.ts#L131

## Voting
- use MetaMask instead to login/vote in voter frontend instead of with credentials
  - login = https://github.com/Kevin-Mok/acanet-voting/blob/master/voter-frontend/src/pages/LoginPage.tsx
  - vote
    - https://github.com/Kevin-Mok/acanet-voting/blob/master/voter-frontend/src/components/VotingPanel/VotingPanel.tsx
    - https://github.com/Kevin-Mok/acanet-voting/blob/master/voter-frontend/src/services/ballotService.ts

## Tallying phase
- submit decrypted shares from sealers automatically when 
  clicking "Next" on closing ballot
  - send POST request to sealer backend `/decrypt`
    - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/voting-authority/backend/src/endpoints/state.ts#L346
    - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/sealer/backend/src/routes/decrypt.ts#L10

# Code
- use [local Ganache blockchain](https://github.com/Kevin-Mok/provotum-v2/blob/docs/ganache-pv.sh)
  - loads deployment/voter wallets
- can also [run on Goerli](https://github.com/Kevin-Mok/provotum-v2/blob/2c7c042ce415b459de12046e2ac8836a7fa6b9f3/sealer/backend/src/services/ballotManager.ts#L184)
  - can verify contract on Etherscan using [hardhat-verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)
- bypass `require(votingState == VotingState.RESULT` in `getVoteResult` 
  in contract (see [`open-problems.md`](https://github.com/Kevin-Mok/provotum-v2/blob/docs/open-problems.md#bypass-result-check))
- update sending all transactions to blockchain [using `@ethereumjs/tx`](https://github.com/Kevin-Mok/provotum-v2/blob/2c7c042ce415b459de12046e2ac8836a7fa6b9f3/voting-authority/backend/src/utils/ballotManager/ballotManager.ts#L198) vs. 
  authentication using account RPC (outdated method)
- don't [keep session storage](https://github.com/Kevin-Mok/provotum-v2/blob/2c7c042ce415b459de12046e2ac8836a7fa6b9f3/voter-frontend/src/AppManager.tsx#L36) in voting 
  frontend
  - keeps old contract address when restarting processes 
    while developing
- only use [1 sealer backend](https://github.com/Kevin-Mok/acanet-voting/blob/14cddc3a822357587231a57673fb81846ff6a5a5/voting-authority/backend/src/config.ts#L7-L8)
  - uncomment sending POST requests to sealers
    - https://github.com/Kevin-Mok/provotum-v2/blob/2c7c042ce415b459de12046e2ac8836a7fa6b9f3/voting-authority/backend/src/endpoints/sealers.ts#L3-L4

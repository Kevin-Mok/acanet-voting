# Docker Prebuilt
- can't login to voting page in voter frontend
  - details = https://github.com/alexscheitlin/master-project-evoting/issues/218
- can't replace voter frontend image with modified version 
  to try and fix above issue
  - details = https://stackoverflow.com/questions/76798983/docker-container-not-starting-after-rebuilding

# Modified Code
## Can't Get System Parameters
- code fails when during Pairing phase when sending POST 
  request to sealer backend's `/generateKeys` endpoint
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/voting-authority/backend/src/endpoints/deploy.ts#L131
- can't fetch contract's system params.
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/sealer/backend/src/services/ballotManager.ts#L57

## Can't Submit Public Key Share (VM)
- code fails when during Pairing phase when sending POST 
  request to sealer backend's `/generateKeys` endpoint
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/voting-authority/backend/src/endpoints/deploy.ts#L131
- EVM reverts txn
  - https://github.com/Kevin-Mok/acanet-voting/blob/fd6c3f718e10f25a3f6a4466d6379d22a7e06bc8/sealer/backend/src/services/ballotManager.ts#L136

## Bypass `RESULT` Check
- https://github.com/Kevin-Mok/provotum-v2/blob/d43fad9a53aef99d7dee7c52a8b0dcaab08bccd6/contracts/contracts/FiniteField/Ballot.sol#L456
- tested that state actually changes to result by end of `combineDecryptedShares`
  * https://github.com/Kevin-Mok/provotum-v2/blob/d43fad9a53aef99d7dee7c52a8b0dcaab08bccd6/contracts/contracts/FiniteField/Ballot.sol#L258-L265
  * when check in voting authority backend right after `combineDecryptedShares`, 
    ballot status is not `RESULT` 
    * https://github.com/Kevin-Mok/provotum-v2/blob/d43fad9a53aef99d7dee7c52a8b0dcaab08bccd6/voting-authority/backend/src/utils/ballotManager/ballotManager.ts#L284

### To Try
- run modified code in VM without commented out `getVoteResult` 
  check for RESULT state without 0 votes
  - need to recompile contract and distribute

## Yes Vote Counts as No 
- no vote counts as no

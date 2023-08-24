# Voting Authority
## Prebuilt Docker
- doesn't start frontend container

# Sealer
## Local
- can submit address to voting authority
- can't load blockchain config

## Local Docker
- can't find voting authority backend

# Prebuilt
- voting authority backend can't fetch peers (on local machine, works in VM)
  - /state 500 {"state":"PAIRING","msg":"Could not get the number of connected authorities (web3.eth.net.getPeerCount)."}
- tried removing all remote images
  - doesn't work

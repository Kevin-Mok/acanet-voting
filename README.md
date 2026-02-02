# Acanet Voting (Provotum 2.0)

A decentralized e-voting system built on Ethereum implementing threshold cryptography for secure, verifiable elections with end-to-end encryption.

![Solidity](https://img.shields.io/badge/Solidity-0.5.13-purple)
![React](https://img.shields.io/badge/React-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Node-green)
![Ethereum](https://img.shields.io/badge/Ethereum-Goerli-orange)

## Overview

A production-ready blockchain-based e-voting system that uses threshold cryptography to ensure vote privacy and verifiability. Multiple sealers (validators) participate in key generation and decryption, preventing any single party from compromising the election.

## Key Features

### Cryptographic Security
- **Threshold Decryption** - Multiple sealers required to decrypt results
- **Zero-Knowledge Proofs** - Vote validity verification without revealing content
- **End-to-End Encryption** - Ballots encrypted from submission to tallying
- **Decentralized Key Generation** - No single point of trust

### Election Management
- **Phase-Based Workflow** - Registration → Pairing → Key Gen → Voting → Tally → Results
- **Multi-Role System** - Voters, Authority, Identity Provider, Access Provider, Sealers
- **MetaMask Authentication** - Secure wallet-based voting
- **Ethstats Monitoring** - Real-time blockchain explorer

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Voter Frontend                           │
│              (React + MetaMask + Web3.js)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Smart Contracts (Solidity)                  │
│  Ballot.sol | VoteProofVerifier | KeyGenProofVerifier       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Sealer 1   │  │   Sealer 2   │  │   Sealer 3   │
│  (Parity PoA)│  │  (Parity PoA)│  │  (Parity PoA)│
└──────────────┘  └──────────────┘  └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 16, Material-UI, TypeScript, Zustand |
| **Backend** | Express.js, TypeScript, LowDB |
| **Blockchain** | Solidity 0.5.13, Truffle, Hardhat |
| **Consensus** | Parity PoA (Proof of Authority) |
| **Web3** | Web3.js, MetaMask, @ethereumjs/tx |
| **Cryptography** | Threshold encryption, ZK proofs |
| **DevOps** | Docker, docker-compose, Lerna monorepo |

## Project Structure

```
acanet-voting/
├── voter-frontend/              # Voter voting interface
├── voting-authority/
│   ├── backend/                 # Election admin API
│   └── frontend/                # Admin dashboard
├── sealer/
│   ├── backend/                 # Threshold decryption service
│   ├── frontend/                # Sealer dashboard
│   └── parity-node/             # PoA blockchain node
├── contracts/
│   └── FiniteField/
│       ├── Ballot.sol           # Main voting contract
│       └── *ProofVerifier.sol   # ZK proof contracts
├── identity-provider-backend/   # Voter identity management
├── access-provider-backend/     # Eligibility verification
├── poa-blockchain/              # Blockchain configuration
├── ethstats/                    # Blockchain explorer
└── lerna.json                   # Monorepo configuration
```

## Quick Start

### Docker (Prebuilt Images)

```bash
# Start all services
./docker-prebuilt-up.sh

# Access interfaces:
# Voter Frontend: http://172.1.1.30:3000
# Voting Authority: http://172.1.1.41:4001
# Blockchain Explorer: http://127.0.0.1:6001

# Shutdown
./docker-prebuilt-down.sh
```

### Local Development

```bash
# Install monorepo dependencies
npm run lerna:install

# Start local blockchain
./ganache-pv.sh

# Deploy contracts
cd contracts && npm run migrate:dev

# Start services (each in separate terminal)
cd identity-provider-backend && npm run serve:localhost
cd access-provider-backend && npm run serve:localhost
cd voting-authority/backend && npm run serve:localhost
cd voter-frontend && npm run start:localhost
```

## Election Phases

1. **Registration** - Voters register with identity provider
2. **Pairing** - Sealers pair with voting authority
3. **Key Generation** - Threshold key shares created
4. **Voting** - Encrypted ballots submitted to blockchain
5. **Tallying** - Sealers decrypt using threshold shares
6. **Results** - Final count verified and published

## Why This Project is Interesting

### Technical Highlights

1. **Threshold Cryptography Implementation**
   - Multi-party key generation
   - Threshold decryption requiring multiple sealers
   - No single party can decrypt votes alone

2. **Zero-Knowledge Proof System**
   - Vote validity verification
   - Key generation proof verification
   - Sum proof verification for tallying

3. **Full-Stack Blockchain Architecture**
   - 7+ microservices in monorepo
   - Parity PoA consensus
   - Docker orchestration

4. **Production Security**
   - End-to-end encryption
   - MetaMask authentication
   - Multi-party verification

### Skills Demonstrated

- **Blockchain Development**: Solidity, Truffle, Parity PoA
- **Cryptography**: Threshold encryption, ZK proofs
- **Full-Stack**: React, Express, TypeScript
- **DevOps**: Docker, Lerna monorepo, microservices
- **Security**: E2E encryption, access control, verification

## Documentation

- [README-orig.md](README-orig.md) - Original setup instructions
- [start.md](start.md) - Service startup guide
- [changes-to-orig.md](changes-to-orig.md) - Modifications from original
- [solutions-to-running.md](solutions-to-running.md) - Troubleshooting

## Credits

Based on [Provotum](https://github.com/meck93/provotum-2.0) by Moritz Eck, Alex Scheitlin, and Nik Zaugg.

## Author

[Kevin Mok](https://github.com/Kevin-Mok)

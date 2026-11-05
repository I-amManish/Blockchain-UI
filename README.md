# MyCoin — Educational Blockchain

MyCoin is a lightweight blockchain implementation built with **JavaScript and Node.js** to demonstrate core blockchain concepts, including proof-of-work mining, cryptographic transaction signatures, block validation, and balance management.

The project focuses on understanding how a blockchain works internally and how transaction validation helps protect its integrity.

## Features

- **Blockchain structure:** Maintains an ordered chain of blocks linked through cryptographic hashes.
- **Proof of Work (PoW):** Mines blocks by finding hashes that satisfy a configurable difficulty.
- **Cryptographic hashing:** Uses SHA-256 to calculate transaction and block hashes.
- **Digital signatures:** Uses elliptic-curve cryptography (`secp256k1`) to sign transactions and verify their authenticity.
- **Transaction validation:** Rejects invalid amounts, altered signed transactions, and transactions from senders without sufficient funds.
- **Balance management:** Calculates account balances from confirmed transactions and accounts for pending outgoing transactions.
- **Double-spending protection:** Checks historical balances and prevents transactions from spending more than the sender's confirmed funds.
- **Mining rewards:** Supports delayed mining rewards and validates reward amounts, recipients, and placement.
- **Chain integrity:** Detects block tampering, invalid proof of work, broken block links, and invalid genesis blocks.
- **Automated testing:** Includes tests for normal operations, invalid transactions, malicious modifications, and mining validation.

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Core blockchain implementation |
| Node.js | JavaScript runtime |
| `crypto-js` | SHA-256 hashing |
| `elliptic` | Public/private keys and digital signatures |
| `node:test` | Automated testing |

## Project Structure

```text
MyCoin/
├── src/
│   ├── blockchain.js       # Blockchain, blocks and transactions
│   └── main.js              # Application entry point
├── test/
│   └── blockchain.test.js  # Automated test suite
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — preferably a current LTS version.
- npm, which is included with Node.js.
- Git (optional, for cloning the repository).

Check your installations:

```bash
node --version
npm --version
```

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/I-amManish/Blockchain-UI.git
cd Blockchain-UI/MyCoin
```

Install the dependencies:

```bash
npm install
```

## Running the Project

Start the application using the configured npm script:

```bash
npm start
```

This runs `src/main.js`. The application's available commands or interactions depend on the implementation in that file.

## Running Tests

Execute the automated test suite:

```bash
npm test
```

The project uses Node.js's built-in test runner, so no separate test framework is required.

The current test suite contains **18 tests**, covering:

- Genesis block initialization.
- Block indexing and proof-of-work verification.
- Detection of block tampering.
- Transaction amount and signature validation.
- Insufficient-funds rejection.
- Prevention of pending transactions collectively overspending a balance.
- Miner identity and reward validation.
- Rejection of duplicate, forged, or incorrectly assigned mining rewards.
- Genesis block transaction restrictions.
- Historical balance validation.
- Rejection of blocks that overspend historical funds.

**Latest verified test result:** 18 passed, 0 failed.

## How It Works

### 1. Transactions

A transaction records the sender, recipient, and amount. The sender signs the transaction using a private key, and the signature can be verified against the sender's public key.

### 2. Blocks

Blocks contain transactions and metadata such as an index, timestamp, previous block hash, miner address, nonce, and calculated hash.

Each block references the preceding block's hash, linking the blocks into a chain.

### 3. Proof of Work

Mining repeatedly changes the block's nonce until its hash satisfies the configured difficulty requirement. This computational work makes modifying an existing block more difficult because the affected proof of work must be recalculated.

### 4. Transaction and Balance Validation

Before transactions are accepted or blocks are mined, the implementation checks relevant transaction and balance constraints. Historical balance validation helps prevent a transaction from spending funds that were not available before that block.

### 5. Mining Rewards

The blockchain supports delayed mining rewards. Reward transactions are validated to ensure they appear in the correct position in the chain, have the expected amount, and are assigned to the appropriate miner.

### 6. Chain Validation

Chain validation checks block structure, previous-hash links, calculated hashes, proof of work, transaction and reward rules, and historical balances. If an invalid modification is detected, the chain is rejected.

## Security and Educational Scope

MyCoin is an educational implementation intended for learning and experimentation.

It is **not a production-ready cryptocurrency**. A real-world blockchain would require additional considerations, including secure key storage, network consensus, peer-to-peer communication, persistent storage, denial-of-service protections, and independent security audits.

Do not use real funds or sensitive private keys with this project.

## Future Improvements

Potential extensions include:

- Persistent blockchain storage.
- A peer-to-peer network between nodes.
- Transaction and block APIs.
- A wallet interface for key generation and signing.
- Improved logging and error handling.
- Additional adversarial tests and security reviews.
- A blockchain explorer interface.

## Contributing

Contributions, bug reports, and suggestions are welcome. For changes to transaction validation or consensus-related logic, add automated tests to demonstrate both expected behavior and rejection of invalid cases.

## License

No license is specified here. Add a `LICENSE` file before distributing the project if you intend to grant others explicit rights to use, modify, or redistribute it.

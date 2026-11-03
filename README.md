# Blockchain UI & Execution Engine

An educational full-stack blockchain platform combining a Node.js consensus engine with a React + TypeScript interactive dashboard. Designed to demonstrate core blockchain mechanisms including cryptographic signatures, Proof-of-Work (PoW), transaction validation, overspending prevention, and historical chain validation.

---

## 🌟 Key Features

- **Proof-of-Work (PoW) Consensus:** Dynamic block mining with configurable difficulty target verification.
- **Elliptic-Curve Cryptography:** Transaction signing and key generation using `secp256k1` curves via `elliptic` and SHA-256 hashing via `crypto-js`.
- **Strict Overspending Protection:** Validates sender balances against both confirmed chain state and unmined pending transaction queues.
- **Secure Mining Reward Rules:** Binds miner identities into block headers, enforces one reward per mined block, and validates historical reward distribution.
- **Automated Test Suite:** 18 comprehensive unit tests built on the native Node.js test runner (`node --test`).
- **Interactive UI:** React + TypeScript frontend for inspecting blocks, generating wallets, sending transactions, and tracking pending queues.

---

## 📁 Project Structure

```text
Blockchain-UI/
├── README.md
└── MyCoin/
    ├── package.json
    ├── src/
    │   ├── blockchain.js       # Core Blockchain, Block, & Transaction classes
    │   ├── keygenerator.js     # Secp256k1 keypair generator utility
    │   └── main.js             # Execution CLI demonstration script
    ├── test/
    │   └── blockchain.test.js  # 18-test automated unit testing suite
    └── MyCoin-frontend-react/  # React 19 + TypeScript + Vite frontend

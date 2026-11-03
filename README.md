Blockchain-UI 🪙

A full-stack educational blockchain application featuring a custom JavaScript cryptographic blockchain engine, an 18-test suite, and a modern React + TypeScript web interface built with Vite and Tailwind CSS.

📌 Overview

Blockchain-UI demonstrates the foundational principles of blockchain technology, cryptography, proof-of-work consensus, and wallet state management. It provides a visual and interactive way to explore how blocks are mined, how transactions are signed and validated, and how chain integrity is maintained.

⚠️ Disclaimer: This project is designed strictly for educational and learning purposes. It is not intended for production cryptocurrency deployments.

✨ Features

⚙️ Core Blockchain Engine (MyCoin/)

Elliptic Curve Cryptography: Uses elliptic (secp256k1) for key generation, wallet addressing, and digital signatures.

SHA-256 Hashing: Uses crypto-js to compute deterministic block and transaction hashes.

Proof-of-Work (PoW): Configurable difficulty target for mining new blocks.

Overspending & Balance Protection: Validates transactions against confirmed historical balances as well as unconfirmed pending transactions to prevent double-spending.

Mining Reward System: Miner wallet addresses are bound directly to block headers, enforcing strict reward attribution and single-reward-per-block rules.

Genesis & Chain Validation: Replays full transaction histories to verify chain integrity, sequential block indexing, and unaltered genesis blocks.

🧪 Unit Testing (MyCoin/test/)

Automated Test Suite: Includes 18 comprehensive unit tests powered by the native Node.js test runner (node --test).

Coverage Includes: Signature tampering detection, proof-of-work verification, genesis block immutability, historical balance overspending protection, duplicate reward rejection, and candidate block pre-mine validation.

💻 Frontend Interface (MyCoin/MyCoin-frontend-react/)

React 19 & TypeScript: Type-safe components and state management.

Vite: High-performance local development build tooling.

Tailwind CSS v4: Modern, responsive UI styling.

Features: Block explorer visualizer, interactive transaction creation form, pending transactions queue manager, wallet address inspector, and settings panel.

📁 Repository Structure

Blockchain-UI/
├── README.md                      # Root project documentation
├── docs/
│   └── superpowers/plans/         # Architecture & security plans
└── MyCoin/                        # Core Blockchain Workspace
    ├── package.json               # Backend dependencies & test scripts
    ├── src/
    │   ├── blockchain.js          # Transaction, Block & Blockchain implementation
    │   ├── keygenerator.js        # EC key pair generator helper
    │   └── main.js                # CLI demonstration script
    ├── test/
    │   └── blockchain.test.js     # 18-test unit suite (Node.js test runner)
    └── MyCoin-frontend-react/     # React + TypeScript Frontend
        ├── package.json           # Frontend dependencies & Vite scripts
        ├── src/
        │   ├── App.tsx            # Main React application router
        │   ├── components/        # UI tables & navigation bars
        │   ├── pages/             # Blockchain Viewer, Wallet, Settings, etc.
        │   └── services/          # Frontend blockchain service abstraction
        └── vite.config.ts         # Vite configuration file


🚀 Quick Start Guide

Prerequisites

Node.js: v18.x or higher (tested on v24.x)

npm: v9.x or higher

1. Core Engine & Test Suite Setup

Navigate to the MyCoin backend workspace:

cd MyCoin
npm install


Run Automated Tests (18 Unit Tests)

npm test


Run CLI Blockchain Simulation

npm start


2. React Frontend Setup

Open a new terminal session and navigate to the frontend directory:

cd MyCoin/MyCoin-frontend-react
npm install


Start Development Server

npm run dev


Open your browser at the URL shown in your terminal (typically http://localhost:5173).

🛡️ Security Features & Validation Rules

Transaction Authorization: Every transaction must be signed using the sender's private key matching their fromAddress public key.

Positive Finite Amounts: Transactions with zero, negative, NaN, or infinite values are rejected.

Pending Outgoing Reservation: When calculating spendable funds, pending outgoing transactions reserved in the pool are deducted automatically.

Pre-Mine Verification: Candidate blocks are evaluated for historical balance compliance before executing proof-of-work algorithms.

Mining Reward Restrictions: Mining rewards cannot be claimed in the genesis block, and subsequent blocks permit exactly one reward transaction tied to the prior block's miner.

🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out existing issues or open a pull request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. Educational use and experimentation are encouraged.

# Blockchain UI — MyCoin

An educational blockchain project that explores core blockchain concepts through a JavaScript implementation and a React + TypeScript interface.

> **Educational use only:** This project is for learning and experimentation. It is not a production blockchain, cryptocurrency, or secure wallet. Do not use real funds or real private keys.

## Project goals

- Explore blocks, hashes, proof-of-work, transactions, and digital signatures.
- Learn how a blockchain data model can be presented through a React interface.
- Practice frontend integration, TypeScript, and software testing.
- Document implementation choices and known limitations as the project develops.

## Repository structure

```text
Blockchain-UI/
└── MyCoin/
    ├── src/
    │   ├── blockchain.js       # Educational blockchain and transaction classes
    │   └── keygenerator.js     # Key-pair generation example
    ├── LEARNING_NOTES.md       # Notes on blockchain concepts and implementation
    └── MyCoin-frontend-react/
        ├── src/
        │   ├── components/     # Reusable UI components
        │   ├── pages/          # Blockchain, wallet, transaction, and settings pages
        │   └── services/       # Frontend blockchain service
        ├── package.json
        └── README.md
```

## Features represented in the code

- Blockchain and block data structures
- Proof-of-work mining demonstration
- Transaction signing and signature verification
- A React interface for viewing blocks and transactions
- Pages for creating transactions, viewing pending transactions, and inspecting wallet details
- Settings for the demonstration's mining difficulty and reward

Some frontend and blockchain-service integrations may still need work. See [Known limitations](#known-limitations) before relying on any displayed data.

## Requirements

- Node.js compatible with the Vite version specified in the frontend package
- npm

## Run the frontend

From a terminal, run:

```bash
cd MyCoin/MyCoin-frontend-react
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

To check the frontend's production build:

```bash
npm run build
```

The frontend currently depends on the `savjeecoin` npm package. The repository also contains a local blockchain implementation under `MyCoin/src/`; these implementations should not be assumed interchangeable until their APIs are aligned.

## Learning notes

See [MyCoin/LEARNING_NOTES.md](MyCoin/LEARNING_NOTES.md) for explanations of nonces, proof-of-work, blockchain data structures, and transaction lifecycle concepts.

## Known limitations

- This is a single-process learning demo, not a distributed peer-to-peer blockchain network.
- It does not provide production-grade consensus, persistent storage, or a secure wallet.
- Transaction validation, balance enforcement, mining-reward rules, and chain validation require further testing and hardening.
- The frontend and local blockchain implementation have API differences that should be resolved and covered by tests.
- Do not enter or store real private keys or use this project to hold real assets.

## Contributing

Issues, bug reports, documentation improvements, and tested code contributions are welcome. When proposing a change, describe the problem, explain the solution, and include tests where practical.

## License

No license is currently specified for this repository. Until a license is added after reviewing the licensing of the tutorial-derived code and dependencies, do not assume that the code is available for unrestricted reuse.

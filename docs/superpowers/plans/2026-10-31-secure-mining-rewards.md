# Secure Mining Rewards Implementation Plan

**Goal:** Prevent forged or malformed mining rewards while preserving
the existing delayed-reward behavior.

**Architecture:** Record each block's miner address and include it
in the block hash. Validate reward transactions against the preceding
block's miner, configured reward amount, and allowed reward count.

**Tech Stack:** Node.js, CommonJS, crypto-js, elliptic, node:test.

**Design:** Preserve the existing rule that a mining reward becomes
spendable only after being included in a later block.

## Constraints

- Keep changes on `improve-blockchain-project`.
- Preserve existing public APIs unless a change is necessary.
- Add tests before implementing reward validation.
- Do not claim production-grade cryptocurrency security.

## Review Focus

- The first mined block must not contain a reward transaction.
- A block must not contain multiple reward transactions.
- Reward amounts must equal the configured mining reward.
- A reward recipient must match the preceding block's recorded miner.
- Changing a block's miner identity must invalidate its hash.
- Legitimate delayed rewards must remain valid.

## Tasks

### Task 1: Add reward-validation tests

Files:
- Modify `MyCoin/test/blockchain.test.js`

Add tests for each case in Review Focus. Run
`node --test test/blockchain.test.js` and confirm the new tests fail
for the expected reasons before changing production code.

### Task 2: Record miner identity

File:
- Modify `MyCoin/src/blockchain.js`

Add a miner-address field to mined blocks and include it in
`Block.calculateHash()`. Preserve index and previous-hash behavior.
Verify that legitimate mining still works.

### Task 3: Enforce reward rules

File:
- Modify `MyCoin/src/blockchain.js`

Validate reward count, amount, recipient, and placement for each
block. Allow no reward in the first mined block and one reward in
each later mined block, matching the preceding block's miner.

### Task 4: Verify the complete implementation

Run:
- `node --test test/blockchain.test.js`
- `node src/main.js`
- `git diff --check`

Inspect the final diff and confirm the working tree before committing.

const test = require("node:test");
const assert = require("node:assert/strict");
const EC = require("elliptic").ec;

const { Blockchain, Transaction } = require("../src/blockchain");

const ec = new EC("secp256k1");

test("Genesis block starts at index zero", () => {
  const blockchain = new Blockchain();

  assert.equal(blockchain.chain[0].index, 0);
  assert.equal(blockchain.chain[0].previousHash, "0");
});

test("Mined blocks have valid indexes and proof of work", () => {
  const blockchain = new Blockchain();
  const minerKey = ec.genKeyPair();
  const minerAddress = minerKey.getPublic("hex");

  blockchain.minePendingTransactions(minerAddress);

  const block = blockchain.chain[1];

  assert.equal(block.index, 1);
  assert.ok(
    block.hash.startsWith("0".repeat(blockchain.difficulty))
  );
  assert.equal(blockchain.isChainValid(), true);
});

test("Blockchain detects block tampering", () => {
  const blockchain = new Blockchain();
  const minerKey = ec.genKeyPair();

  blockchain.minePendingTransactions(
    minerKey.getPublic("hex")
  );

  blockchain.chain[1].nonce += 1;

  assert.equal(blockchain.isChainValid(), false);
});

test("Transaction rejects invalid amounts", () => {
  const blockchain = new Blockchain();
  const fromAddress = ec.genKeyPair().getPublic("hex");
  const toAddress = ec.genKeyPair().getPublic("hex");

  const invalidAmounts = [0, -1, NaN, Infinity, "10"];

  for (const amount of invalidAmounts) {
    const transaction = new Transaction(
      fromAddress,
      toAddress,
      amount
    );

    assert.throws(
      () => blockchain.addTransaction(transaction),
      /positive finite number/
    );
  }
});

test("Changing a signed transaction invalidates its signature", () => {
  const blockchain = new Blockchain();
  const senderKey = ec.genKeyPair();
  const receiverKey = ec.genKeyPair();

  const transaction = new Transaction(
    senderKey.getPublic("hex"),
    receiverKey.getPublic("hex"),
    10
  );

  transaction.signTransaction(senderKey);
  transaction.amount = 11;

  assert.equal(transaction.isValid(), false);

  assert.throws(
    () => blockchain.addTransaction(transaction),
    /Cannot add invalid transaction/
  );
});

function createFundedBlockchain(walletAddress) {
  const blockchain = new Blockchain();

  // The second mining operation confirms the first reward.
  blockchain.minePendingTransactions(walletAddress);
  blockchain.minePendingTransactions(walletAddress);

  assert.equal(
    blockchain.getBalanceofAddress(walletAddress),
    blockchain.miningReward
  );

  return blockchain;
}

test("Rejects transactions when the sender has insufficient funds", () => {
  const blockchain = new Blockchain();
  const senderKey = ec.genKeyPair();
  const receiverKey = ec.genKeyPair();

  const transaction = new Transaction(
    senderKey.getPublic("hex"),
    receiverKey.getPublic("hex"),
    1
  );

  transaction.signTransaction(senderKey);

  assert.throws(
    () => blockchain.addTransaction(transaction),
    /Insufficient balance/
  );
});

test("Rejects pending transactions that collectively overspend the balance", () => {
  const senderKey = ec.genKeyPair();
  const receiverKey = ec.genKeyPair();

  const senderAddress = senderKey.getPublic("hex");
  const blockchain = createFundedBlockchain(senderAddress);

  const firstTransaction = new Transaction(
    senderAddress,
    receiverKey.getPublic("hex"),
    70
  );

  firstTransaction.signTransaction(senderKey);
  blockchain.addTransaction(firstTransaction);

  const secondTransaction = new Transaction(
    senderAddress,
    receiverKey.getPublic("hex"),
    40
  );

  secondTransaction.signTransaction(senderKey);

  assert.throws(
    () => blockchain.addTransaction(secondTransaction),
    /Insufficient balance/
  );
});

test("Accepts a valid transfer within the available balance", () => {
  const senderKey = ec.genKeyPair();
  const receiverKey = ec.genKeyPair();

  const senderAddress = senderKey.getPublic("hex");
  const blockchain = createFundedBlockchain(senderAddress);

  const transaction = new Transaction(
    senderAddress,
    receiverKey.getPublic("hex"),
    60
  );

  transaction.signTransaction(senderKey);
  blockchain.addTransaction(transaction);

  assert.ok(blockchain.pendingTransactions.includes(transaction));
  assert.equal(blockchain.getBalanceofAddress(senderAddress), 100);
});

test("Mined blocks record the miner and include it in the hash", () => {
  const blockchain = new Blockchain();
  const minerKey = ec.genKeyPair();
  const otherMinerKey = ec.genKeyPair();

  blockchain.minePendingTransactions(
    minerKey.getPublic("hex")
  );

  const block = blockchain.chain[1];
  const originalHash = block.hash;

  assert.equal(
    block.minerAddress,
    minerKey.getPublic("hex")
  );

  block.minerAddress = otherMinerKey.getPublic("hex");

  assert.notEqual(block.calculateHash(), originalHash);
});

test("Rejects a reward transaction in the first mined block", () => {
  const blockchain = new Blockchain();
  const minerKey = ec.genKeyPair();
  const attackerKey = ec.genKeyPair();

  blockchain.pendingTransactions.push(
    new Transaction(
      null,
      attackerKey.getPublic("hex"),
      blockchain.miningReward
    )
  );

  assert.throws(
    () => blockchain.minePendingTransactions(
      minerKey.getPublic("hex")
    ),
    /reward/i
  );

  assert.equal(blockchain.chain.length, 1);
});

test("Rejects a reward with an incorrect amount", () => {
  const blockchain = new Blockchain();
  const firstMiner = ec.genKeyPair();
  const nextMiner = ec.genKeyPair();

  blockchain.minePendingTransactions(
    firstMiner.getPublic("hex")
  );

  blockchain.pendingTransactions[0].amount += 1;
  const originalLength = blockchain.chain.length;

  assert.throws(
    () => blockchain.minePendingTransactions(
      nextMiner.getPublic("hex")
    ),
    /reward/i
  );

  assert.equal(blockchain.chain.length, originalLength);
});

test("Rejects a reward sent to someone other than the previous miner", () => {
  const blockchain = new Blockchain();
  const firstMiner = ec.genKeyPair();
  const nextMiner = ec.genKeyPair();
  const attacker = ec.genKeyPair();

  blockchain.minePendingTransactions(
    firstMiner.getPublic("hex")
  );

  blockchain.pendingTransactions[0].toAddress =
    attacker.getPublic("hex");

  const originalLength = blockchain.chain.length;

  assert.throws(
    () => blockchain.minePendingTransactions(
      nextMiner.getPublic("hex")
    ),
    /reward/i
  );

  assert.equal(blockchain.chain.length, originalLength);
});

test("Rejects duplicate reward transactions", () => {
  const blockchain = new Blockchain();
  const firstMiner = ec.genKeyPair();
  const nextMiner = ec.genKeyPair();
  const attacker = ec.genKeyPair();

  blockchain.minePendingTransactions(
    firstMiner.getPublic("hex")
  );

  blockchain.pendingTransactions.push(
    new Transaction(
      null,
      attacker.getPublic("hex"),
      blockchain.miningReward
    )
  );

  const originalLength = blockchain.chain.length;

  assert.throws(
    () => blockchain.minePendingTransactions(
      nextMiner.getPublic("hex")
    ),
    /reward/i
  );

  assert.equal(blockchain.chain.length, originalLength);
});

test("Preserves legitimate delayed mining rewards", () => {
  const blockchain = new Blockchain();
  const firstMiner = ec.genKeyPair();
  const secondMiner = ec.genKeyPair();

  const firstAddress = firstMiner.getPublic("hex");
  const secondAddress = secondMiner.getPublic("hex");

  blockchain.minePendingTransactions(firstAddress);
  blockchain.minePendingTransactions(secondAddress);

  const firstBlock = blockchain.chain[1];
  const secondBlock = blockchain.chain[2];

  const rewards = secondBlock.transactions.filter(
    (transaction) => transaction.fromAddress === null
  );

  assert.equal(firstBlock.minerAddress, firstAddress);
  assert.equal(secondBlock.minerAddress, secondAddress);
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].toAddress, firstAddress);
  assert.equal(rewards[0].amount, blockchain.miningReward);
  assert.equal(blockchain.isChainValid(), true);
});

test("Rejects a forged historical reward even after its block is re-mined", () => {
  const blockchain = new Blockchain();
  const firstMiner = ec.genKeyPair();
  const secondMiner = ec.genKeyPair();

  blockchain.minePendingTransactions(
    firstMiner.getPublic("hex")
  );

  blockchain.minePendingTransactions(
    secondMiner.getPublic("hex")
  );

  const block = blockchain.chain[2];

  const reward = block.transactions.find(
    (transaction) => transaction.fromAddress === null
  );

  assert.ok(reward, "Expected a reward transaction in block 2");

  // Simulate an attacker changing the reward and recalculating
  // the block's hash and proof of work.
  reward.amount += 1;
  block.hash = block.calculateHash();
  block.mineBlock(blockchain.difficulty);

  assert.equal(blockchain.isChainValid(), false);
});

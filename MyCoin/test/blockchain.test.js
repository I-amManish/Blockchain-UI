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

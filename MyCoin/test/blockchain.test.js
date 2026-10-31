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

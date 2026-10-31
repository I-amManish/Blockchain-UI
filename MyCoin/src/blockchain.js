const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;

const ec = new EC("secp256k1");

// ==================== TRANSACTION ====================

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash() {
    return SHA256(
      this.fromAddress + this.toAddress + this.amount
    ).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error(
        "You cannot sign transactions for other wallets!"
      );
    }

    const hashTx = this.calculateHash();
    const signature = signingKey.sign(hashTx, "base64");

    this.signature = signature.toDER("hex");
  }

  isValid() {
    // Mining reward transactions have no sender.
    if (this.fromAddress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error("This transaction is not signed!");
    }

    try {
      const publicKey = ec.keyFromPublic(
        this.fromAddress,
        "hex"
      );

      return publicKey.verify(
        this.calculateHash(),
        this.signature
      );
    } catch (error) {
      return false;
    }
  }
}

// ==================== BLOCK ====================

class Block {
  constructor(index, timestamp, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    const target = "0".repeat(difficulty);

    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(
      `Block ${this.index} mined: ${this.hash}`
    );
  }

  hasValidTransactions() {
    for (const transaction of this.transactions) {
      try {
        if (!transaction.isValid()) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return true;
  }
}

// ==================== BLOCKCHAIN ====================

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.miningReward = 100;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(0, "01/01/2026", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    if (
      typeof miningRewardAddress !== "string" ||
      miningRewardAddress.length === 0
    ) {
      throw new Error("Mining reward address is required.");
    }

    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);

    this.chain.push(block);

    // The mining reward is received when the next block
    // includes this pending reward transaction.
    this.pendingTransactions = [
      new Transaction(
        null,
        miningRewardAddress,
        this.miningReward
      )
    ];
  }

  addTransaction(transaction) {
    if (
      !transaction.fromAddress ||
      !transaction.toAddress
    ) {
      throw new Error(
        "Transaction must include from and to address"
      );
    }

    if (
      typeof transaction.amount !== "number" ||
      !Number.isFinite(transaction.amount) ||
      transaction.amount <= 0
    ) {
      throw new Error(
        "Transaction amount must be a positive finite number."
      );
    }

    if (!transaction.isValid()) {
      throw new Error(
        "Cannot add invalid transaction to the chain"
      );
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceofAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    if (!Array.isArray(this.chain) || this.chain.length === 0) {
      return false;
    }

    const genesisBlock = this.chain[0];

    // Verify the genesis block's expected structure and hash.
    if (
      genesisBlock.index !== 0 ||
      genesisBlock.previousHash !== "0" ||
      genesisBlock.hash !== genesisBlock.calculateHash()
    ) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify transaction signatures.
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      // Verify consecutive block indexes.
      if (currentBlock.index !== previousBlock.index + 1) {
        return false;
      }

      // Verify the block's calculated hash.
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify the link to the preceding block.
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Verify proof of work.
      if (
        !currentBlock.hash.startsWith(
          "0".repeat(this.difficulty)
        )
      ) {
        return false;
      }
    }

    return true;
  }
}

// ==================== EXPORTS ====================

module.exports = {
  Blockchain,
  Transaction
};
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
    // A null sender is reserved for mining rewards.
    // Reward legitimacy is checked at the block level.
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
  constructor(
    index,
    timestamp,
    transactions,
    previousHash = "",
    minerAddress = null
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.minerAddress = minerAddress;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    // Miner identity and all important block data are hashed.
    const blockData = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      previousHash: this.previousHash,
      minerAddress: this.minerAddress,
      nonce: this.nonce
    });

    return SHA256(blockData).toString();
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
    if (!Array.isArray(this.transactions)) {
      return false;
    }

    for (const transaction of this.transactions) {
      try {
        if (
          !transaction ||
          typeof transaction.isValid !== "function" ||
          !transaction.isValid()
        ) {
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

  // ==================== REWARD VALIDATION ====================

  validateBlockTransactions(block, previousBlock) {
    if (!block || !Array.isArray(block.transactions)) {
      throw new Error("Invalid transactions in block.");
    }

    if (
      typeof block.minerAddress !== "string" ||
      block.minerAddress.length === 0
    ) {
      throw new Error("Invalid block miner address.");
    }

    const rewards = block.transactions.filter(
      (transaction) =>
        transaction && transaction.fromAddress === null
    );

    if (block.index === 1) {
      // No reward can be claimed in the first mined block.
      if (rewards.length !== 0) {
        throw new Error(
          "Reward transaction is not allowed in the first mined block."
        );
      }
    } else {
      // Every later block must include the preceding block's reward.
      if (rewards.length !== 1) {
        throw new Error(
          "Each later block must contain exactly one reward transaction."
        );
      }

      const reward = rewards[0];

      if (reward.amount !== this.miningReward) {
        throw new Error("Mining reward amount is invalid.");
      }

      if (
        !previousBlock ||
        !previousBlock.minerAddress ||
        reward.toAddress !== previousBlock.minerAddress
      ) {
        throw new Error(
          "Mining reward recipient does not match the previous block's miner."
        );
      }
    }

    // Validate ordinary transactions.
    for (const transaction of block.transactions) {
      if (!transaction) {
        throw new Error("Invalid transaction in block.");
      }

      // Reward transactions were checked above.
      if (transaction.fromAddress === null) {
        continue;
      }

      if (
        typeof transaction.fromAddress !== "string" ||
        transaction.fromAddress.length === 0 ||
        typeof transaction.toAddress !== "string" ||
        transaction.toAddress.length === 0
      ) {
        throw new Error(
          "Transaction must include valid from and to addresses."
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
        throw new Error("Invalid transaction signature.");
      }
    }
  }

  // ==================== MINING ====================

  minePendingTransactions(miningRewardAddress) {
    if (
      typeof miningRewardAddress !== "string" ||
      miningRewardAddress.length === 0
    ) {
      throw new Error("Mining reward address is required.");
    }

    const previousBlock = this.getLatestBlock();

    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      previousBlock.hash,
      miningRewardAddress
    );

    // Validate rewards and ordinary transactions before mining.
    this.validateBlockTransactions(block, previousBlock);

    // Validate the existing history plus the candidate block.
    // Reject overspending before doing proof of work.
    if (
      !this.hasValidHistoricalBalances([
        ...this.chain,
        block
      ])
    ) {
      throw new Error(
        "Cannot mine: candidate block violates historical balances."
      );
    }

    block.mineBlock(this.difficulty);
    this.chain.push(block);

    // This miner's reward is included in the next block.
    this.pendingTransactions = [
      new Transaction(
        null,
        miningRewardAddress,
        this.miningReward
      )
    ];
  }

  // ==================== TRANSACTION VALIDATION ====================

  addTransaction(transaction) {
    if (
      !transaction ||
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

    const availableBalance =
      this.getAvailableBalanceOfAddress(
        transaction.fromAddress
      );

    if (transaction.amount > availableBalance) {
      throw new Error(
        `Insufficient balance. Available balance: ${availableBalance}`
      );
    }

    this.pendingTransactions.push(transaction);
  }

  getAvailableBalanceOfAddress(address) {
    let availableBalance =
      this.getBalanceofAddress(address);

    // Reserve funds for already-pending outgoing transactions.
    for (const transaction of this.pendingTransactions) {
      if (transaction.fromAddress === address) {
        availableBalance -= transaction.amount;
      }
    }

    return availableBalance;
  }

  // ==================== BALANCE CALCULATION ====================

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

  // ==================== HISTORICAL BALANCE VALIDATION ====================

  hasValidHistoricalBalances(chain = this.chain) {
    const balances = new Map();

    for (const block of chain) {
      if (
        !block ||
        !Array.isArray(block.transactions)
      ) {
        return false;
      }

      // Check spending against balances confirmed before this block.
      const spentThisBlock = new Map();

      for (const transaction of block.transactions) {
        if (!transaction) {
          return false;
        }

        // Rewards are credited only after spending checks.
        if (transaction.fromAddress === null) {
          continue;
        }

        const sender = transaction.fromAddress;
        const amount = transaction.amount;

        if (
          typeof sender !== "string" ||
          sender.length === 0 ||
          typeof transaction.toAddress !== "string" ||
          transaction.toAddress.length === 0 ||
          typeof amount !== "number" ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return false;
        }

        const confirmedBalance = balances.get(sender) || 0;
        const alreadySpent = spentThisBlock.get(sender) || 0;
        const remainingBalance =
          confirmedBalance - alreadySpent;

        if (amount > remainingBalance) {
          return false;
        }

        spentThisBlock.set(
          sender,
          alreadySpent + amount
        );
      }

      // Apply transfers and rewards after checking the block's
      // outgoing spending limits.
      for (const transaction of block.transactions) {
        const { fromAddress, toAddress, amount } =
          transaction;

        if (fromAddress === null) {
          balances.set(
            toAddress,
            (balances.get(toAddress) || 0) + amount
          );
        } else {
          balances.set(
            fromAddress,
            (balances.get(fromAddress) || 0) - amount
          );

          balances.set(
            toAddress,
            (balances.get(toAddress) || 0) + amount
          );
        }
      }
    }

    return true;
  }

  // ==================== CHAIN VALIDATION ====================

  isChainValid() {
    if (
      !Array.isArray(this.chain) ||
      this.chain.length === 0
    ) {
      return false;
    }

    const genesisBlock = this.chain[0];

    // The genesis block must contain no transactions or rewards.
    if (
      !genesisBlock ||
      !Array.isArray(genesisBlock.transactions) ||
      genesisBlock.transactions.length !== 0 ||
      genesisBlock.index !== 0 ||
      genesisBlock.previousHash !== "0" ||
      genesisBlock.minerAddress !== null
    ) {
      return false;
    }

    try {
      if (
        genesisBlock.hash !== genesisBlock.calculateHash()
      ) {
        return false;
      }
    } catch (error) {
      return false;
    }

    // Validate every subsequent block.
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock || !previousBlock) {
        return false;
      }

      if (
        currentBlock.index !== previousBlock.index + 1
      ) {
        return false;
      }

      if (
        typeof currentBlock.minerAddress !== "string" ||
        currentBlock.minerAddress.length === 0
      ) {
        return false;
      }

      if (
        currentBlock.previousHash !== previousBlock.hash
      ) {
        return false;
      }

      try {
        this.validateBlockTransactions(
          currentBlock,
          previousBlock
        );

        if (
          currentBlock.hash !== currentBlock.calculateHash()
        ) {
          return false;
        }
      } catch (error) {
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

    // Validate spending throughout the entire chain.
    return this.hasValidHistoricalBalances();
  }
}

// ==================== EXPORTS ====================

module.exports = {
  Blockchain,
  Transaction
};
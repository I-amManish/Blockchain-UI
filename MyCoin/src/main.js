const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Step 1: Create wallet keys for Ben and Prince
const benKey = ec.genKeyPair();
const benWalletAddress = benKey.getPublic("hex");

const princeKey = ec.genKeyPair();
const princeWalletAddress = princeKey.getPublic("hex");

const sajveeCoin = new Blockchain();

console.log("\n=== STARTING BLOCKCHAIN ===\n");

// Step 2: Ben mines the first block to earn rewards (100 coins)
console.log("👷 Ben is mining...");
sajveeCoin.minePendingTransactions(benWalletAddress);

console.log("\n=== AFTER FIRST MINING ===");
console.log("Ben's balance:", sajveeCoin.getBalanceofAddress(benWalletAddress));
console.log(
  "Prince's balance:",
  sajveeCoin.getBalanceofAddress(princeWalletAddress),
);

// Step 3: Ben sends 50 coins to Prince
console.log("\n💸 Ben sends 50 coins to Prince...");
const tx1 = new Transaction(benWalletAddress, princeWalletAddress, 50);
tx1.signTransaction(benKey); // Ben signs with his private key
sajveeCoin.addTransaction(tx1);

// Step 4: Mine the block containing the transaction
console.log("\n👷 Prince is mining...");
sajveeCoin.minePendingTransactions(princeWalletAddress);

console.log("\n=== AFTER SECOND MINING ===");
console.log("Ben's balance:", sajveeCoin.getBalanceofAddress(benWalletAddress));
console.log(
  "Prince's balance:",
  sajveeCoin.getBalanceofAddress(princeWalletAddress),
);

// Step 5: Prince sends 20 coins back to Ben
console.log("\n💸 Prince sends 20 coins back to Ben...");
const tx2 = new Transaction(princeWalletAddress, benWalletAddress, 20);
tx2.signTransaction(princeKey); // Prince signs with his private key
sajveeCoin.addTransaction(tx2);

// Step 6: Ben mines again
console.log("\n👷 Ben is mining...");
sajveeCoin.minePendingTransactions(benWalletAddress);

console.log("\n=== FINAL BALANCES ===");
console.log("Ben's balance:", sajveeCoin.getBalanceofAddress(benWalletAddress));
console.log(
  "Prince's balance:",
  sajveeCoin.getBalanceofAddress(princeWalletAddress),
);

// Uncomment this line if you want to test tampering with the chain
// sajveeCoin.chain[2].transactions[0].amount = 10;

// Check if the chain is valid
console.log("\n✅ Is blockchain valid?", sajveeCoin.isChainValid());

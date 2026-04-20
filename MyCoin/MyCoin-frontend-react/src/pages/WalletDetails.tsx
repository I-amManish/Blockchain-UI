import { useParams } from "react-router-dom";
import { TransactionsTable } from "../components/TransactionsTable";
import { blockchainService } from '../services/blockchainService'

export function WalletDetails() {
  const { walletAddress } = useParams()
  const balance = blockchainService.getBalanceOfAddress(walletAddress);


  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold my-8">Wallet Details</h1>

      <h2 className="text-xl font-bold">Address:</h2>
      <p>{walletAddress}</p>

      <h2 className="text-xl font-bold mt-4">Balance:</h2>
      <p>{balance}</p>

      <hr className="mt-4" />

      <h2 className="text-3xl font-bold my-4">Transactions</h2>
      <hr />
      <TransactionsTable transactions={blockchainService.getAllTransactionsForWallet(walletAddress)} />
    </div>
  )
}

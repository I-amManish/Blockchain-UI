import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { BlockchainViewer } from "./pages/BlockchainViewer"
import { Settings } from "./pages/Settings";
import { CreateTransaction } from "./pages/CreateTransaction";
import { PendingTransactions } from "./pages/PendingTransactions";
import { WalletDetails } from "./pages/WalletDetails";
import { blockchainService } from './services/blockchainService';
import { useState } from "react";


function App() {
  const [pendingTxs, setPendingTxs] = useState(blockchainService.getPendingTransactions().length)

  function refreshPendingCount() {
    setPendingTxs(blockchainService.getPendingTransactions().length)
  }

  return (
    <BrowserRouter>
      <nav className='bg-gray-800 p-4 text-white flex justify-between items-center'>
        <Link to="/" className="font-bold text-xl">MyCoin</Link>

        <div>
          {pendingTxs > 0 &&
            <Link to="/new/transaction/pending">
              <button className="font-bold outline-2 cursor-pointer p-3 rounded hover:bg-white hover:text-gray-500">
                Pending Transactions <span className="bg-white text-black p-1 ml-2 rounded">{pendingTxs}</span>
              </button>
            </Link>
          }
          <Link to="/settings">
            <button className="ml-4 font-bold outline-2 cursor-pointer p-3 rounded hover:bg-white hover:text-gray-500">
              Settings
            </button>
          </Link>
          <Link to="/new/transaction">
            <button className="ml-4 font-bold outline-2 cursor-pointer p-3 rounded hover:bg-white hover:text-gray-500">
              Create Transaction
            </button>
          </Link>
        </div>
      </nav>

      <main className="px-10 pt-4">
        <Routes>
          <Route path="/" element={<BlockchainViewer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/new/transaction" element={<CreateTransaction onTxCreated={refreshPendingCount} />} />
          <Route path="/new/transaction/pending" element={<PendingTransactions onMined={refreshPendingCount} />} />
          <Route path="/wallet/:walletAddress" element={<WalletDetails />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App

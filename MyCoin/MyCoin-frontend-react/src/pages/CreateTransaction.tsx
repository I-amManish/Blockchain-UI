import { useState } from "react";
import { Transaction } from "savjeecoin";
import { blockchainService } from "../services/blockchainService"
import { useNavigate } from "react-router-dom";

export function CreateTransaction({ onTxCreated }) {
  const navigate = useNavigate();

  const [toAddress, setToaddress] = useState('')
  const [amount, setAmount] = useState('')

  const walletKey = blockchainService.walletKeys[0].publicKey;

  function addTransaction() {
    const newTx = new Transaction(walletKey, toAddress, Number(amount));
    newTx.signTransaction(blockchainService.walletKeys[0].keyObj)

    blockchainService.createTransaction(newTx)
    onTxCreated();

    navigate('/new/transaction/pending')

    setToaddress('')
    setAmount('')
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Create Transaction</h1>
      <p className='mb-8'>Transfer some money to someone!</p>

      <label htmlFor="from-address">From Address</label>
      <input disabled type='text' id='from-address' className='w-full border border-gray-400 rounded p-2 mb-8' value={walletKey} />

      <label htmlFor="to-address">To Address</label>
      <input required id='to-address' className='w-full border border-gray-400 rounded p-2 mb-8' value={toAddress} onChange={(e) => { setToaddress(e.target.value) }} />

      <label htmlFor="amount">Amount</label>
      <input required min="0.01" type="number" id='amount' className='w-full border border-gray-400 rounded p-2 mb-8' value={amount} onChange={(e) => { setAmount(e.target.value) }} />

      <button className='mt-8 font-bold outline-2 bg-blue-500 text-white cursor-pointer p-3 rounded hover:bg-blue-600 active:bg-blue-700' onClick={addTransaction}>Sign & create transaction</button>
    </>
  )
}

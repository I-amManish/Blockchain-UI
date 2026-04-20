import { Link } from 'react-router-dom';
import { blockchainService } from '../services/blockchainService'

export function TransactionsTable({ transactions }: any) {

  if (transactions?.length === 0) {
    return <p className="text-gray-600">This block has no transactions</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">From</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">To</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
            <th font-bold mb-8th className="px-4 py-3 text-left text-sm font-semibold">Valid?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions?.map((tx: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{index}</td>
              <td className="px-4 py-3 max-w-25 truncate">
                {tx.fromAddress ?
                  <Link className='text-blue-500 hover:text-blue-800 hover:underline' to={`/wallet/${tx.fromAddress}`}>
                    {tx.fromAddress}
                  </Link> : 'System'}
                {blockchainService.addressIsFromCurrentUser(tx.fromAddress) && (
                  <><br /> <small className='text-gray-500'>(That's yours!)</small></>
                )
                }
              </td>
              <td className="px-4 py-3 max-w-25 truncate">
                <Link className='text-blue-500 hover:text-blue-800 hover:underline' to={`/wallet/${tx.toAddress}`}>
                  {tx.toAddress}
                </Link>
                {blockchainService.addressIsFromCurrentUser(tx.toAddress) && (
                  <><br /> <small className='text-gray-500'>(That's yours!)</small></>
                )}
              </td>
              <td className="px-4 py-3">
                {tx.amount}
                {!tx.fromAddress && <><br /><small className="text-gray-500">(Block reward)</small></>}
              </td>
              <td className="px-4 py-3">
                {tx.timestamp}<br />
                <small className="text-gray-500">{new Date(tx.timestamp).toLocaleString()}</small>
              </td>
              <td className="px-4 py-3 text-center">
                {tx.isValid() ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


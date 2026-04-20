import { useState } from 'react';
import { BlockView } from '../components/BlockView';
import { TransactionsTable } from '../components/TransactionsTable';
import { blockchainService } from '../services/blockchainService';

export function BlockchainViewer() {
  const [selectedBlock, setSelectedBlock] = useState(blockchainService.blockchainInstance.chain[0]);
  const blocks = blockchainService.blockchainInstance.chain;

  function showTransactionsForBlock(block: any) {
    setSelectedBlock(block);
  }

  function getBlockNumber(block: any) {
    return blocks.indexOf(block) + 1;
  }

  return (
    <div className='container mx-auto px-4'>

      <div className='my-8'>
        <h1 className="text-3xl font-bold mb-4">Blocks on chain</h1>
        <p className="mb-6">Each card represents a block on the chain. Click on a block to see the transactions stored inside.</p>
      </div>

      <div className='overflow-x-auto whitespace-nowrap pb-4 mb-8'>
        {
          blocks.map(block =>
            <BlockView
              key={block.hash}
              block={block}
              blockNumber={getBlockNumber(block)}
              isSelected={selectedBlock === block}
              onClick={() => showTransactionsForBlock(block)}
            />
          )}
      </div>

      {selectedBlock && (
        <div className='my-8'>
          <h1 className="text-4xl font-bold mb-4">Transactions inside block {getBlockNumber(selectedBlock)}</h1>
          <TransactionsTable transactions={selectedBlock.transactions} />
        </div>
      )}
    </div>
  );
}
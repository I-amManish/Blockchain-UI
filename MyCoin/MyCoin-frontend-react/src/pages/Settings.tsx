import { useState } from 'react';
import { blockchainService } from '../services/blockchainService';

export function Settings() {
  const [difficulty, setDifficulty] = useState(blockchainService.blockchainInstance.difficulty);
  const [miningReward, setMiningReward] = useState(blockchainService.blockchainInstance.miningReward);

  function handleSave() {
    blockchainService.blockchainInstance.difficulty = difficulty
    blockchainService.blockchainInstance.miningReward = miningReward
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-12">Settings</h1>

      <label htmlFor="difficulty">Difficulty</label>
      <input type="number" id='difficulty' value={difficulty} onChange={(e) => {
        setDifficulty(Number(e.currentTarget.value))
      }} className='w-full border-1 border-gray-400 rounded p-2 mb-8' />

      <label htmlFor="mining">Mining Reward</label>
      <input type="number" id='mining' value={miningReward} onChange={(e) => {
        setMiningReward(Number(e.currentTarget.value))
      }} className='w-full border-1 border-gray-400 rounded p-2' />

      <button className='mt-8 font-bold outline-2 cursor-pointer p-3 rounded hover:bg-white hover:text-gray-500' onClick={handleSave}>Save</button>
    </>
  )
}

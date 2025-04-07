'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

export default function Home() {
  const [newBlockLogs, setNewBlockLogs] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    // 新出的区块
    const unsubscribeNewBlock = client.watchBlocks({
      onBlock: (block) => {
        const blockLog = `New Block: Height ${block.number} Hash ${block.hash}`;
        setNewBlockLogs((prevLogs) => [blockLog, ...prevLogs].slice(0, 10));
      },
    });

    // USDT 合约地址
    const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const transferEventAbi = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

    // 监听 USDT log
    const unsubscribeTransfer = client.watchEvent({
      address: usdtAddress,
      event: transferEventAbi,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { from, to, value } = log.args;
          const formattedValue = Number(value) / 1e6;
          const USDTtransferLog = `USDT Transfer: From ${from} To ${to} : ${formattedValue} USDT`;
          setLogs((prevLogs) => [USDTtransferLog, ...prevLogs].slice(0, 10));
        });
      },
    });

    return () => {
      unsubscribeNewBlock();
      unsubscribeTransfer();
    };
  }, []);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>新区块；</h1>
      <ul className='text-sm'>
        {newBlockLogs.map((log, index) => (
          <li key={index} className='mb-1'>
            {log}
          </li>
        ))}
      </ul>
      <h1 className='text-2xl font-bold mb-4'>USDT 实时Log</h1>
      <ul className='text-sm'>
        {logs.map((log, index) => (
          <li key={index} className='mb-1'>
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
}

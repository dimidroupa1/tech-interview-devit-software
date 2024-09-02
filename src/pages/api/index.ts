import type { NextApiRequest, NextApiResponse } from 'next';

let requestCounts: { [key: string]: number } = {};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { index } = req.query;

  const currentTime = Math.floor(Date.now() / 1000);
  requestCounts[currentTime] = (requestCounts[currentTime] || 0) + 1;

  if (requestCounts[currentTime] > 50) {
    res.status(429).json({ error: 'Requests per second limit exceeded' });
    return;
  }
 
  for (const time in requestCounts) {
    if (Number(time) < currentTime) {
      delete requestCounts[time];
    }
  }

  const delay = Math.floor(Math.random() * 1000);
  setTimeout(() => {
    res.status(200).json({ index: Number(index) });
  }, delay);
};

export default handler;

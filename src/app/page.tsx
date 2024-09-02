"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [concurrency, setConcurrency] = useState<number>(10);
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(10);
  const [results, setResults] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const requestCount = useRef<number>(1000);

  const sendRequest = async (index: number) => {
    try {
      const response = await fetch(`/api?index=${index}`);
      if (response.ok) {
        const data = await response.json();
        setResults((prev) => [...prev, data.index]);
      } else if (response.status === 429) {
        console.error("Server request limit exceeded");
      }
    } catch (error) {
      console.error("Request error:", error);
    }
  };

  const handleStart = async () => {
    setIsRunning(true);
    setResults([]);

    const activeReqs: Promise<void>[] = [];
    let completedReqs = 0;

    const reqInterval = 1000 / requestsPerSecond;

    const runRequests = async () => {
      for (let i = 1; i <= requestCount.current; i++) {
        if (activeReqs.length >= concurrency) {
          await Promise.race(activeReqs);
        }

        const requestPromise = sendRequest(i).finally(() => {
          activeReqs.splice(activeReqs.indexOf(requestPromise), 1);
          completedReqs++;
          if (completedReqs === requestCount.current) {
            setIsRunning(false);
          }
        });

        activeReqs.push(requestPromise);

        await new Promise((resolve) => setTimeout(resolve, reqInterval));
      }
    };

    runRequests();
  };

  return (
    <div>
      <h1>Async req:</h1>
      <input
        type="number"
        value={concurrency}
        onChange={(e) => setConcurrency(Number(e.target.value))}
        min={1}
        max={100}
        disabled={isRunning}
        placeholder="Parallelism"
      />
      <input
        type="number"
        value={requestsPerSecond}
        onChange={(e) => setRequestsPerSecond(Number(e.target.value))}
        min={1}
        max={100}
        disabled={isRunning}
        placeholder="Requests per second"
      />
      <button onClick={handleStart} disabled={isRunning}>
        Пуск
      </button>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
}

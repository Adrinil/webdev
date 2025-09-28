import React, { useState } from 'react';
import Display from './Display';

export default function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return (
    <div style={{textAlign: "center", marginTop: "2rem"}}>
      <Display count={count} />
      <button onClick={decrement} style={{marginRight: "10px"}}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}
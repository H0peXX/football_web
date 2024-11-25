// ForumPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThreadForm from './threadform';

function ForumPage() {
  const [threads, setThreads] = useState([]); // Store threads in state

  // Add a new thread
  const addThread = (title, content) => {
    setThreads([
      ...threads,
      { id: threads.length + 1, title, content, comments: [] }
    ]);
  };

  return (
    <div>
      <h1>Forum</h1>
      <ThreadForm addThread={addThread} />
      
      <h2>Threads</h2>
      <ul>
        {threads.map(thread => (
          <li key={thread.id}>
            <Link to={`/thread/${thread.id}`}>{thread.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ForumPage;

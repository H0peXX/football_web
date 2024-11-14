// ThreadPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentForm from './commentform';

function ThreadPage({ threads }) {
  const { threadId } = useParams(); // Get thread ID from URL
  const navigate = useNavigate();

  console.log('Thread ID from URL:', threadId); // Debugging line to see the ID

  if (!Array.isArray(threads)) {
    // Ensure threads is an array
    return <p>There are no threads available.</p>;
  }

  const thread = threads.find(t => t.id === parseInt(threadId)); // Check for matching ID

  console.log('Found thread:', thread); // Debugging line to check the thread

  if (!thread) {
    return <p>Thread not found!</p>;
  }

  // Add a comment to the thread
  const addComment = (comment) => {
    thread.comments.push(comment);
    navigate(`/thread/${thread.id}`);
  };

  return (
    <div>
      <h1>{thread.title}</h1>
      <p>{thread.content}</p>

      <h3>Comments</h3>
      <ul>
        {thread.comments.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>

      <CommentForm addComment={addComment} />
    </div>
  );
}

export default ThreadPage;

// CommentForm.js
import React, { useState } from 'react';

function CommentForm({ addComment }) {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment) {
      addComment(comment);
      setComment('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add a Comment</h3>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <button type="submit">Post Comment</button>
    </form>
  );
}

export default CommentForm;

// ThreadForm.js
import React, { useState } from 'react';

function ThreadForm({ addThread }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && content) {
      addThread(title, content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create a New Thread</h3>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create Thread</button>
    </form>
  );
}

export default ThreadForm;

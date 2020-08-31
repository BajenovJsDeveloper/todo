import React from 'react';

interface TEProps {
  title?: string;
  message: string;
}

export default function TaskEmpty<FC>(props: TEProps) {
  const { title, message } = props;
  return (
    <>
      {title && <div className="task-title">{title}</div>}
      <div className="empty-page">
        <h2>{message}</h2>
      </div>
    </>
  );
}

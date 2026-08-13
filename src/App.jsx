import React from 'react';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const handleCitationClick = (citation) => {
    console.log("Citation clicked:", citation);
  };

  return (
    <ChatInterface onCitationClick={handleCitationClick} />
  );
}

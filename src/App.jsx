import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import SourcePanel from './components/SourcePanel';

import lec1 from './data/lectures/lecture-01-linear-models.json';
import lec2 from './data/lectures/lecture-02-gradient-descent.json';
import lec3 from './data/lectures/lecture-03-regularization.json';

const lectures = [lec1, lec2, lec3];

export default function App() {
  const [selectedCitation, setSelectedCitation] = useState(null);

  const handleCitationClick = (citation) => {
    setSelectedCitation(citation);
  };

  const handleCloseMobile = () => {
    setSelectedCitation(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-x-hidden font-sans">
      {/* Center Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ChatInterface 
          onCitationClick={handleCitationClick} 
          selectedCitation={selectedCitation}
          lectures={lectures}
        />
      </div>

      {/* Right Desktop Panel & Mobile Bottom Sheet */}
      <SourcePanel 
        selectedCitation={selectedCitation}
        lectures={lectures}
        onCloseMobile={handleCloseMobile}
      />
    </div>
  );
}

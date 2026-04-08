// src/components/InstagramFeed.jsx
import React from 'react';

const InstagramFeed = () => {
  return (
    <div style={{ 
      width: '100%',
      minHeight: '600px',
      margin: '0 auto'
    }}>
      <iframe 
        src="https://emb.fouita.com/widget/0x41fd18/ft2hfzig3" 
        title="Instagram Feed Eolekare" 
        width="100%" 
        height="650" 
        frameBorder="0"
        scrolling="no"
        style={{ 
          borderRadius: 12,
          overflow: 'hidden'
        }}
        loading="lazy"
      />
    </div>
  );
};

export default InstagramFeed;
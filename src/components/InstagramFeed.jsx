// src/components/InstagramFeed.jsx
import React from 'react';

const InstagramFeed = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '2rem',
      width: '100%'
    }}>
      <iframe 
        src="https://emb.fouita.com/widget/0x41fd18/ft2hfzig3" 
        title="Instagram Feed Eolekare" 
        width="100%" 
        height="600" 
        frameBorder="0"
        style={{ maxWidth: 620, borderRadius: 8 }}
        loading="lazy"
      />
    </div>
  );
};

export default InstagramFeed;
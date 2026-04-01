import React from 'react';

const PATHS = {
  mango:  'M50,8 C50,8 78,22 85,52 C92,82 74,105 50,108 C26,105 8,82 15,52 C22,22 50,8 50,8Z',
  avocat: 'M50,4 C50,4 72,18 78,48 C84,78 68,102 50,104 C32,102 16,78 22,48 C28,18 50,4 50,4Z',
  coco:   'M50,6 C68,6 90,22 92,44 C94,68 78,96 52,98 C28,100 8,80 6,56 C4,30 20,6 50,6Z',
};
const DIMS = {
  mango:  { vw: 100, vh: 120 },
  avocat: { vw: 100, vh: 115 },
  coco:   { vw: 100, vh: 108 },
};
const EXTRAS = {
  mango: (
    <>
      <line x1="50" y1="8" x2="50" y2="-4" stroke="#5a3010" strokeWidth="3" strokeLinecap="round"/>
      <path d="M50,-4 C46,-14 36,-20 35,-13 C34,-6 44,-5 50,-4Z" fill="#4a8a25"/>
      <path d="M50,-4 C54,-14 64,-20 65,-13 C66,-6 56,-5 50,-4Z" fill="#3d7a1f"/>
    </>
  ),
  avocat: <line x1="50" y1="4" x2="50" y2="-4" stroke="#5a3010" strokeWidth="2" strokeLinecap="round"/>,
  coco:   null,
};

export default function FruitSVG({ type, imgSrc, uid }) {
  const { vw, vh } = DIMS[type];
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%">
      <defs>
        <clipPath id={uid}><path d={PATHS[type]}/></clipPath>
      </defs>
      <image href={imgSrc || ''} x="0" y="0" width={vw} height={vh}
        clipPath={`url(#${uid})`} preserveAspectRatio="xMidYMid slice"/>
      {EXTRAS[type]}
    </svg>
  );
}

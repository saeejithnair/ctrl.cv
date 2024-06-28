import React from 'react';

const Logo = ({ width = 100, height = 100 }) => (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="15" width="60" height="75" fill="#4A90E2" rx="5" />
        <rect x="30" y="5" width="40" height="20" fill="#4A90E2" rx="5" />
        <text x="50" y="60" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle">
            ctrl.cv
        </text>
        <rect x="30" y="70" width="40" height="5" fill="white" rx="2" />
        <rect x="30" y="80" width="30" height="5" fill="white" rx="2" />
    </svg>
);

export default Logo;
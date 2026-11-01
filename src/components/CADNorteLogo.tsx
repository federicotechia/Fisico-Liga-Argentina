import React from 'react';

interface CADNorteLogoProps {
  className?: string;
  size?: number;
}

export const CADNorteLogo: React.FC<CADNorteLogoProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <img
    src="/cad-norte-logo.png"
    alt="Escudo del Club Atlético Deportivo Norte"
    width={size}
    height={size}
    className={`object-contain rounded-lg bg-white p-0.5 ${className}`}
  />
);

import React from 'react';
import { ArchToothPosition } from '../domain/dentalArchCoordinates';
import { DentalFinding, DentalProcedure, ToothConditionCode } from '../types/clinic';
import { TOOTH_CONDITIONS_META } from '../domain/dental';

interface AnatomicalArchToothProps {
  toothPos: ArchToothPosition;
  isSelected: boolean;
  findings: DentalFinding[];
  procedures: DentalProcedure[];
  onClick: (code: number) => void;
}

export const AnatomicalArchTooth: React.FC<AnatomicalArchToothProps> = ({
  toothPos,
  isSelected,
  findings,
  procedures,
  onClick
}) => {
  const { code, x, y, rotation, width, height, type, jaw } = toothPos;

  // Determine active conditions on this tooth
  const hasCaries = findings.some(f => f.condition === 'caries');
  const hasComposite = findings.some(f => f.condition === 'restoration_composite');
  const hasAmalgam = findings.some(f => f.condition === 'restoration_amalgam');
  const hasCrown = findings.some(f => f.condition === 'crown');
  const hasEndo = findings.some(f => f.condition === 'endodontic');
  const hasMissing = findings.some(f => f.condition === 'missing');
  const hasImplant = findings.some(f => f.condition === 'implant');
  const hasPlannedProc = procedures.some(p => p.tooth_code === code && p.status === 'planned');

  // Primary color logic
  let baseFill = '#FFFFFF';
  let strokeColor = '#1E293B';
  let strokeWidth = 1.3;

  if (hasCrown) {
    baseFill = '#FEF3C7'; // Amber gold
    strokeColor = '#D97706';
    strokeWidth = 2;
  } else if (hasEndo) {
    baseFill = '#F3E8FF'; // Soft purple
    strokeColor = '#7C3AED';
  } else if (hasComposite) {
    baseFill = '#EFF6FF'; // Soft blue
    strokeColor = '#2563EB';
  } else if (hasAmalgam) {
    baseFill = '#E2E8F0'; // Slate metal
    strokeColor = '#475569';
  } else if (hasCaries) {
    baseFill = '#FEF2F2'; // Soft red
    strokeColor = '#DC2626';
  } else if (hasImplant) {
    baseFill = '#CCFBF1'; // Teal
    strokeColor = '#0F766E';
  }

  // Calculate label coordinate outside of the curve
  // For upper jaw: label sits above/outside the tooth
  // For lower jaw: label sits below/outside the tooth
  const labelDist = 26;
  const rad = (rotation * Math.PI) / 180;
  // Direction vector pointing outward
  const normalAngle = jaw === 'upper' ? rotation - 90 : rotation + 90;
  const normalRad = (normalAngle * Math.PI) / 180;
  const labelX = x + Math.cos(normalRad) * labelDist;
  const labelY = y + Math.sin(normalRad) * labelDist;

  // Anatomical rendering based on tooth type
  const renderToothAnatomy = () => {
    switch (type) {
      case 'molar':
        return (
          <g>
            {/* Outer molar crown envelope with 4 rounded lobes */}
            <path
              d="M -15,-13 
                 C -8,-16 8,-16 15,-13 
                 C 18,-6 18,6 15,13 
                 C 8,16 -8,16 -15,13 
                 C -18,6 -18,-6 -15,-13 Z"
              fill={baseFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Occlusal fissure system (central pit + grooves) */}
            <path
              d="M -10,0 L 10,0 M 0,-10 L 0,10 M -5,-7 L 0,0 L 5,7 M -5,7 L 0,0 L 5,-7"
              stroke={hasCaries ? '#EF4444' : '#64748B'}
              strokeWidth={hasCaries ? 2 : 1}
              strokeLinecap="round"
              fill="none"
              opacity={0.85}
            />
            {/* Central pit */}
            <circle
              cx="0"
              cy="0"
              r={hasCaries ? 3 : 1.8}
              fill={hasCaries ? '#DC2626' : '#475569'}
            />
            {/* If caries on surface, highlight specific quadrant */}
            {hasCaries && (
              <circle cx="0" cy="0" r="4.5" fill="#EF4444" opacity={0.6} />
            )}
          </g>
        );

      case 'premolar':
        return (
          <g>
            {/* Oval bicuspid crown contour */}
            <ellipse
              cx="0"
              cy="0"
              rx="12.5"
              ry="11"
              fill={baseFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Central developmental groove dividing buccal and lingual cusps */}
            <path
              d="M -8,0 C -3,-1 3,-1 8,0 M -4,-6 L -1,0 L -4,6 M 4,-6 L 1,0 L 4,6"
              stroke={hasCaries ? '#EF4444' : '#64748B'}
              strokeWidth={hasCaries ? 1.8 : 1}
              strokeLinecap="round"
              fill="none"
              opacity={0.8}
            />
            {hasCaries && (
              <circle cx="0" cy="0" r="3.5" fill="#EF4444" opacity={0.7} />
            )}
          </g>
        );

      case 'canine':
        return (
          <g>
            {/* Diamond/pointed cusp crown contour */}
            <path
              d="M 0,-13 
                 C 7,-10 12,-3 11,5 
                 C 8,11 0,14 0,14 
                 C 0,14 -8,11 -11,5 
                 C -12,-3 -7,-10 0,-13 Z"
              fill={baseFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Labial ridge and cusp tip */}
            <path
              d="M 0,-11 L 0,8 M -6,3 C -2,5 2,5 6,3"
              stroke="#64748B"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
            {hasCaries && (
              <circle cx="0" cy="-2" r="3" fill="#EF4444" opacity={0.7} />
            )}
          </g>
        );

      case 'incisor':
      default:
        return (
          <g>
            {/* Chisel/shovel shaped incisor contour */}
            <path
              d="M -11,-10 
                 C -4,-12 4,-12 11,-10 
                 C 13,-2 10,7 8,12 
                 C 4,13 -4,13 -8,12 
                 C -10,7 -13,-2 -11,-10 Z"
              fill={baseFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Incisal edge highlight */}
            <path
              d="M -8,-9 C -3,-10.5 3,-10.5 8,-9"
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            {hasCaries && (
              <circle cx="0" cy="0" r="3" fill="#EF4444" opacity={0.7} />
            )}
          </g>
        );
    }
  };

  return (
    <g
      onClick={() => onClick(code)}
      className="cursor-pointer group select-none transition-transform"
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* Outer Glow / Ring when selected */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r="23"
          fill="none"
          stroke="#0F766E"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          className="animate-pulse"
        />
      )}

      {/* Main Tooth Group transformed with (x, y) and rotation angle */}
      <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        {/* Shadow backdrop for depth */}
        <circle cx="0" cy="0" r="16" fill="transparent" />

        {/* Anatomical Enamel & Cusp SVG */}
        {renderToothAnatomy()}

        {/* Missing / Extracted Overlay (Cross line) */}
        {hasMissing && (
          <g>
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="-12" x2="-12" y2="12" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Implant Badge */}
        {hasImplant && (
          <g transform="translate(0, 0)">
            <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1" />
            <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              IMP
            </text>
          </g>
        )}

        {/* Crown Badge */}
        {hasCrown && !hasImplant && (
          <g transform="translate(0, 0)">
            <circle cx="0" cy="0" r="6" fill="#D97706" stroke="#FFFFFF" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              C
            </text>
          </g>
        )}

        {/* Endodontic (Root Canal) Badge */}
        {hasEndo && !hasCrown && !hasImplant && (
          <g transform="translate(0, 0)">
            <circle cx="0" cy="0" r="6" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              R
            </text>
          </g>
        )}

        {/* Planned Procedure Indicator dot */}
        {hasPlannedProc && (
          <circle cx="10" cy="-10" r="3" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1" />
        )}
      </g>

      {/* FDI Code Label placed outside the arch curve */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        {isSelected ? (
          <g>
            <circle cx="0" cy="0" r="10" fill="#0F766E" />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
            >
              {code}
            </text>
          </g>
        ) : (
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill="#1E293B"
            fontSize="10.5"
            fontWeight="bold"
            fontFamily="JetBrains Mono, monospace"
            className="group-hover:fill-[#0F766E] transition-colors"
          >
            {code}
          </text>
        )}
      </g>
    </g>
  );
};

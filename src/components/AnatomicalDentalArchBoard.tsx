import React from 'react';
import { 
  PERMANENT_ARCH_TEETH, 
  PRIMARY_ARCH_TEETH, 
  ArchToothPosition 
} from '../domain/dentalArchCoordinates';
import { AnatomicalArchTooth } from './AnatomicalArchTooth';
import { DentalFinding, DentalProcedure, DentitionType } from '../types/clinic';

interface AnatomicalDentalArchBoardProps {
  dentitionMode: DentitionType | 'mixed';
  selectedToothCode: number | null;
  findings: DentalFinding[];
  procedures: DentalProcedure[];
  onSelectTooth: (code: number) => void;
}

export const AnatomicalDentalArchBoard: React.FC<AnatomicalDentalArchBoardProps> = ({
  dentitionMode,
  selectedToothCode,
  findings,
  procedures,
  onSelectTooth
}) => {
  const isPrimary = dentitionMode === 'primary';
  const teethList: ArchToothPosition[] = isPrimary ? PRIMARY_ARCH_TEETH : PERMANENT_ARCH_TEETH;

  // Linear strip numbers for the quadrant cross divider (matching the user's reference image!)
  const q1Numbers = isPrimary ? [55, 54, 53, 52, 51] : [18, 17, 16, 15, 14, 13, 12, 11];
  const q2Numbers = isPrimary ? [61, 62, 63, 64, 65] : [21, 22, 23, 24, 25, 26, 27, 28];
  const q4Numbers = isPrimary ? [85, 84, 83, 82, 81] : [48, 47, 46, 45, 44, 43, 42, 41];
  const q3Numbers = isPrimary ? [71, 72, 73, 74, 75] : [31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="relative w-full max-w-[620px] mx-auto bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-4 overflow-hidden select-none">
      <svg
        viewBox="0 0 540 680"
        className="w-full h-auto drop-shadow-xs"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Subtle Arch Guide Curves in background */}
        <path
          d={
            isPrimary
              ? 'M 190,265 C 180,165 220,115 270,115 C 320,115 360,165 350,265'
              : 'M 120,290 C 110,130 190,55 270,55 C 350,55 430,130 420,290'
          }
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="38"
          strokeLinecap="round"
        />
        <path
          d={
            isPrimary
              ? 'M 190,415 C 180,515 220,565 270,565 C 320,565 360,515 350,415'
              : 'M 120,390 C 110,550 190,625 270,625 C 350,625 430,550 420,390'
          }
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="38"
          strokeLinecap="round"
        />

        {/* Arch Labels matching reference image (mâchoire supérieure & mandibule) */}
        {isPrimary ? (
          <g>
            <text
              x="270"
              y="180"
              textAnchor="middle"
              fill="#334155"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              الفك العلوي
            </text>
            <text
              x="270"
              y="196"
              textAnchor="middle"
              fill="#64748B"
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              (mâchoire sup.)
            </text>
            <text
              x="270"
              y="488"
              textAnchor="middle"
              fill="#334155"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              الفك السفلي
            </text>
            <text
              x="270"
              y="504"
              textAnchor="middle"
              fill="#64748B"
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              (mandibule)
            </text>
          </g>
        ) : (
          <g>
            <text
              x="270"
              y="200"
              textAnchor="middle"
              fill="#1E293B"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              الفك العلوي (mâchoire supérieure)
            </text>
            <text
              x="270"
              y="500"
              textAnchor="middle"
              fill="#1E293B"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              الفك السفلي (mandibule)
            </text>
          </g>
        )}

        {/* ============================================================== */}
        {/* CENTER QUADRANT CROSS DIVIDER (Exact match with reference image) */}
        {/* ============================================================== */}
        <g id="center-quadrant-cross">
          {/* Main Horizontal Dividing Line */}
          <line x1="30" y1="340" x2="510" y2="340" stroke="#0F172A" strokeWidth="2.2" />

          {/* Main Vertical Dividing Line between right and left */}
          <line x1="270" y1="290" x2="270" y2="390" stroke="#0F172A" strokeWidth="2.2" />

          {/* Subtitles for each quadrant (supérieur à droite / gauche / inférieur...) */}
          {/* Top Right (Q1) */}
          <text
            x="145"
            y="308"
            textAnchor="middle"
            fill="#1D4ED8"
            fontSize="12.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            علوي أيمن (supérieur à droite)
          </text>

          {/* Top Left (Q2) */}
          <text
            x="395"
            y="308"
            textAnchor="middle"
            fill="#1D4ED8"
            fontSize="12.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            علوي أيسر (supérieur à gauche)
          </text>

          {/* Bottom Right (Q4) */}
          <text
            x="145"
            y="384"
            textAnchor="middle"
            fill="#1D4ED8"
            fontSize="12.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            سفلي أيمن (inférieur à droite)
          </text>

          {/* Bottom Left (Q3) */}
          <text
            x="395"
            y="384"
            textAnchor="middle"
            fill="#1D4ED8"
            fontSize="12.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            سفلي أيسر (inférieur à gauche)
          </text>

          {/* Linear FDI Strip Numbers (Clickable as well!) */}
          {/* Upper Right 18 -> 11 */}
          <g>
            {q1Numbers.map((code, idx) => {
              const step = 220 / (q1Numbers.length + 1);
              const xPos = 45 + (idx + 0.5) * step;
              const isSelected = selectedToothCode === code;
              return (
                <text
                  key={`top-r-${code}`}
                  x={xPos}
                  y="330"
                  textAnchor="middle"
                  fill={isSelected ? '#0F766E' : '#0F172A'}
                  fontSize={isSelected ? '12.5' : '11'}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="JetBrains Mono, monospace"
                  className="cursor-pointer hover:fill-[#0F766E] transition-colors"
                  onClick={() => onSelectTooth(code)}
                >
                  {code}
                </text>
              );
            })}
          </g>

          {/* Upper Left 21 -> 28 */}
          <g>
            {q2Numbers.map((code, idx) => {
              const step = 220 / (q2Numbers.length + 1);
              const xPos = 280 + (idx + 0.5) * step;
              const isSelected = selectedToothCode === code;
              return (
                <text
                  key={`top-l-${code}`}
                  x={xPos}
                  y="330"
                  textAnchor="middle"
                  fill={isSelected ? '#0F766E' : '#0F172A'}
                  fontSize={isSelected ? '12.5' : '11'}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="JetBrains Mono, monospace"
                  className="cursor-pointer hover:fill-[#0F766E] transition-colors"
                  onClick={() => onSelectTooth(code)}
                >
                  {code}
                </text>
              );
            })}
          </g>

          {/* Lower Right 48 -> 41 */}
          <g>
            {q4Numbers.map((code, idx) => {
              const step = 220 / (q4Numbers.length + 1);
              const xPos = 45 + (idx + 0.5) * step;
              const isSelected = selectedToothCode === code;
              return (
                <text
                  key={`bot-r-${code}`}
                  x={xPos}
                  y="360"
                  textAnchor="middle"
                  fill={isSelected ? '#0F766E' : '#0F172A'}
                  fontSize={isSelected ? '12.5' : '11'}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="JetBrains Mono, monospace"
                  className="cursor-pointer hover:fill-[#0F766E] transition-colors"
                  onClick={() => onSelectTooth(code)}
                >
                  {code}
                </text>
              );
            })}
          </g>

          {/* Lower Left 31 -> 38 */}
          <g>
            {q3Numbers.map((code, idx) => {
              const step = 220 / (q3Numbers.length + 1);
              const xPos = 280 + (idx + 0.5) * step;
              const isSelected = selectedToothCode === code;
              return (
                <text
                  key={`bot-l-${code}`}
                  x={xPos}
                  y="360"
                  textAnchor="middle"
                  fill={isSelected ? '#0F766E' : '#0F172A'}
                  fontSize={isSelected ? '12.5' : '11'}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="JetBrains Mono, monospace"
                  className="cursor-pointer hover:fill-[#0F766E] transition-colors"
                  onClick={() => onSelectTooth(code)}
                >
                  {code}
                </text>
              );
            })}
          </g>
        </g>

        {/* ============================================================== */}
        {/* ANATOMICAL TEETH ARCHES (Upper Maxilla & Lower Mandible)         */}
        {/* ============================================================== */}
        <g id="anatomical-teeth-layer">
          {teethList.map(toothPos => (
            <AnatomicalArchTooth
              key={toothPos.code}
              toothPos={toothPos}
              isSelected={selectedToothCode === toothPos.code}
              findings={findings.filter(f => f.tooth_code === toothPos.code)}
              procedures={procedures.filter(p => p.tooth_code === toothPos.code)}
              onClick={onSelectTooth}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

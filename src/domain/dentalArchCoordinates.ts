export interface ArchToothPosition {
  code: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
  jaw: 'upper' | 'lower';
  quadrant: number;
}

export const PERMANENT_ARCH_TEETH: ArchToothPosition[] = [
  // Upper Right (Q1) - from apex (11) back to molar (18)
  { code: 11, x: 251, y: 70, rotation: -3, width: 28, height: 26, type: 'incisor', jaw: 'upper', quadrant: 1 },
  { code: 12, x: 218, y: 76, rotation: -12, width: 25, height: 25, type: 'incisor', jaw: 'upper', quadrant: 1 },
  { code: 13, x: 184, y: 92, rotation: -26, width: 26, height: 26, type: 'canine', jaw: 'upper', quadrant: 1 },
  { code: 14, x: 156, y: 118, rotation: -42, width: 27, height: 27, type: 'premolar', jaw: 'upper', quadrant: 1 },
  { code: 15, x: 138, y: 150, rotation: -58, width: 28, height: 28, type: 'premolar', jaw: 'upper', quadrant: 1 },
  { code: 16, x: 127, y: 190, rotation: -74, width: 34, height: 32, type: 'molar', jaw: 'upper', quadrant: 1 },
  { code: 17, x: 122, y: 236, rotation: -84, width: 33, height: 30, type: 'molar', jaw: 'upper', quadrant: 1 },
  { code: 18, x: 119, y: 282, rotation: -90, width: 31, height: 28, type: 'molar', jaw: 'upper', quadrant: 1 },

  // Upper Left (Q2) - from apex (21) back to molar (28)
  { code: 21, x: 289, y: 70, rotation: 3, width: 28, height: 26, type: 'incisor', jaw: 'upper', quadrant: 2 },
  { code: 22, x: 322, y: 76, rotation: 12, width: 25, height: 25, type: 'incisor', jaw: 'upper', quadrant: 2 },
  { code: 23, x: 356, y: 92, rotation: 26, width: 26, height: 26, type: 'canine', jaw: 'upper', quadrant: 2 },
  { code: 24, x: 384, y: 118, rotation: 42, width: 27, height: 27, type: 'premolar', jaw: 'upper', quadrant: 2 },
  { code: 25, x: 402, y: 150, rotation: 58, width: 28, height: 28, type: 'premolar', jaw: 'upper', quadrant: 2 },
  { code: 26, x: 413, y: 190, rotation: 74, width: 34, height: 32, type: 'molar', jaw: 'upper', quadrant: 2 },
  { code: 27, x: 418, y: 236, rotation: 84, width: 33, height: 30, type: 'molar', jaw: 'upper', quadrant: 2 },
  { code: 28, x: 421, y: 282, rotation: 90, width: 31, height: 28, type: 'molar', jaw: 'upper', quadrant: 2 },

  // Lower Left (Q3) - from apex (31) back to molar (38)
  { code: 31, x: 288, y: 614, rotation: -3, width: 24, height: 24, type: 'incisor', jaw: 'lower', quadrant: 3 },
  { code: 32, x: 318, y: 606, rotation: -14, width: 24, height: 24, type: 'incisor', jaw: 'lower', quadrant: 3 },
  { code: 33, x: 352, y: 588, rotation: -28, width: 26, height: 26, type: 'canine', jaw: 'lower', quadrant: 3 },
  { code: 34, x: 380, y: 560, rotation: -44, width: 27, height: 27, type: 'premolar', jaw: 'lower', quadrant: 3 },
  { code: 35, x: 398, y: 524, rotation: -60, width: 28, height: 28, type: 'premolar', jaw: 'lower', quadrant: 3 },
  { code: 36, x: 411, y: 482, rotation: -76, width: 34, height: 32, type: 'molar', jaw: 'lower', quadrant: 3 },
  { code: 37, x: 418, y: 436, rotation: -85, width: 33, height: 30, type: 'molar', jaw: 'lower', quadrant: 3 },
  { code: 38, x: 421, y: 390, rotation: -90, width: 31, height: 28, type: 'molar', jaw: 'lower', quadrant: 3 },

  // Lower Right (Q4) - from apex (41) back to molar (48)
  { code: 41, x: 252, y: 614, rotation: 3, width: 24, height: 24, type: 'incisor', jaw: 'lower', quadrant: 4 },
  { code: 42, x: 222, y: 606, rotation: 14, width: 24, height: 24, type: 'incisor', jaw: 'lower', quadrant: 4 },
  { code: 43, x: 188, y: 588, rotation: 28, width: 26, height: 26, type: 'canine', jaw: 'lower', quadrant: 4 },
  { code: 44, x: 160, y: 560, rotation: 44, width: 27, height: 27, type: 'premolar', jaw: 'lower', quadrant: 4 },
  { code: 45, x: 142, y: 524, rotation: 60, width: 28, height: 28, type: 'premolar', jaw: 'lower', quadrant: 4 },
  { code: 46, x: 129, y: 482, rotation: 76, width: 34, height: 32, type: 'molar', jaw: 'lower', quadrant: 4 },
  { code: 47, x: 122, y: 436, rotation: 85, width: 33, height: 30, type: 'molar', jaw: 'lower', quadrant: 4 },
  { code: 48, x: 119, y: 390, rotation: 90, width: 31, height: 28, type: 'molar', jaw: 'lower', quadrant: 4 }
];

export const PRIMARY_ARCH_TEETH: ArchToothPosition[] = [
  // Upper Right (Q5)
  { code: 51, x: 253, y: 92, rotation: -4, width: 24, height: 22, type: 'incisor', jaw: 'upper', quadrant: 5 },
  { code: 52, x: 225, y: 98, rotation: -16, width: 22, height: 22, type: 'incisor', jaw: 'upper', quadrant: 5 },
  { code: 53, x: 196, y: 115, rotation: -32, width: 24, height: 24, type: 'canine', jaw: 'upper', quadrant: 5 },
  { code: 54, x: 172, y: 144, rotation: -50, width: 28, height: 26, type: 'molar', jaw: 'upper', quadrant: 5 },
  { code: 55, x: 156, y: 180, rotation: -70, width: 30, height: 28, type: 'molar', jaw: 'upper', quadrant: 5 },

  // Upper Left (Q6)
  { code: 61, x: 287, y: 92, rotation: 4, width: 24, height: 22, type: 'incisor', jaw: 'upper', quadrant: 6 },
  { code: 62, x: 315, y: 98, rotation: 16, width: 22, height: 22, type: 'incisor', jaw: 'upper', quadrant: 6 },
  { code: 63, x: 344, y: 115, rotation: 32, width: 24, height: 24, type: 'canine', jaw: 'upper', quadrant: 6 },
  { code: 64, x: 368, y: 144, rotation: 50, width: 28, height: 26, type: 'molar', jaw: 'upper', quadrant: 6 },
  { code: 65, x: 384, y: 180, rotation: 70, width: 30, height: 28, type: 'molar', jaw: 'upper', quadrant: 6 },

  // Lower Left (Q7)
  { code: 71, x: 286, y: 590, rotation: -4, width: 22, height: 20, type: 'incisor', jaw: 'lower', quadrant: 7 },
  { code: 72, x: 312, y: 582, rotation: -16, width: 22, height: 20, type: 'incisor', jaw: 'lower', quadrant: 7 },
  { code: 73, x: 340, y: 566, rotation: -32, width: 24, height: 24, type: 'canine', jaw: 'lower', quadrant: 7 },
  { code: 74, x: 364, y: 538, rotation: -50, width: 28, height: 26, type: 'molar', jaw: 'lower', quadrant: 7 },
  { code: 75, x: 380, y: 502, rotation: -70, width: 30, height: 28, type: 'molar', jaw: 'lower', quadrant: 7 },

  // Lower Right (Q8)
  { code: 81, x: 254, y: 590, rotation: 4, width: 22, height: 20, type: 'incisor', jaw: 'lower', quadrant: 8 },
  { code: 82, x: 228, y: 582, rotation: 16, width: 22, height: 20, type: 'incisor', jaw: 'lower', quadrant: 8 },
  { code: 83, x: 200, y: 566, rotation: 32, width: 24, height: 24, type: 'canine', jaw: 'lower', quadrant: 8 },
  { code: 84, x: 176, y: 538, rotation: 50, width: 28, height: 26, type: 'molar', jaw: 'lower', quadrant: 8 },
  { code: 85, x: 160, y: 502, rotation: 70, width: 30, height: 28, type: 'molar', jaw: 'lower', quadrant: 8 }
];

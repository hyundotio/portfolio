export interface GnssChipProfile {
  id: string;
  label: string;
  description: string;
  biasKm: [number, number, number];
  noiseSigmaKm: [number, number, number];
}

export const DEFAULT_GNSS_CHIP_PROFILES: GnssChipProfile[] = [
  {
    id: "survey-dual-band",
    label: "Survey Dual-Band",
    description: "Tight bias solution with low measurement scatter.",
    biasKm: [0.15, -0.1, 0.04],
    noiseSigmaKm: [0.06, 0.06, 0.08],
  },
  {
    id: "spaceborne-nav",
    label: "Spaceborne Nav",
    description: "Balanced flight receiver with mild anisotropic scatter.",
    biasKm: [0.55, -0.32, 0.18],
    noiseSigmaKm: [0.18, 0.18, 0.24],
  },
  {
    id: "cots-patch",
    label: "COTS Patch",
    description: "Higher bias and noisier fixes representative of a budget stack.",
    biasKm: [2.0, -2.0, 0.5],
    noiseSigmaKm: [0.45, 0.45, 0.6],
  },
];

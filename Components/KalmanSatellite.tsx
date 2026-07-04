"use client";

import {
  ChangeEvent,
  ReactNode,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DEFAULT_GNSS_CHIP_PROFILES, GnssChipProfile } from "@/content/gnssChipProfiles";
import { useViewStore } from "@/stores/viewStore";
import { ASTRO_CONSTANTS } from "@/utils/astro";
import { OrbitDeterminationFilter } from "@/utils/OrbitDeterminationFilter";
import {
  getResolvedCssToken,
  odCanvasColorFallbacks,
  odColorTokens,
} from "./themeTokens";
import {
  CartesianState,
  distance3,
  magnitude3,
  propagateCartesianState,
  sampleGaussian,
  Vector3Km,
} from "@/utils/orbitDynamics";

const MAX_HISTORY = 120;
const SIMULATED_VELOCITY_SIGMA_KM_PER_SEC: Vector3Km = [0.002, 0.002, 0.002];
const SIMULATED_OBSERVATION_DURATION_SEC = 90 * 60;
const SIMULATED_GNSS_CADENCE_SEC = 10;
const PROPAGATION_HORIZON_SEC = 3 * 24 * 60 * 60;
const PROPAGATION_TRACK_STEP_SEC = 60;

function getCanvasTypeFont(type: "label" | "text") {
  if (typeof window === "undefined") {
    return type === "label"
      ? "600 0.75rem Inter, sans-serif"
      : "400 1rem Inter, sans-serif";
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const fontFamily = bodyStyles.fontFamily || "Inter, sans-serif";
  const fontSize =
    rootStyles
      .getPropertyValue(type === "label" ? "--type-label-size" : "--type-body-size")
      .trim() || (type === "label" ? "0.75rem" : "1rem");
  const fontWeight = type === "label" ? "600" : "400";

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

type SourceMode = "sim" | "upload";
type CovarianceMatrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

interface GnssLogSample {
  timeSec: number;
  sampleTimeLabel?: string;
  positionKm: Vector3Km;
  velocityKmPerSec?: Vector3Km;
  referencePositionKm?: Vector3Km;
  referenceVelocityKmPerSec?: Vector3Km;
  measurementSigmaKm?: Vector3Km;
  measurementCovarianceKm2?: CovarianceMatrix3;
}

interface UploadedGnssDataset {
  name: string;
  samples: GnssLogSample[];
  cadenceSec: number;
  hasReference: boolean;
  totalDurationSec: number;
}

interface SimulatedPacket {
  timeSec: number;
  sampleTimeLabel: string;
  positionKm: Vector3Km;
  velocityKmPerSec: Vector3Km;
  referencePositionKm: Vector3Km;
  referenceVelocityKmPerSec: Vector3Km;
  measurementCovarianceKm2: CovarianceMatrix3;
  sampleCount: number;
  cadenceSec: number;
}

interface LiveHudData {
  sourceMode: SourceMode;
  sourceLabel: string;
  datasetLabel: string;
  chipLabel: string;
  sampleTimeLabel: string;
  measurement: Vector3Km | null;
  measurementVelocity: Vector3Km | null;
  estimate: Vector3Km;
  reference: Vector3Km | null;
  referenceVelocity: Vector3Km | null;
  covarianceDiagKm2: Vector3Km | null;
  measurementSeparationKm: number;
  estimateSeparationKm: number;
  innovationNormKm: number;
  threeSigmaKm: number;
  normalizedInnovationSquared: number;
  sampleCount: number;
  streamTimeSec: number;
  cadenceSec: number;
  progress: number;
  inBlackout: boolean;
}

interface HistoryState {
  measurementSeparation: number[];
  estimateSeparation: number[];
  innovation: number[];
  sigmaEnvelope: number[];
}

interface ManeuverEvent {
  timeSec: number;
  deltaVxKmPerSec: number;
  deltaVyKmPerSec: number;
}

interface OrbitTrackState {
  measurement: Vector3Km[];
  estimate: Vector3Km[];
  reference: Vector3Km[];
}

interface OrbitControlsHandle {
  target: THREE.Vector3;
  update: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPositionVector(state: CartesianState): Vector3Km {
  return [state.x, state.y, state.z];
}

function toVelocityVector(state: CartesianState): Vector3Km {
  return [state.vx, state.vy, state.vz];
}

function toCartesianState(
  positionKm: Vector3Km,
  velocityKmPerSec: Vector3Km,
): CartesianState {
  return {
    x: positionKm[0],
    y: positionKm[1],
    z: positionKm[2],
    vx: velocityKmPerSec[0],
    vy: velocityKmPerSec[1],
    vz: velocityKmPerSec[2],
  };
}

function addVector3(a: Vector3Km, b: Vector3Km): Vector3Km {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scaleVector3(vector: Vector3Km, scalar: number): Vector3Km {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function normalizeVector3(vector: Vector3Km): Vector3Km {
  const mag = magnitude3(vector);
  if (mag === 0) {
    return [0, 0, 0];
  }

  return [vector[0] / mag, vector[1] / mag, vector[2] / mag];
}

function crossVector3(a: Vector3Km, b: Vector3Km): Vector3Km {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function formatVector(vector: Vector3Km, digits = 2) {
  return vector.map((value) => value.toFixed(digits)).join(", ");
}

function formatCovarianceDiagonal(vector: Vector3Km, digits = 4) {
  return vector.map((value) => value.toFixed(digits)).join(", ");
}

function scaleCovarianceMatrix(
  covariance: CovarianceMatrix3,
  scale: number,
): CovarianceMatrix3 {
  const factor = scale * scale;
  return covariance.map((value) => value * factor) as CovarianceMatrix3;
}

function pushHistory(series: number[], nextValue: number) {
  return [...series, nextValue].slice(-MAX_HISTORY);
}

function toScenePoint(pointKm: Vector3Km): Vector3Km {
  return [pointKm[0] / 100, pointKm[1] / 100, pointKm[2] / 100];
}

function isCovarianceMatrix3(value: unknown): value is CovarianceMatrix3 {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every(
      (entry) => typeof entry === "number" && Number.isFinite(entry),
    )
  );
}

function covarianceDiagonalFromMatrix(matrix: CovarianceMatrix3): Vector3Km {
  return [matrix[0], matrix[4], matrix[8]];
}

function buildDiagonalCovariance(sigmas: Vector3Km): CovarianceMatrix3 {
  return [
    sigmas[0] * sigmas[0],
    0,
    0,
    0,
    sigmas[1] * sigmas[1],
    0,
    0,
    0,
    sigmas[2] * sigmas[2],
  ];
}

function formatMissionTimeLabel(timeSec: number) {
  return `T+${timeSec.toFixed(1)} s`;
}

function formatPredictedTimeLabel(anchorLabel: string, deltaSec: number) {
  return `${anchorLabel} + ${deltaSec.toFixed(1)} s prediction`;
}

function computeMedian(values: number[]) {
  if (values.length === 0) {
    return 1;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? 0.5 * (sorted[mid - 1] + sorted[mid])
    : sorted[mid];
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let idx = 0; idx < line.length; idx++) {
    const char = line[idx];

    if (char === "\"") {
      if (inQuotes && line[idx + 1] === "\"") {
        current += "\"";
        idx += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function buildInitialTruthState(): CartesianState {
  const earthRadiusKm = ASTRO_CONSTANTS.EARTH_RADIUS_KM;
  const mu = ASTRO_CONSTANTS.EARTH_GRAVITY_PARAM;
  const perigeeAltitudeKm = 500.0;
  const eccentricity = 0.08;
  const radiusPerigeeKm = earthRadiusKm + perigeeAltitudeKm;
  const semiMajorAxisKm = radiusPerigeeKm / (1 - eccentricity);
  const perigeeVelocityKmPerSec = Math.sqrt(
    (mu / semiMajorAxisKm) * ((1 + eccentricity) / (1 - eccentricity)),
  );

  return {
    x: radiusPerigeeKm,
    y: 0,
    z: 0,
    vx: 0,
    vy: perigeeVelocityKmPerSec,
    vz: 0,
  };
}

function buildCircularInitialGuess(positionKm: Vector3Km): number[] {
  const radiusKm = magnitude3(positionKm);
  const radialUnit = normalizeVector3(positionKm);
  let tangential = crossVector3([0, 0, 1], radialUnit);

  if (magnitude3(tangential) < 1e-6) {
    tangential = crossVector3([0, 1, 0], radialUnit);
  }

  const tangentialUnit = normalizeVector3(tangential);
  const circularSpeedKmPerSec = Math.sqrt(
    ASTRO_CONSTANTS.EARTH_GRAVITY_PARAM / radiusKm,
  );

  return [
    positionKm[0],
    positionKm[1],
    positionKm[2],
    tangentialUnit[0] * circularSpeedKmPerSec,
    tangentialUnit[1] * circularSpeedKmPerSec,
    tangentialUnit[2] * circularSpeedKmPerSec,
  ];
}

function inferUploadedInitialVelocity(dataset: UploadedGnssDataset): Vector3Km {
  const firstSample = dataset.samples[0];

  if (firstSample.velocityKmPerSec) {
    return firstSample.velocityKmPerSec;
  }

  if (firstSample.referenceVelocityKmPerSec) {
    return firstSample.referenceVelocityKmPerSec;
  }

  const secondSample = dataset.samples[1];
  if (secondSample) {
    const dt = Math.max(secondSample.timeSec - firstSample.timeSec, 1e-3);
    return [
      (secondSample.positionKm[0] - firstSample.positionKm[0]) / dt,
      (secondSample.positionKm[1] - firstSample.positionKm[1]) / dt,
      (secondSample.positionKm[2] - firstSample.positionKm[2]) / dt,
    ];
  }

  const circularGuess = buildCircularInitialGuess(firstSample.positionKm);
  return [circularGuess[3], circularGuess[4], circularGuess[5]];
}

function buildUploadedInitialGuess(dataset: UploadedGnssDataset): number[] {
  const firstSample = dataset.samples[0];
  const velocityGuess = inferUploadedInitialVelocity(dataset);

  return [
    firstSample.positionKm[0],
    firstSample.positionKm[1],
    firstSample.positionKm[2],
    velocityGuess[0],
    velocityGuess[1],
    velocityGuess[2],
  ];
}

function isVector3(value: unknown): value is Vector3Km {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (entry) => typeof entry === "number" && Number.isFinite(entry),
    )
  );
}

function parseChipProfiles(jsonText: string): GnssChipProfile[] {
  const raw = JSON.parse(jsonText) as unknown;
  const entries = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === "object" &&
        "profiles" in raw &&
        Array.isArray((raw as { profiles?: unknown[] }).profiles)
      ? (raw as { profiles: unknown[] }).profiles
      : [];

  const parsed = entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const candidate = entry as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const label =
      typeof candidate.label === "string" ? candidate.label.trim() : "";
    const description =
      typeof candidate.description === "string"
        ? candidate.description.trim()
        : "Imported receiver profile.";

    if (!id || !label || !isVector3(candidate.biasKm) || !isVector3(candidate.noiseSigmaKm)) {
      return [];
    }

    return [
      {
        id,
        label,
        description,
        biasKm: candidate.biasKm,
        noiseSigmaKm: candidate.noiseSigmaKm,
      },
    ];
  });

  if (parsed.length === 0) {
    throw new Error("No valid chip profiles found in the JSON file.");
  }

  return parsed;
}

function mergeChipProfiles(
  baseProfiles: GnssChipProfile[],
  importedProfiles: GnssChipProfile[],
) {
  const merged = new Map<string, GnssChipProfile>();

  for (const profile of baseProfiles) {
    merged.set(profile.id, profile);
  }

  for (const profile of importedProfiles) {
    merged.set(profile.id, profile);
  }

  return Array.from(merged.values());
}

function readNumberFromRecord(
  record: Record<string, unknown>,
  aliases: string[],
) {
  for (const alias of aliases) {
    const value = record[alias];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readStringFromRecord(
  record: Record<string, unknown>,
  aliases: string[],
) {
  for (const alias of aliases) {
    const value = record[alias];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return null;
}

function readVectorFromRecord(
  record: Record<string, unknown>,
  xAliases: string[],
  yAliases: string[],
  zAliases: string[],
): Vector3Km | null {
  const x = readNumberFromRecord(record, xAliases);
  const y = readNumberFromRecord(record, yAliases);
  const z = readNumberFromRecord(record, zAliases);

  if (x === null || y === null || z === null) {
    return null;
  }

  return [x, y, z];
}

function readCovarianceMatrixFromRecord(
  record: Record<string, unknown>,
): CovarianceMatrix3 | null {
  const covXX = readNumberFromRecord(record, ["covxx", "rxx", "pxx"]);
  const covXY = readNumberFromRecord(record, ["covxy", "rxy", "pxy"]) ?? 0;
  const covXZ = readNumberFromRecord(record, ["covxz", "rxz", "pxz"]) ?? 0;
  const covYY = readNumberFromRecord(record, ["covyy", "ryy", "pyy"]);
  const covYZ = readNumberFromRecord(record, ["covyz", "ryz", "pyz"]) ?? 0;
  const covZZ = readNumberFromRecord(record, ["covzz", "rzz", "pzz"]);

  if (covXX === null || covYY === null || covZZ === null) {
    return null;
  }

  return [
    covXX,
    covXY,
    covXZ,
    covXY,
    covYY,
    covYZ,
    covXZ,
    covYZ,
    covZZ,
  ];
}

function resolveTimeMetadata(record: Record<string, unknown>) {
  const timestampText = readStringFromRecord(record, [
    "timestamp",
    "utc",
    "datetime",
    "isotime",
    "isoutc",
    "epoch",
  ]);

  if (timestampText) {
    const parsedMs = Date.parse(timestampText);
    if (!Number.isNaN(parsedMs)) {
      return {
        timeSec: parsedMs / 1000,
        sampleTimeLabel: new Date(parsedMs).toISOString(),
      };
    }
  }

  const rawNumericTime =
    readNumberFromRecord(record, [
      "times",
      "time",
      "t",
      "second",
      "seconds",
      "epochsec",
      "epochms",
    ]) ?? 0;

  if (rawNumericTime > 1e12) {
    return {
      timeSec: rawNumericTime / 1000,
      sampleTimeLabel: new Date(rawNumericTime).toISOString(),
    };
  }

  if (rawNumericTime > 1e9) {
    return {
      timeSec: rawNumericTime,
      sampleTimeLabel: new Date(rawNumericTime * 1000).toISOString(),
    };
  }

  return {
    timeSec: rawNumericTime,
    sampleTimeLabel: formatMissionTimeLabel(rawNumericTime),
  };
}

function extractSample(record: Record<string, unknown>): GnssLogSample | null {
  const { timeSec, sampleTimeLabel } = resolveTimeMetadata(record);

  const positionKm = readVectorFromRecord(
    record,
    ["x", "xkm", "positionx", "positionxkm", "ecix", "ecixkm"],
    ["y", "ykm", "positiony", "positionykm", "eciy", "eciykm"],
    ["z", "zkm", "positionz", "positionzkm", "eciz", "ecizkm"],
  );

  if (!positionKm) {
    return null;
  }

  const velocityKmPerSec = readVectorFromRecord(
    record,
    ["vx", "vxkms", "velocityx", "velocityxkms", "ecivx", "ecivxkms"],
    ["vy", "vykms", "velocityy", "velocityykms", "ecivy", "ecivykms"],
    ["vz", "vzkms", "velocityz", "velocityzkms", "ecivz", "ecivzkms"],
  );

  const referencePositionKm = readVectorFromRecord(
    record,
    ["refx", "refxkm", "truthx", "truthxkm", "cleanx", "cleanxkm"],
    ["refy", "refykm", "truthy", "truthykm", "cleany", "cleanykm"],
    ["refz", "refzkm", "truthz", "truthzkm", "cleanz", "cleanzkm"],
  );

  const referenceVelocityKmPerSec = readVectorFromRecord(
    record,
    ["refvx", "refvxkms", "truthvx", "truthvxkms", "cleanvx", "cleanvxkms"],
    ["refvy", "refvykms", "truthvy", "truthvykms", "cleanvy", "cleanvykms"],
    ["refvz", "refvzkms", "truthvz", "truthvzkms", "cleanvz", "cleanvzkms"],
  );

  const measurementSigmaKm = readVectorFromRecord(
    record,
    ["sigmax", "sigmaxkm", "rx", "rxkm"],
    ["sigmay", "sigmaykm", "ry", "rykm"],
    ["sigmaz", "sigmazkm", "rz", "rzkm"],
  );
  const measurementCovarianceKm2 = readCovarianceMatrixFromRecord(record);

  return {
    timeSec,
    sampleTimeLabel,
    positionKm,
    velocityKmPerSec: velocityKmPerSec ?? undefined,
    referencePositionKm: referencePositionKm ?? undefined,
    referenceVelocityKmPerSec: referenceVelocityKmPerSec ?? undefined,
    measurementSigmaKm: measurementSigmaKm ?? undefined,
    measurementCovarianceKm2: measurementCovarianceKm2 ?? undefined,
  };
}

function normalizeSampleTimes(samples: GnssLogSample[]) {
  const startTimeSec = samples[0]?.timeSec ?? 0;
  return samples.map((sample) => ({
    ...sample,
    timeSec: sample.timeSec - startTimeSec,
    sampleTimeLabel: sample.sampleTimeLabel ?? formatMissionTimeLabel(sample.timeSec),
  }));
}

function buildUploadedDataset(name: string, samples: GnssLogSample[]): UploadedGnssDataset {
  if (samples.length === 0) {
    throw new Error("No usable GNSS samples were found.");
  }

  const timeOrderedSamples = [...samples].sort((a, b) => a.timeSec - b.timeSec);
  const normalizedSamples = normalizeSampleTimes(timeOrderedSamples);
  const cadenceCandidates = normalizedSamples
    .slice(1)
    .map((sample, index) => sample.timeSec - normalizedSamples[index].timeSec)
    .filter((value) => Number.isFinite(value) && value > 0);

  return {
    name,
    samples: normalizedSamples,
    cadenceSec: computeMedian(cadenceCandidates),
    hasReference: normalizedSamples.some((sample) => !!sample.referencePositionKm),
    totalDurationSec:
      normalizedSamples[normalizedSamples.length - 1]?.timeSec ?? 0,
  };
}

function inferVelocityFromSamples(
  samples: GnssLogSample[],
  index: number,
  selector: (sample: GnssLogSample) => Vector3Km | undefined,
): Vector3Km | null {
  const current = selector(samples[index]);

  if (!current) {
    return null;
  }

  const previous = index > 0 ? selector(samples[index - 1]) : undefined;
  const next = index < samples.length - 1 ? selector(samples[index + 1]) : undefined;

  if (previous && next) {
    const dt = samples[index + 1].timeSec - samples[index - 1].timeSec;
    if (dt > 0) {
      return [
        (next[0] - previous[0]) / dt,
        (next[1] - previous[1]) / dt,
        (next[2] - previous[2]) / dt,
      ];
    }
  }

  if (previous) {
    const dt = samples[index].timeSec - samples[index - 1].timeSec;
    if (dt > 0) {
      return [
        (current[0] - previous[0]) / dt,
        (current[1] - previous[1]) / dt,
        (current[2] - previous[2]) / dt,
      ];
    }
  }

  if (next) {
    const dt = samples[index + 1].timeSec - samples[index].timeSec;
    if (dt > 0) {
      return [
        (next[0] - current[0]) / dt,
        (next[1] - current[1]) / dt,
        (next[2] - current[2]) / dt,
      ];
    }
  }

  return null;
}

function getReferenceStateForSample(
  dataset: UploadedGnssDataset,
  index: number,
): CartesianState | null {
  const sample = dataset.samples[index];

  if (!sample?.referencePositionKm) {
    return null;
  }

  const velocityKmPerSec =
    sample.referenceVelocityKmPerSec ??
    inferVelocityFromSamples(
      dataset.samples,
      index,
      (candidate) => candidate.referencePositionKm,
    );

  if (!velocityKmPerSec) {
    return null;
  }

  return toCartesianState(sample.referencePositionKm, velocityKmPerSec);
}

function getReferenceStateAtTime(
  dataset: UploadedGnssDataset,
  timeSec: number,
): CartesianState | null {
  let anchorIndex = -1;

  for (let idx = dataset.samples.length - 1; idx >= 0; idx--) {
    const sample = dataset.samples[idx];
    if (sample.referencePositionKm && sample.timeSec <= timeSec + 1e-9) {
      anchorIndex = idx;
      break;
    }
  }

  if (anchorIndex < 0) {
    anchorIndex = dataset.samples.findIndex((sample) => !!sample.referencePositionKm);
  }

  if (anchorIndex < 0) {
    return null;
  }

  const anchorState = getReferenceStateForSample(dataset, anchorIndex);
  if (!anchorState) {
    return null;
  }

  const dtSec = timeSec - dataset.samples[anchorIndex].timeSec;
  return dtSec > 0 ? propagateCartesianState(anchorState, dtSec) : anchorState;
}

function buildPropagatedTrack(
  startState: CartesianState,
  startTimeSec: number,
  endTimeSec: number,
  stepSec: number,
): Vector3Km[] {
  const points = [toPositionVector(startState)];

  if (endTimeSec <= startTimeSec) {
    return points;
  }

  let currentState = startState;
  let currentTimeSec = startTimeSec;

  while (currentTimeSec < endTimeSec - 1e-9) {
    const dtSec = Math.min(stepSec, endTimeSec - currentTimeSec);
    currentState = propagateCartesianState(currentState, dtSec);
    currentTimeSec += dtSec;
    points.push(toPositionVector(currentState));
  }

  return points;
}

function buildReferenceTrack(
  dataset: UploadedGnssDataset,
  horizonEndSec: number,
): Vector3Km[] {
  const observedReference = dataset.samples.flatMap((sample) =>
    sample.referencePositionKm ? [sample.referencePositionKm] : [],
  );

  if (observedReference.length === 0) {
    return [];
  }

  let lastReferenceIndex = -1;
  for (let idx = dataset.samples.length - 1; idx >= 0; idx--) {
    if (dataset.samples[idx].referencePositionKm) {
      lastReferenceIndex = idx;
      break;
    }
  }

  if (lastReferenceIndex < 0) {
    return observedReference;
  }

  const lastReferenceState = getReferenceStateForSample(dataset, lastReferenceIndex);
  if (!lastReferenceState) {
    return observedReference;
  }

  const propagatedReference = buildPropagatedTrack(
    lastReferenceState,
    dataset.samples[lastReferenceIndex].timeSec,
    horizonEndSec,
    PROPAGATION_TRACK_STEP_SEC,
  );

  return [...observedReference, ...propagatedReference.slice(1)];
}

function buildReferenceEphemeris(
  dataset: UploadedGnssDataset,
  horizonEndSec: number,
) {
  const observedReferenceSamples = dataset.samples.flatMap((sample, index) => {
    const state = getReferenceStateForSample(dataset, index);

    if (!state) {
      return [];
    }

    return [
      {
        timeSec: sample.timeSec,
        sampleTimeLabel:
          sample.sampleTimeLabel ?? formatMissionTimeLabel(sample.timeSec),
        positionKm: toPositionVector(state),
        velocityKmPerSec: toVelocityVector(state),
      },
    ];
  });

  if (observedReferenceSamples.length === 0) {
    return [];
  }

  let lastReferenceIndex = -1;
  for (let idx = dataset.samples.length - 1; idx >= 0; idx--) {
    if (dataset.samples[idx].referencePositionKm) {
      lastReferenceIndex = idx;
      break;
    }
  }

  if (lastReferenceIndex < 0) {
    return observedReferenceSamples;
  }

  const lastReferenceState = getReferenceStateForSample(dataset, lastReferenceIndex);
  if (!lastReferenceState) {
    return observedReferenceSamples;
  }

  const propagatedReference = [...observedReferenceSamples];
  let currentState = lastReferenceState;
  let currentTimeSec = dataset.samples[lastReferenceIndex].timeSec;

  while (currentTimeSec < horizonEndSec - 1e-9) {
    const dtSec = Math.min(PROPAGATION_TRACK_STEP_SEC, horizonEndSec - currentTimeSec);
    currentState = propagateCartesianState(currentState, dtSec);
    currentTimeSec += dtSec;
    propagatedReference.push({
      timeSec: currentTimeSec,
      sampleTimeLabel: formatMissionTimeLabel(currentTimeSec),
      positionKm: toPositionVector(currentState),
      velocityKmPerSec: toVelocityVector(currentState),
    });
  }

  return propagatedReference;
}

function parseCsvDataset(name: string, text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV file must include a header row and at least one sample.");
  }

  const headerCells = splitCsvLine(lines[0]).map(normalizeHeader);
  const samples = lines
    .slice(1)
    .flatMap((line) => {
      const cellValues = splitCsvLine(line);
      const record: Record<string, unknown> = {};
      headerCells.forEach((header, idx) => {
        record[header] = cellValues[idx] ?? "";
      });
      const parsed = extractSample(record);
      return parsed ? [parsed] : [];
    });

  return buildUploadedDataset(name, samples);
}

function parseJsonDataset(name: string, text: string) {
  const raw = JSON.parse(text) as unknown;
  const entries = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === "object" &&
        "samples" in raw &&
        Array.isArray((raw as { samples?: unknown[] }).samples)
      ? (raw as { samples: unknown[] }).samples
      : null;

  if (!entries) {
    throw new Error("JSON GNSS file must be an array of sample objects or an object with a samples array.");
  }

  const samples = entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const structured = entry as Record<string, unknown>;
    if (isVector3(structured.positionKm)) {
      return [
        {
          timeSec:
            typeof structured.timeSec === "number"
              ? structured.timeSec
              : 0,
          sampleTimeLabel:
            typeof structured.sampleTimeLabel === "string"
              ? structured.sampleTimeLabel
              : undefined,
          positionKm: structured.positionKm,
          velocityKmPerSec: isVector3(structured.velocityKmPerSec)
            ? structured.velocityKmPerSec
            : undefined,
          referencePositionKm: isVector3(structured.referencePositionKm)
            ? structured.referencePositionKm
            : undefined,
          referenceVelocityKmPerSec: isVector3(structured.referenceVelocityKmPerSec)
            ? structured.referenceVelocityKmPerSec
            : undefined,
          measurementSigmaKm: isVector3(structured.measurementSigmaKm)
            ? structured.measurementSigmaKm
            : undefined,
          measurementCovarianceKm2: isCovarianceMatrix3(
            structured.measurementCovarianceKm2,
          )
            ? structured.measurementCovarianceKm2
            : undefined,
        } satisfies GnssLogSample,
      ];
    }

    const record = Object.fromEntries(
      Object.entries(entry as Record<string, unknown>).map(([key, value]) => [
        normalizeHeader(key),
        value,
      ]),
    );
    const parsed = extractSample(record);
    return parsed ? [parsed] : [];
  });

  return buildUploadedDataset(name, samples);
}

async function readDatasetFile(file: File) {
  const text = await file.text();

  if (file.name.toLowerCase().endsWith(".json")) {
    return parseJsonDataset(file.name, text);
  }

  return parseCsvDataset(file.name, text);
}

class SimulatedGnssSeries {
  public totalDeltaV = 0;
  public sampleCount = 0;
  public simTimeSec = 0;

  private state: CartesianState;

  constructor(private readonly chipProfile: GnssChipProfile) {
    this.state = buildInitialTruthState();
  }

  public getTruthState() {
    return this.state;
  }

  public applyManeuver(deltaVx: number, deltaVy: number) {
    this.state = {
      ...this.state,
      vx: this.state.vx + deltaVx,
      vy: this.state.vy + deltaVy,
    };
    this.totalDeltaV += Math.hypot(deltaVx, deltaVy);
  }

  public fireThruster() {
    this.applyManeuver(0.05, 0.1);
  }

  public propagate(dtSec: number) {
    if (dtSec <= 0) {
      return;
    }

    this.state = propagateCartesianState(this.state, dtSec);
    this.simTimeSec += dtSec;
  }

  public captureSample(cadenceSec: number): SimulatedPacket {
    this.sampleCount += 1;

    const truthPosition = toPositionVector(this.state);
    const truthVelocity = toVelocityVector(this.state);
    const measurement: Vector3Km = [
      truthPosition[0] +
        this.chipProfile.biasKm[0] +
        sampleGaussian(this.chipProfile.noiseSigmaKm[0]),
      truthPosition[1] +
        this.chipProfile.biasKm[1] +
        sampleGaussian(this.chipProfile.noiseSigmaKm[1]),
      truthPosition[2] +
        this.chipProfile.biasKm[2] +
        sampleGaussian(this.chipProfile.noiseSigmaKm[2]),
    ];
    const velocityMeasurement: Vector3Km = [
      truthVelocity[0] + sampleGaussian(SIMULATED_VELOCITY_SIGMA_KM_PER_SEC[0]),
      truthVelocity[1] + sampleGaussian(SIMULATED_VELOCITY_SIGMA_KM_PER_SEC[1]),
      truthVelocity[2] + sampleGaussian(SIMULATED_VELOCITY_SIGMA_KM_PER_SEC[2]),
    ];

    return {
      timeSec: this.simTimeSec,
      sampleTimeLabel: formatMissionTimeLabel(this.simTimeSec),
      positionKm: measurement,
      velocityKmPerSec: velocityMeasurement,
      referencePositionKm: truthPosition,
      referenceVelocityKmPerSec: truthVelocity,
      measurementCovarianceKm2: buildDiagonalCovariance(
        this.chipProfile.noiseSigmaKm,
      ),
      sampleCount: this.sampleCount,
      cadenceSec,
    };
  }

  public step(dtSec: number): SimulatedPacket {
    this.propagate(dtSec);
    return this.captureSample(dtSec);
  }
}

function buildSimulatedDataset(
  chipProfile: GnssChipProfile,
  maneuverEvents: ManeuverEvent[],
): UploadedGnssDataset {
  const series = new SimulatedGnssSeries(chipProfile);
  const sortedEvents = [...maneuverEvents].sort((a, b) => a.timeSec - b.timeSec);
  const samples: GnssLogSample[] = [];

  let currentTimeSec = 0;
  let eventIdx = 0;

  for (
    let sampleTimeSec = 0;
    sampleTimeSec <= SIMULATED_OBSERVATION_DURATION_SEC + 1e-9;
    sampleTimeSec += SIMULATED_GNSS_CADENCE_SEC
  ) {
    while (
      eventIdx < sortedEvents.length &&
      sortedEvents[eventIdx].timeSec <= sampleTimeSec + 1e-9
    ) {
      const eventTimeSec = clamp(
        sortedEvents[eventIdx].timeSec,
        currentTimeSec,
        sampleTimeSec,
      );

      if (eventTimeSec > currentTimeSec) {
        series.propagate(eventTimeSec - currentTimeSec);
        currentTimeSec = eventTimeSec;
      }

      series.applyManeuver(
        sortedEvents[eventIdx].deltaVxKmPerSec,
        sortedEvents[eventIdx].deltaVyKmPerSec,
      );
      eventIdx += 1;
    }

    if (sampleTimeSec > currentTimeSec) {
      series.propagate(sampleTimeSec - currentTimeSec);
      currentTimeSec = sampleTimeSec;
    }

    const packet = series.captureSample(SIMULATED_GNSS_CADENCE_SEC);
    samples.push({
      timeSec: packet.timeSec,
      sampleTimeLabel: packet.sampleTimeLabel,
      positionKm: packet.positionKm,
      velocityKmPerSec: packet.velocityKmPerSec,
      referencePositionKm: packet.referencePositionKm,
      referenceVelocityKmPerSec: packet.referenceVelocityKmPerSec,
      measurementCovarianceKm2: packet.measurementCovarianceKm2,
      measurementSigmaKm: covarianceDiagonalFromMatrix(
        packet.measurementCovarianceKm2,
      ).map((value) => Math.sqrt(Math.max(value, 0))) as Vector3Km,
    });
  }

  return {
    name: `simulated-${chipProfile.id}-gnss-array`,
    samples,
    cadenceSec: SIMULATED_GNSS_CADENCE_SEC,
    hasReference: true,
    totalDurationSec: SIMULATED_OBSERVATION_DURATION_SEC,
  };
}

class UploadedGnssPlayback {
  public elapsedSec = 0;
  public index = 0;
  public sampleCount = 0;

  private currentSample: GnssLogSample | null = null;

  constructor(private readonly dataset: UploadedGnssDataset) {}

  public advance(dtSec: number) {
    this.elapsedSec += dtSec;
    const emitted: GnssLogSample[] = [];

    while (
      this.index < this.dataset.samples.length &&
      this.dataset.samples[this.index].timeSec <= this.elapsedSec
    ) {
      this.currentSample = this.dataset.samples[this.index];
      emitted.push(this.currentSample);
      this.index += 1;
      this.sampleCount += 1;
    }

    return emitted;
  }

  public getCurrentSample() {
    return this.currentSample;
  }

  public getProgress() {
    if (this.dataset.samples.length === 0) {
      return 0;
    }

    return this.sampleCount / this.dataset.samples.length;
  }

  public isFinished() {
    return this.index >= this.dataset.samples.length;
  }
}

function TimeSeriesPlot({
  data,
  label,
  maxVal,
  color,
}: {
  data: number[];
  label: string;
  maxVal: number;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getResolvedCssToken(
      "--od-panel",
      odCanvasColorFallbacks.panel,
    );
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = getResolvedCssToken(
      "--od-border-muted",
      odCanvasColorFallbacks.borderMuted,
    );
    ctx.lineWidth = 1;
    for (let idx = 0; idx < 3; idx++) {
      const y = (height / 2) * idx;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const plotMax = Math.max(maxVal, ...data, 1e-6);
    if (data.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      data.forEach((value, idx) => {
        const x = data.length === 1 ? 0 : (idx / (MAX_HISTORY - 1)) * width;
        const clampedValue = clamp(value, 0, plotMax * 1.15);
        const y = height - (clampedValue / plotMax) * (height - 8) - 4;
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    ctx.fillStyle = getResolvedCssToken(
      "--od-text-muted",
      odCanvasColorFallbacks.textMuted,
    );
    ctx.font = getCanvasTypeFont("label");
    ctx.fillText(label, 8, 13);
    ctx.fillText((data[data.length - 1] ?? 0).toFixed(3), width - 56, 13);
  }, [color, data, label, maxVal]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={64}
      style={{
        width: "100%",
        border: `1px solid ${odColorTokens.border}`,
        background: odColorTokens.panel,
      }}
    />
  );
}

function ResidualScope({
  measured,
  reference,
  blackout,
  maxRangeKm,
  label,
}: {
  measured: Vector3Km | null;
  reference: Vector3Km | null;
  blackout: boolean;
  maxRangeKm: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    const size = 260;
    const center = size / 2;
    const pixelsPerKm = center / maxRangeKm;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = getResolvedCssToken(
      "--od-panel-strong",
      odCanvasColorFallbacks.panelStrong,
    );
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = getResolvedCssToken(
      "--od-border-soft",
      odCanvasColorFallbacks.borderSoft,
    );
    [0.25, 0.5, 1.0].forEach((ring) => {
      ctx.beginPath();
      ctx.arc(center, center, center * ring, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = getResolvedCssToken(
      "--od-accent",
      odCanvasColorFallbacks.accent,
    );
    ctx.beginPath();
    ctx.moveTo(center, center - 6);
    ctx.lineTo(center, center + 6);
    ctx.moveTo(center - 6, center);
    ctx.lineTo(center + 6, center);
    ctx.stroke();

    if (blackout || !measured || !reference) {
      trail.current = [];
      ctx.fillStyle = getResolvedCssToken(
        "--od-text-subtle",
        odCanvasColorFallbacks.textSubtle,
      );
      ctx.font = getCanvasTypeFont("text");
      ctx.fillText("NO LIVE RESIDUAL", center - 48, center + 4);
      return;
    }

    const dx = (measured[0] - reference[0]) * pixelsPerKm;
    const dz = (measured[2] - reference[2]) * pixelsPerKm;
    const distancePx = Math.hypot(dx, dz);
    let plotX = center + dx;
    let plotY = center + dz;

    if (distancePx > center - 6) {
      const angle = Math.atan2(dz, dx);
      plotX = center + Math.cos(angle) * (center - 8);
      plotY = center + Math.sin(angle) * (center - 8);
    }

    trail.current.push([plotX, plotY]);
    trail.current = trail.current.slice(-60);

    ctx.strokeStyle = odCanvasColorFallbacks.dangerBorder;
    ctx.beginPath();
    trail.current.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.fillStyle = getResolvedCssToken(
      "--od-danger",
      odCanvasColorFallbacks.danger,
    );
    ctx.beginPath();
    ctx.arc(plotX, plotY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = getResolvedCssToken(
      "--od-text-muted",
      odCanvasColorFallbacks.textMuted,
    );
    ctx.font = getCanvasTypeFont("label");
    ctx.fillText(label, 8, 16);
    ctx.fillText(`${maxRangeKm.toFixed(0)} km`, size - 50, 16);
  }, [blackout, label, maxRangeKm, measured, reference]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={260}
      style={{
        width: "100%",
        border: `1px solid ${odColorTokens.border}`,
        background: odColorTokens.panelStrong,
      }}
    />
  );
}

function SpatialNotification({
  position,
  message,
  type,
  onComplete,
}: {
  position: [number, number, number];
  message: string;
  type: "alert" | "info";
  onComplete: () => void;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [onComplete]);

  const color = type === "alert" ? odColorTokens.danger : odColorTokens.accent;

  return (
    <Html position={position} center zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `2px dashed ${color}`,
            boxShadow: `0 0 12px ${color}44`,
          }}
        />
        <div
          className="type-label"
          style={{
            marginTop: 4,
            background: odColorTokens.overlay,
            border: `1px solid ${color}`,
            color,
            padding: "3px 7px",
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </div>
      </div>
    </Html>
  );
}

function OperationsLog({
  logs,
}: {
  logs: Array<{ time: string; type: "INFO" | "ALERT"; message: string }>;
}) {
  return (
    <div
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        position: "absolute",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(880px, calc(100vw - 40px))",
        height: 132,
        border: `1px solid ${odColorTokens.border}`,
        background: odColorTokens.panel,
        color: odColorTokens.text,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
      }}
    >
      <div
        className="type-label"
        style={{
          borderBottom: `1px solid ${odColorTokens.border}`,
          padding: "6px 10px",
          color: odColorTokens.textHeading,
        }}
      >
        OPERATIONS LOG
      </div>
      <div
        className="type-text"
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: 2,
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
        }}
      >
        {logs.length === 0 ? (
          <div className="type-text" style={{ color: odColorTokens.textSubtle }}>
            No events yet.
          </div>
        ) : (
          logs.map((entry, index) => (
            <div
              key={`${entry.time}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "88px 64px 1fr",
                gap: 8,
                paddingBottom: 3,
                borderBottom: `1px solid ${odColorTokens.borderSoft}`,
              }}
            >
              <span style={{ color: odColorTokens.textSubtle }}>[{entry.time}]</span>
              <span style={{ color: entry.type === "ALERT" ? odColorTokens.dangerSoft : odColorTokens.accentSoft }}>
                {entry.type}
              </span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HudPanel({
  title,
  subtitle,
  children,
  width,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number | string;
}) {
  return (
    <div
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        width,
        border: `1px solid ${odColorTokens.border}`,
        background: odColorTokens.panel,
        color: odColorTokens.text,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "auto",
      }}
    >
      <div>
        <div
          className="type-label"
          style={{
            color: odColorTokens.textHeading,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div className="type-text" style={{ color: odColorTokens.textSubtle, marginTop: 3 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${odColorTokens.borderMuted}`,
        background: odColorTokens.panelSoft,
        padding: 10,
      }}
    >
      <div
        className="type-label"
        style={{
          color: odColorTokens.textSubtle,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div className="type-text" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function OrbitTrackLine({
  points,
  color,
  opacity,
}: {
  points: Vector3Km[];
  color: string;
  opacity: number;
}) {
  const positionArray = useMemo(() => {
    const array = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      const scenePoint = toScenePoint(point);
      array[index * 3] = scenePoint[0];
      array[index * 3 + 1] = scenePoint[1];
      array[index * 3 + 2] = scenePoint[2];
    });
    return array;
  }, [points]);

  if (points.length < 2) {
    return null;
  }

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positionArray, 3]}
          count={points.length}
          array={positionArray}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

const EMPTY_ESTIMATE: Vector3Km = [0, 0, 0];

export default function KalmanSatellite() {
  const trailPointCount = 500;
  const hudUpdateStep = 4;
  const trackSampleStep = 1;
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls as unknown as OrbitControlsHandle | undefined,
  );
  const filterMeshRef = useRef<THREE.Mesh>(null);
  const trailLineRef = useRef<THREE.Line>(null);
  const trailPos = useMemo(
    () => new Float32Array(trailPointCount * 3),
    [trailPointCount],
  );

  const setOdModeEnabled = useViewStore((state) => state.setOdModeEnabled);

  const [chipProfiles, setChipProfiles] = useState(DEFAULT_GNSS_CHIP_PROFILES);
  const [selectedChipId, setSelectedChipId] = useState("cots-patch");
  const selectedChip =
    chipProfiles.find((profile) => profile.id === selectedChipId) ??
    chipProfiles[0];

  const [sourceMode, setSourceMode] = useState<SourceMode>("sim");
  const [uploadedDataset, setUploadedDataset] = useState<UploadedGnssDataset | null>(null);

  const [tuning, setTuning] = useState({
    processAccelExponent: -7,
    measurementScale: 1,
    biasTrimX: 0,
    biasTrimY: 0,
    biasTrimZ: 0,
  });
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [scopeRangeKm, setScopeRangeKm] = useState(10);
  const [paused, setPaused] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [maneuverEvents, setManeuverEvents] = useState<ManeuverEvent[]>([]);

  const [hud, setHud] = useState<LiveHudData>({
    sourceMode: "sim",
    sourceLabel: "Simulated GNSS sample array",
    datasetLabel: "No dataset loaded",
    chipLabel: selectedChip?.label ?? "Receiver",
    sampleTimeLabel: "Awaiting first sample",
    measurement: null,
    measurementVelocity: null,
    estimate: EMPTY_ESTIMATE,
    reference: null,
    referenceVelocity: null,
    covarianceDiagKm2: null,
    measurementSeparationKm: 0,
    estimateSeparationKm: 0,
    innovationNormKm: 0,
    threeSigmaKm: 0,
    normalizedInnovationSquared: 0,
    sampleCount: 0,
    streamTimeSec: 0,
    cadenceSec: 0,
    progress: 0,
    inBlackout: false,
  });
  const [history, setHistory] = useState<HistoryState>({
    measurementSeparation: [],
    estimateSeparation: [],
    innovation: [],
    sigmaEnvelope: [],
  });
  const [logs, setLogs] = useState<Array<{ time: string; type: "INFO" | "ALERT"; message: string }>>([]);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; pos: [number, number, number]; message: string; type: "alert" | "info" }>
  >([]);
  const [orbitTracks, setOrbitTracks] = useState<OrbitTrackState>({
    measurement: [],
    estimate: [],
    reference: [],
  });

  const filterRef = useRef<OrbitDeterminationFilter | null>(null);
  const simulatedDatasetRef = useRef<UploadedGnssDataset | null>(null);
  const simulatedPlaybackRef = useRef<UploadedGnssPlayback | null>(null);
  const simulatedSamplesRef = useRef<GnssLogSample[]>([]);
  const uploadedPlaybackRef = useRef<UploadedGnssPlayback | null>(null);
  const latestMeasurementRef = useRef<Vector3Km | null>(null);
  const latestMeasurementVelocityRef = useRef<Vector3Km | null>(null);
  const latestReferenceRef = useRef<Vector3Km | null>(null);
  const latestReferenceVelocityRef = useRef<Vector3Km | null>(null);
  const latestCovarianceDiagRef = useRef<Vector3Km | null>(null);
  const lastElapsedRef = useRef(0);
  const resyncClockRef = useRef(true);
  const frameCounterRef = useRef(0);
  const uploadFinishedRef = useRef(false);
  const estimateTrackRef = useRef<Vector3Km[]>([]);
  const measurementTrackRef = useRef<Vector3Km[]>([]);
  const referenceTrackRef = useRef<Vector3Km[]>([]);

  const measurementSigmaKm = scaleVector3(
    selectedChip.noiseSigmaKm,
    tuning.measurementScale,
  );
  const calibrationBiasKm = addVector3(selectedChip.biasKm, [
    tuning.biasTrimX,
    tuning.biasTrimY,
    tuning.biasTrimZ,
  ]);

  const getActiveDataset = () =>
    sourceMode === "upload" ? uploadedDataset : simulatedDatasetRef.current;

  const getObservationDurationSec = () => getActiveDataset()?.totalDurationSec ?? 0;

  const getTimelineMaxSec = () => {
    const observationDurationSec = getObservationDurationSec();

    if (observationDurationSec <= 0) {
      return 0;
    }

    return observationDurationSec + PROPAGATION_HORIZON_SEC;
  };

  const buildDisplayedEstimateTrack = (
    observedEstimateTrack: Vector3Km[],
    estimateState: CartesianState,
    currentTimeSec: number,
    horizonEndSec: number,
  ) => {
    const currentPoint = toPositionVector(estimateState);
    const displayedTrack = [...observedEstimateTrack];

    if (
      displayedTrack.length === 0 ||
      distance3(displayedTrack[displayedTrack.length - 1], currentPoint) > 1e-6
    ) {
      displayedTrack.push(currentPoint);
    }

    if (horizonEndSec <= currentTimeSec) {
      return displayedTrack;
    }

    const propagatedTrack = buildPropagatedTrack(
      estimateState,
      currentTimeSec,
      horizonEndSec,
      PROPAGATION_TRACK_STEP_SEC,
    );

    return [...displayedTrack, ...propagatedTrack.slice(1)];
  };

  const downsampleTrack = (points: Vector3Km[]) => {
    if (trackSampleStep <= 1 || points.length <= 2) {
      return points;
    }

    const sampled = points.filter((_, index) => index % trackSampleStep === 0);
    const lastPoint = points[points.length - 1];

    if (sampled[sampled.length - 1] !== lastPoint) {
      sampled.push(lastPoint);
    }

    return sampled;
  };

  const buildFreshFilter = () => {
    const initialGuess =
      sourceMode === "upload" && uploadedDataset
        ? buildUploadedInitialGuess(uploadedDataset)
        : buildCircularInitialGuess(toPositionVector(buildInitialTruthState()));

    return new OrbitDeterminationFilter(initialGuess, {
      positionSigmaKm: sourceMode === "upload" ? 12 : 8,
      velocitySigmaKmPerSec: sourceMode === "upload" ? 0.5 : 0.35,
      processAccelerationSigmaKmPerSec2: Math.pow(
        10,
        tuning.processAccelExponent,
      ),
      measurementSigmaKm,
    });
  };

  const getScaledMeasurementNoise = (sample: GnssLogSample) => {
    if (sample.measurementCovarianceKm2) {
      return scaleCovarianceMatrix(
        sample.measurementCovarianceKm2,
        tuning.measurementScale,
      );
    }

    if (sample.measurementSigmaKm) {
      return scaleVector3(sample.measurementSigmaKm, tuning.measurementScale);
    }

    return measurementSigmaKm;
  };

  const appendEstimateToTrail = (positionKm: Vector3Km) => {
    for (let idx = 0; idx < trailPointCount - 1; idx++) {
      trailPos[idx * 3] = trailPos[(idx + 1) * 3];
      trailPos[idx * 3 + 1] = trailPos[(idx + 1) * 3 + 1];
      trailPos[idx * 3 + 2] = trailPos[(idx + 1) * 3 + 2];
    }

    const trailIdx = (trailPointCount - 1) * 3;
    trailPos[trailIdx] = positionKm[0] / 100;
    trailPos[trailIdx + 1] = positionKm[1] / 100;
    trailPos[trailIdx + 2] = positionKm[2] / 100;

    if (trailLineRef.current) {
      trailLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  };

  const focusCameraOnSatellite = () => {
    const satelliteMesh = filterMeshRef.current;
    if (!satelliteMesh) {
      return;
    }

    const worldTarget = new THREE.Vector3();
    satelliteMesh.getWorldPosition(worldTarget);

    const currentTarget = controls?.target.clone() ?? new THREE.Vector3(0, -60, 0);
    const cameraOffset = camera.position.clone().sub(currentTarget);
    const fallbackOffset = new THREE.Vector3(0, 8, 18);
    const nextOffset =
      cameraOffset.lengthSq() > 1e-6 ? cameraOffset : fallbackOffset;
    const desiredDistance = 18;

    nextOffset.setLength(desiredDistance);
    camera.position.copy(worldTarget.clone().add(nextOffset));

    if (controls) {
      controls.target.copy(worldTarget);
      controls.update();
      return;
    }

    camera.lookAt(worldTarget);
  };

  const seekToTime = (targetTimeSec: number) => {
    const dataset = getActiveDataset();
    const maxTimeSec = getTimelineMaxSec();
    const clampedTargetTimeSec = clamp(targetTimeSec, 0, maxTimeSec);
    const observationDurationSec = getObservationDurationSec();
    const historyState: HistoryState = {
      measurementSeparation: [],
      estimateSeparation: [],
      innovation: [],
      sigmaEnvelope: [],
    };

    resetTrail();
    latestMeasurementRef.current = null;
    latestMeasurementVelocityRef.current = null;
    latestReferenceRef.current = null;
    latestReferenceVelocityRef.current = null;
    latestCovarianceDiagRef.current = null;
    frameCounterRef.current = 0;
    uploadFinishedRef.current = clampedTargetTimeSec >= maxTimeSec - 1e-9;

    if (!dataset) {
      filterRef.current = null;
      simulatedPlaybackRef.current = null;
      uploadedPlaybackRef.current = null;
      measurementTrackRef.current = [];
      estimateTrackRef.current = [];
      referenceTrackRef.current = [];
      setHistory(historyState);
      setOrbitTracks({
        measurement: [],
        estimate: [],
        reference: [],
      });
      setHud((previous) => ({
        ...previous,
        measurement: null,
        measurementVelocity: null,
        reference: null,
        referenceVelocity: null,
        covarianceDiagKm2: null,
        sampleCount: 0,
        streamTimeSec: 0,
        progress: 0,
      }));
      return;
    }

    const filter = buildFreshFilter();
    filterRef.current = filter;

    const replayCutoffSec = Math.min(clampedTargetTimeSec, observationDurationSec);
    const replaySamples = dataset.samples.filter(
      (sample) => sample.timeSec <= replayCutoffSec + 1e-9,
    );

    let previousTimeSec = 0;
    let latestInnovationNormKm = 0;
    let latestNis = 0;
    let latestObservedSample: GnssLogSample | null = null;
    const observedEstimateTrack: Vector3Km[] = [];

    for (const sample of replaySamples) {
      const dtSec = sample.timeSec - previousTimeSec;
      if (dtSec > 0) {
        filter.predictOrbit(dtSec);
      }

      const correction = filter.correctOrbitWithMeasurement(
        sample.positionKm,
        calibrationBiasKm,
        getScaledMeasurementNoise(sample),
      );

      const estimate = filter.getBestEstimate();
      const estimatePosition: Vector3Km = [
        estimate.positionX,
        estimate.positionY,
        estimate.positionZ,
      ];

      latestMeasurementRef.current = sample.positionKm;
      latestMeasurementVelocityRef.current = sample.velocityKmPerSec ?? null;
      latestCovarianceDiagRef.current = sample.measurementCovarianceKm2
        ? covarianceDiagonalFromMatrix(sample.measurementCovarianceKm2)
        : sample.measurementSigmaKm
          ? covarianceDiagonalFromMatrix(
              buildDiagonalCovariance(sample.measurementSigmaKm),
            )
          : covarianceDiagonalFromMatrix(
              buildDiagonalCovariance(measurementSigmaKm),
            );

      const measurementSeparationKm = sample.referencePositionKm
        ? distance3(sample.positionKm, sample.referencePositionKm)
        : distance3(sample.positionKm, estimatePosition);
      const estimateSeparationKm = sample.referencePositionKm
        ? distance3(estimatePosition, sample.referencePositionKm)
        : correction.innovationNormKm;
      const threeSigmaKm = filter.getPositionThreeSigmaKm();

      historyState.measurementSeparation = pushHistory(
        historyState.measurementSeparation,
        measurementSeparationKm,
      );
      historyState.estimateSeparation = pushHistory(
        historyState.estimateSeparation,
        estimateSeparationKm,
      );
      historyState.innovation = pushHistory(
        historyState.innovation,
        correction.innovationNormKm,
      );
      historyState.sigmaEnvelope = pushHistory(
        historyState.sigmaEnvelope,
        threeSigmaKm,
      );

      appendEstimateToTrail(estimatePosition);
      observedEstimateTrack.push(estimatePosition);
      latestInnovationNormKm = correction.innovationNormKm;
      latestNis = correction.normalizedInnovationSquared;
      latestObservedSample = sample;
      previousTimeSec = sample.timeSec;
    }

    const remainingPredictionSec = clampedTargetTimeSec - previousTimeSec;
    if (remainingPredictionSec > 0) {
      filter.predictOrbit(remainingPredictionSec);
    }

    const estimate = filter.getBestEstimate();
    const estimateState = toCartesianState(
      [estimate.positionX, estimate.positionY, estimate.positionZ],
      [estimate.velocityX, estimate.velocityY, estimate.velocityZ],
    );
    const estimatePosition = toPositionVector(estimateState);
    const referenceState = dataset.hasReference
      ? getReferenceStateAtTime(dataset, clampedTargetTimeSec)
      : null;
    const inPredictionPhase = clampedTargetTimeSec > observationDurationSec + 1e-9;

    if (inPredictionPhase) {
      latestMeasurementRef.current = null;
      latestMeasurementVelocityRef.current = null;
      latestCovarianceDiagRef.current = null;
    }

    latestReferenceRef.current = referenceState ? toPositionVector(referenceState) : null;
    latestReferenceVelocityRef.current = referenceState
      ? toVelocityVector(referenceState)
      : null;

    measurementTrackRef.current = dataset.samples.map((sample) => sample.positionKm);
    referenceTrackRef.current = buildReferenceTrack(dataset, maxTimeSec);
    estimateTrackRef.current = observedEstimateTrack;

    const displayedEstimateTrack = buildDisplayedEstimateTrack(
      observedEstimateTrack,
      estimateState,
      clampedTargetTimeSec,
      maxTimeSec,
    );

    const playback = new UploadedGnssPlayback(dataset);
    playback.advance(clampedTargetTimeSec);
    if (sourceMode === "sim") {
      simulatedPlaybackRef.current = playback;
      uploadedPlaybackRef.current = null;
    } else {
      uploadedPlaybackRef.current = playback;
      simulatedPlaybackRef.current = null;
    }

    appendEstimateToTrail(estimatePosition);
    setHistory(historyState);
    setOrbitTracks({
      measurement: downsampleTrack(measurementTrackRef.current),
      estimate: downsampleTrack(displayedEstimateTrack),
      reference: downsampleTrack(referenceTrackRef.current),
    });
    setHud((previous) => ({
      ...previous,
      sourceMode,
      sourceLabel:
        sourceMode === "sim"
          ? "Simulated GNSS sample array"
          : "Uploaded GNSS sample array",
      datasetLabel:
        sourceMode === "sim"
          ? selectedChip.description
          : dataset.name,
      chipLabel: selectedChip.label,
      sampleTimeLabel:
        inPredictionPhase && latestObservedSample
          ? formatPredictedTimeLabel(
              latestObservedSample.sampleTimeLabel ??
                formatMissionTimeLabel(observationDurationSec),
              clampedTargetTimeSec - observationDurationSec,
            )
          : latestObservedSample?.sampleTimeLabel ??
            formatMissionTimeLabel(clampedTargetTimeSec),
      measurement: latestMeasurementRef.current,
      measurementVelocity: latestMeasurementVelocityRef.current,
      estimate: estimatePosition,
      reference: latestReferenceRef.current,
      referenceVelocity: latestReferenceVelocityRef.current,
      covarianceDiagKm2: latestCovarianceDiagRef.current,
      measurementSeparationKm:
        historyState.measurementSeparation[historyState.measurementSeparation.length - 1] ?? 0,
      estimateSeparationKm:
        latestReferenceRef.current
          ? distance3(estimatePosition, latestReferenceRef.current)
          : historyState.estimateSeparation[historyState.estimateSeparation.length - 1] ?? 0,
      innovationNormKm: latestInnovationNormKm,
      threeSigmaKm:
        filter.getPositionThreeSigmaKm(),
      normalizedInnovationSquared: latestNis,
      sampleCount: replaySamples.length,
      streamTimeSec: clampedTargetTimeSec,
      cadenceSec: dataset.cadenceSec,
      progress:
        maxTimeSec > 0 ? clampedTargetTimeSec / maxTimeSec : 0,
      inBlackout: blackout,
    }));
  };

  const logEvent = (type: "INFO" | "ALERT", message: string) => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((previous) =>
      [...previous, { time, type, message }].slice(-24),
    );
  };

  const addNotification = (message: string, type: "alert" | "info") => {
    const currentPosition = filterMeshRef.current?.position.toArray() as
      | [number, number, number]
      | undefined;

    if (!currentPosition) {
      return;
    }

    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotifications((previous) => [
      ...previous,
      { id, pos: currentPosition, message, type },
    ]);
  };

  const resetTrail = () => {
    trailPos.fill(0);
    if (trailLineRef.current) {
      trailLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  };

  const resetSession = (
    nextManeuverEvents: ManeuverEvent[] = maneuverEvents,
    targetTimeSec = 0,
  ) => {
    resetTrail();
    setTimeMultiplier(1);
    latestMeasurementRef.current = null;
    latestMeasurementVelocityRef.current = null;
    latestReferenceRef.current = null;
    latestReferenceVelocityRef.current = null;
    latestCovarianceDiagRef.current = null;
    simulatedSamplesRef.current = [];
    simulatedDatasetRef.current = null;
    simulatedPlaybackRef.current = null;
    uploadedPlaybackRef.current = null;
    estimateTrackRef.current = [];
    measurementTrackRef.current = [];
    referenceTrackRef.current = [];
    setOrbitTracks({
      measurement: [],
      estimate: [],
      reference: [],
    });
    frameCounterRef.current = 0;
    uploadFinishedRef.current = false;
    resyncClockRef.current = true;

    if (sourceMode === "upload" && !uploadedDataset) {
      filterRef.current = null;
      setHud((previous) => ({
        ...previous,
        sourceMode,
        sourceLabel: "Uploaded GNSS sample array",
        datasetLabel: "No dataset loaded",
        chipLabel: selectedChip.label,
        sampleTimeLabel: "Awaiting file",
        measurement: null,
        measurementVelocity: null,
        estimate: EMPTY_ESTIMATE,
        reference: null,
        referenceVelocity: null,
        covarianceDiagKm2: null,
        sampleCount: 0,
        streamTimeSec: 0,
        progress: 0,
        inBlackout: blackout,
      }));
      return;
    }

    if (sourceMode === "sim") {
      const dataset = buildSimulatedDataset(selectedChip, nextManeuverEvents);
      simulatedDatasetRef.current = dataset;
      simulatedSamplesRef.current = dataset.samples;
      logEvent("INFO", `GNSS sample array armed with ${selectedChip.label}.`);
    } else if (uploadedDataset) {
      simulatedDatasetRef.current = null;
      logEvent("INFO", `Loaded GNSS sample array ${uploadedDataset.name}.`);
    }

    seekToTime(targetTimeSec);
  };

  useEffect(() => {
    if (!selectedChip) {
      return;
    }

    resetSession();
    lastElapsedRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode, uploadedDataset, selectedChipId]);

  useEffect(() => {
    if (!chipProfiles.some((profile) => profile.id === selectedChipId) && chipProfiles[0]) {
      setSelectedChipId(chipProfiles[0].id);
    }
  }, [chipProfiles, selectedChipId]);

  const handleResetClick = () => {
    setManeuverEvents([]);
    resetSession([], 0);
    addNotification("SESSION RESET", "info");
  };

  const handleManeuver = () => {
    if (sourceMode !== "sim") {
      return;
    }

    const maneuverTimeSec = clamp(hud.streamTimeSec, 0, getObservationDurationSec());
    const nextEvents = [
      ...maneuverEvents,
      {
        timeSec: maneuverTimeSec,
        deltaVxKmPerSec: 0.05,
        deltaVyKmPerSec: 0.1,
      },
    ];
    setManeuverEvents(nextEvents);
    simulatedDatasetRef.current = buildSimulatedDataset(selectedChip, nextEvents);
    simulatedSamplesRef.current = simulatedDatasetRef.current.samples;
    seekToTime(hud.streamTimeSec);
    const totalDeltaV = nextEvents
      .reduce(
        (sum, event) => sum + Math.hypot(event.deltaVxKmPerSec, event.deltaVyKmPerSec),
        0,
      )
      .toFixed(3);
    addNotification(`DV ${totalDeltaV} km/s`, "info");
    logEvent("INFO", `Truth ephemeris received maneuver. Total dV ${totalDeltaV} km/s.`);
  };

  const handleBlackoutToggle = () => {
    const nextValue = !blackout;
    setBlackout(nextValue);
    addNotification(nextValue ? "GNSS HOLD" : "GNSS RESTORED", nextValue ? "alert" : "info");
    logEvent(nextValue ? "ALERT" : "INFO", nextValue ? "Measurement updates paused." : "Measurement updates restored.");
  };

  const handleSourceFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const dataset = await readDatasetFile(file);
      setUploadedDataset(dataset);
      setSourceMode("upload");
      setPaused(false);
      setBlackout(false);
      addNotification("GNSS LOG LOADED", "info");
      logEvent("INFO", `Imported GNSS sample array ${file.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load GNSS file.";
      logEvent("ALERT", message);
    }
  };

  const handleProfileFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const importedProfiles = parseChipProfiles(await file.text());
      setChipProfiles((previous) => mergeChipProfiles(previous, importedProfiles));
      addNotification("BIAS LIBRARY UPDATED", "info");
      logEvent("INFO", `Imported ${importedProfiles.length} chip bias template(s).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import chip profiles.";
      logEvent("ALERT", message);
    }
  };

  const handleExportSimulation = () => {
    const simulatedDataset = simulatedDatasetRef.current;

    if (!simulatedDataset || simulatedSamplesRef.current.length === 0) {
      logEvent("ALERT", "No simulated GNSS samples available to export yet.");
      return;
    }

    const exportPayload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        source: "simulated-gnss-array",
        chipProfile: selectedChip,
        appliedBiasKm: calibrationBiasKm,
        appliedMeasurementSigmaKm: measurementSigmaKm,
        observationDurationSec: simulatedDataset.totalDurationSec,
        predictionHorizonSec: PROPAGATION_HORIZON_SEC,
      },
      samples: simulatedSamplesRef.current,
      referenceEphemeris: buildReferenceEphemeris(
        simulatedDataset,
        simulatedDataset.totalDurationSec + PROPAGATION_HORIZON_SEC,
      ),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `simulated-gnss-array-${selectedChip.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    addNotification("SIM ARRAY EXPORTED", "info");
    logEvent(
      "INFO",
      `Exported ${simulatedSamplesRef.current.length} simulated GNSS samples with clean ephemeris.`,
    );
  };

  const handleTimelineChange = (targetTimeSec: number) => {
    setPaused(true);
    seekToTime(targetTimeSec);
    resyncClockRef.current = true;
  };

  useFrame((state) => {
    if (resyncClockRef.current) {
      lastElapsedRef.current = state.clock.elapsedTime;
      resyncClockRef.current = false;
      return;
    }

    const rawFrameDt = state.clock.elapsedTime - lastElapsedRef.current;
    lastElapsedRef.current = state.clock.elapsedTime;

    if (rawFrameDt <= 0 || paused) {
      return;
    }

    const frameDtSec = clamp(rawFrameDt * timeMultiplier, 0, 5);
    const filter = filterRef.current;
    const dataset = getActiveDataset();

    if (!filter || !dataset) {
      return;
    }

    const playback =
      sourceMode === "sim" ? simulatedPlaybackRef.current : uploadedPlaybackRef.current;

    if (!playback) {
      return;
    }

    const observationDurationSec = getObservationDurationSec();
    const totalTimelineSec = getTimelineMaxSec();
    filter.tuneFilter(tuning.processAccelExponent, measurementSigmaKm);

    let innovationNormKm = hud.innovationNormKm;
    let normalizedInnovationSquared = hud.normalizedInnovationSquared;
    let sampleCount = hud.sampleCount;
    const streamTimeSec = clamp(hud.streamTimeSec + frameDtSec, 0, totalTimelineSec);
    const cadenceSec = dataset.cadenceSec || hud.cadenceSec || frameDtSec;
    let modelTimeSec = hud.streamTimeSec;
    const effectiveDtSec = Math.max(streamTimeSec - hud.streamTimeSec, 0);
    const newSamples = playback.advance(effectiveDtSec);

    if (measurementTrackRef.current.length === 0) {
      measurementTrackRef.current = dataset.samples.map((sample) => sample.positionKm);
    }
    if (referenceTrackRef.current.length === 0) {
      referenceTrackRef.current = buildReferenceTrack(dataset, totalTimelineSec);
    }

    for (const sample of newSamples) {
      const dtToSampleSec = sample.timeSec - modelTimeSec;

      if (dtToSampleSec > 0) {
        filter.predictOrbit(dtToSampleSec);
      }

      modelTimeSec = sample.timeSec;
      latestMeasurementRef.current = sample.positionKm;
      latestMeasurementVelocityRef.current = sample.velocityKmPerSec ?? null;
      latestCovarianceDiagRef.current = sample.measurementCovarianceKm2
        ? covarianceDiagonalFromMatrix(sample.measurementCovarianceKm2)
        : sample.measurementSigmaKm
          ? covarianceDiagonalFromMatrix(
              buildDiagonalCovariance(sample.measurementSigmaKm),
            )
          : covarianceDiagonalFromMatrix(buildDiagonalCovariance(measurementSigmaKm));

      if (!blackout) {
        const correction = filter.correctOrbitWithMeasurement(
          sample.positionKm,
          calibrationBiasKm,
          getScaledMeasurementNoise(sample),
        );
        innovationNormKm = correction.innovationNormKm;
        normalizedInnovationSquared = correction.normalizedInnovationSquared;
      }

      const estimateAtSample = filter.getBestEstimate();
      estimateTrackRef.current.push([
        estimateAtSample.positionX,
        estimateAtSample.positionY,
        estimateAtSample.positionZ,
      ]);
    }

    const remainingPredictionSec = streamTimeSec - modelTimeSec;
    if (remainingPredictionSec > 0) {
      filter.predictOrbit(remainingPredictionSec);
    }

    sampleCount = playback.sampleCount;

    const estimate = filter.getBestEstimate();
    const estimateState = toCartesianState(
      [estimate.positionX, estimate.positionY, estimate.positionZ],
      [estimate.velocityX, estimate.velocityY, estimate.velocityZ],
    );
    const estimatePosition = toPositionVector(estimateState);
    const currentSample = playback.getCurrentSample();
    const inPredictionPhase = streamTimeSec > observationDurationSec + 1e-9;

    if (inPredictionPhase) {
      latestMeasurementRef.current = null;
      latestMeasurementVelocityRef.current = null;
      latestCovarianceDiagRef.current = null;
    }

    const referenceState = dataset.hasReference
      ? getReferenceStateAtTime(dataset, streamTimeSec)
      : null;
    latestReferenceRef.current = referenceState ? toPositionVector(referenceState) : null;
    latestReferenceVelocityRef.current = referenceState
      ? toVelocityVector(referenceState)
      : null;

    const activeMeasurement = latestMeasurementRef.current;
    const activeMeasurementVelocity = latestMeasurementVelocityRef.current;
    const activeReference = latestReferenceRef.current;
    const activeReferenceVelocity = latestReferenceVelocityRef.current;
    const activeCovarianceDiag = latestCovarianceDiagRef.current;

    if (filterMeshRef.current) {
      filterMeshRef.current.position.set(
        estimate.positionX / 100,
        estimate.positionY / 100,
        estimate.positionZ / 100,
      );
    }

    for (let idx = 0; idx < trailPointCount - 1; idx++) {
      trailPos[idx * 3] = trailPos[(idx + 1) * 3];
      trailPos[idx * 3 + 1] = trailPos[(idx + 1) * 3 + 1];
      trailPos[idx * 3 + 2] = trailPos[(idx + 1) * 3 + 2];
    }
    const trailIdx = (trailPointCount - 1) * 3;
    trailPos[trailIdx] = estimate.positionX / 100;
    trailPos[trailIdx + 1] = estimate.positionY / 100;
    trailPos[trailIdx + 2] = estimate.positionZ / 100;
    if (trailLineRef.current) {
      trailLineRef.current.geometry.attributes.position.needsUpdate = true;
    }

    frameCounterRef.current += 1;
    if (frameCounterRef.current % hudUpdateStep !== 0) {
      return;
    }

    const measurementSeparationKm =
      activeMeasurement && activeReference
        ? distance3(activeMeasurement, activeReference)
        : activeMeasurement
          ? distance3(activeMeasurement, estimatePosition)
          : hud.measurementSeparationKm;

    const estimateSeparationKm = activeReference
      ? distance3(estimatePosition, activeReference)
      : innovationNormKm;

    const threeSigmaKm = filter.getPositionThreeSigmaKm();
    const displayedEstimateTrack = buildDisplayedEstimateTrack(
      estimateTrackRef.current,
      estimateState,
      streamTimeSec,
      totalTimelineSec,
    );
    const progress =
      totalTimelineSec > 0 ? clamp(streamTimeSec / totalTimelineSec, 0, 1) : 0;

    if (streamTimeSec >= totalTimelineSec - 1e-9 && !uploadFinishedRef.current) {
      uploadFinishedRef.current = true;
      startTransition(() => setPaused(true));
      addNotification("PLAYBACK COMPLETE", "info");
      logEvent("INFO", "OD playback reached the 3-day prediction horizon.");
    }

    startTransition(() => {
      setOrbitTracks({
        measurement: downsampleTrack(measurementTrackRef.current),
        estimate: downsampleTrack(displayedEstimateTrack),
        reference: downsampleTrack(referenceTrackRef.current),
      });
      setHud({
        sourceMode,
        sourceLabel:
          sourceMode === "sim"
            ? "Simulated GNSS sample array"
            : "Uploaded GNSS sample array",
        datasetLabel:
          sourceMode === "sim"
            ? selectedChip.description
            : dataset.name,
        chipLabel: selectedChip.label,
        sampleTimeLabel:
          inPredictionPhase && currentSample
            ? formatPredictedTimeLabel(
                currentSample.sampleTimeLabel ??
                  formatMissionTimeLabel(observationDurationSec),
                streamTimeSec - observationDurationSec,
              )
            : currentSample?.sampleTimeLabel ?? formatMissionTimeLabel(streamTimeSec),
        measurement: activeMeasurement,
        measurementVelocity: activeMeasurementVelocity,
        estimate: estimatePosition,
        reference: activeReference,
        referenceVelocity: activeReferenceVelocity,
        covarianceDiagKm2: activeCovarianceDiag,
        measurementSeparationKm,
        estimateSeparationKm,
        innovationNormKm,
        threeSigmaKm,
        normalizedInnovationSquared,
        sampleCount,
        streamTimeSec,
        cadenceSec,
        progress,
        inBlackout: blackout,
      });

      setHistory((previous) => ({
        measurementSeparation:
          activeMeasurement
            ? pushHistory(previous.measurementSeparation, measurementSeparationKm)
            : previous.measurementSeparation,
        estimateSeparation: pushHistory(
          previous.estimateSeparation,
          estimateSeparationKm,
        ),
        innovation:
          newSamples.length > 0 && !blackout
            ? pushHistory(previous.innovation, innovationNormKm)
            : previous.innovation,
        sigmaEnvelope: pushHistory(previous.sigmaEnvelope, threeSigmaKm),
      }));
    });
  });

  const measurementLabel = hud.reference
    ? "GNSS separation vs clean ephemeris (km)"
    : "GNSS separation vs propagated estimate (km)";
  const estimateLabel = hud.reference
    ? "EKF separation vs clean ephemeris (km)"
    : "Innovation norm (km)";
  const scopeLabel = hud.reference
    ? "NOISY GNSS VS CLEAN EPHEMERIS"
    : "NOISY GNSS VS FILTER EPHEMERIS";
  const observationDurationSec = getObservationDurationSec();
  const playbackPhaseLabel =
    hud.streamTimeSec <= observationDurationSec + 1e-9
      ? "GNSS ingest"
      : "Post-fit propagation";

  return (
    <group>
      <OrbitTrackLine
        points={orbitTracks.reference}
        color={odCanvasColorFallbacks.reference}
        opacity={0.42}
      />
      <OrbitTrackLine
        points={orbitTracks.measurement}
        color={odCanvasColorFallbacks.danger}
        opacity={0.38}
      />
      <OrbitTrackLine
        points={orbitTracks.estimate}
        color={odCanvasColorFallbacks.accent}
        opacity={0.76}
      />

      <mesh ref={filterMeshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={odCanvasColorFallbacks.accent} />
      </mesh>

      <line ref={trailLineRef as never}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPos, 3]}
            count={trailPointCount}
            array={trailPos}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={odCanvasColorFallbacks.accent} transparent opacity={0.68} />
      </line>

      {notifications.map((notification) => (
        <SpatialNotification
          key={notification.id}
          position={notification.pos}
          message={notification.message}
          type={notification.type}
          onComplete={() =>
            setNotifications((previous) =>
              previous.filter((entry) => entry.id !== notification.id),
            )
          }
        />
      ))}

      <Html fullscreen style={{ pointerEvents: "auto", zIndex: 10 }}>
        <div
          style={{
            position: "absolute",
            inset: 18,
            display: "grid",
            gridTemplateColumns: "minmax(320px, 380px) minmax(320px, 460px)",
            justifyContent: "space-between",
            gap: 18,
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <HudPanel
              title="GNSS INGEST"
              subtitle="Work from a GNSS sample array. Each row is a point-in-time sample with position, optional velocity, and covariance."
            >
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="type-label"
                  type="button"
                  onClick={() => {
                    setSourceMode("sim");
                    setPaused(false);
                  }}
                  style={{
                    flex: 1,
                    border: `1px solid ${odColorTokens.border}`,
                    background: sourceMode === "sim" ? odColorTokens.accent : "transparent",
                    color: sourceMode === "sim" ? odColorTokens.textContrast : odColorTokens.text,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  Simulated array
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={() => setSourceMode("upload")}
                  style={{
                    flex: 1,
                    border: `1px solid ${odColorTokens.border}`,
                    background: sourceMode === "upload" ? odColorTokens.accent : "transparent",
                    color: sourceMode === "upload" ? odColorTokens.textContrast : odColorTokens.text,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  Upload GNSS array
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <label
                  className="type-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    color: odColorTokens.textMuted,
                  }}
                >
                  <span>GNSS measurement log</span>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleSourceFile}
                    className="type-text"
                  />
                </label>

                <label
                  className="type-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    color: odColorTokens.textMuted,
                  }}
                >
                  <span>Import chip bias library</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleProfileFile}
                    className="type-text"
                  />
                </label>
              </div>

              <div
                className="type-text"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  color: odColorTokens.textMuted,
                }}
              >
                <div>
                  <div className="type-label" style={{ marginBottom: 4, color: odColorTokens.textSubtle }}>
                    Current source
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.sourceLabel}
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ marginBottom: 4, color: odColorTokens.textSubtle }}>
                    Dataset
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.datasetLabel}
                  </div>
                </div>
              </div>

              <div
                className="type-text"
                style={{
                  color: odColorTokens.textSubtle,
                }}
              >
                Upload format: `time_s,x_km,y_km,z_km` with optional
                `vx_km_s,vy_km_s,vz_km_s,ref_x_km,ref_y_km,ref_z_km,sigma_x_km,sigma_y_km,sigma_z_km,cov_xx,cov_xy,cov_xz,cov_yy,cov_yz,cov_zz`.
                JSON upload also accepts the exported `samples` structure directly.
              </div>
            </HudPanel>

            <HudPanel
              title="RECEIVER BIAS TEMPLATE"
              subtitle="Bias is pre-determined, but the library is importable so new chips can be added without changing the OD code."
            >
              <label
                className="type-text"
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span className="type-label" style={{ color: odColorTokens.textMuted }}>
                  Known receiver
                </span>
                <select
                  className="type-text"
                  value={selectedChip.id}
                  onChange={(event) => setSelectedChipId(event.target.value)}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: odColorTokens.panelMuted,
                    color: odColorTokens.text,
                    padding: "8px 10px",
                  }}
                >
                  {chipProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="type-text" style={{ color: odColorTokens.textMuted }}>
                {selectedChip.description}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <MetricCard
                  label="Template bias (km)"
                  value={formatVector(selectedChip.biasKm, 2)}
                  accent={odColorTokens.accentSoft}
                />
                <MetricCard
                  label="Template sigma (km)"
                  value={formatVector(selectedChip.noiseSigmaKm, 2)}
                  accent={odColorTokens.warn}
                />
              </div>
            </HudPanel>

            <HudPanel
              title="EKF TUNING"
              subtitle="Tune a real covariance model: receiver sigma scales R and white-acceleration noise drives the discrete Q matrix."
            >
              <div>
                <div
                  className="type-text"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: odColorTokens.textMuted,
                    marginBottom: 6,
                  }}
                >
                  <span>Process accel sigma</span>
                  <span>10^{tuning.processAccelExponent} km/s^2</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="-4"
                  step="1"
                  value={tuning.processAccelExponent}
                  onChange={(event) =>
                    setTuning((previous) => ({
                      ...previous,
                      processAccelExponent: Number(event.target.value),
                    }))
                  }
                  style={{ width: "100%", accentColor: odColorTokens.accent }}
                />
              </div>

              <div>
                <div
                  className="type-text"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: odColorTokens.textMuted,
                    marginBottom: 6,
                  }}
                >
                  <span>Measurement covariance scale</span>
                  <span>{tuning.measurementScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.05"
                  value={tuning.measurementScale}
                  onChange={(event) =>
                    setTuning((previous) => ({
                      ...previous,
                      measurementScale: Number(event.target.value),
                    }))
                  }
                  style={{ width: "100%", accentColor: odColorTokens.warn }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <label
                  className="type-text"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span className="type-label" style={{ color: odColorTokens.textMuted }}>
                    Bias trim X (km)
                  </span>
                  <input
                    className="type-text"
                    type="number"
                    step="0.05"
                    value={tuning.biasTrimX}
                    onChange={(event) =>
                      setTuning((previous) => ({
                        ...previous,
                        biasTrimX: Number(event.target.value),
                      }))
                    }
                    style={{
                      border: `1px solid ${odColorTokens.border}`,
                      background: odColorTokens.panelMuted,
                      color: odColorTokens.text,
                      padding: "8px 10px",
                    }}
                  />
                </label>
                <label
                  className="type-text"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span className="type-label" style={{ color: odColorTokens.textMuted }}>
                    Bias trim Y (km)
                  </span>
                  <input
                    className="type-text"
                    type="number"
                    step="0.05"
                    value={tuning.biasTrimY}
                    onChange={(event) =>
                      setTuning((previous) => ({
                        ...previous,
                        biasTrimY: Number(event.target.value),
                      }))
                    }
                    style={{
                      border: `1px solid ${odColorTokens.border}`,
                      background: odColorTokens.panelMuted,
                      color: odColorTokens.text,
                      padding: "8px 10px",
                    }}
                  />
                </label>
                <label
                  className="type-text"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span className="type-label" style={{ color: odColorTokens.textMuted }}>
                    Bias trim Z (km)
                  </span>
                  <input
                    className="type-text"
                    type="number"
                    step="0.05"
                    value={tuning.biasTrimZ}
                    onChange={(event) =>
                      setTuning((previous) => ({
                        ...previous,
                        biasTrimZ: Number(event.target.value),
                      }))
                    }
                    style={{
                      border: `1px solid ${odColorTokens.border}`,
                      background: odColorTokens.panelMuted,
                      color: odColorTokens.text,
                      padding: "8px 10px",
                    }}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <MetricCard
                  label="Applied bias (km)"
                  value={formatVector(calibrationBiasKm, 2)}
                  accent={odColorTokens.accentSoft}
                />
                <MetricCard
                  label="Applied sigma (km)"
                  value={formatVector(measurementSigmaKm, 2)}
                  accent={odColorTokens.warn}
                />
              </div>
            </HudPanel>

            <HudPanel title="OPERATIONS" subtitle="OD mode owns the screen: no work-switch bindings, no other satellites, and the camera is dedicated to orbit controls.">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <button
                  className="type-label"
                  type="button"
                  onClick={() => setPaused((previous) => !previous)}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: paused ? odColorTokens.warn : odColorTokens.accent,
                    color: odColorTokens.textContrast,
                    padding: "9px 10px",
                    cursor: "pointer",
                  }}
                >
                  {paused ? "Resume playback" : "Pause playback"}
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={handleResetClick}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: "transparent",
                    color: odColorTokens.text,
                    padding: "9px 10px",
                    cursor: "pointer",
                  }}
                >
                  Reset solution
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={handleBlackoutToggle}
                  style={{
                    border: `1px solid ${odColorTokens.borderDanger}`,
                    background: blackout ? odColorTokens.danger : "transparent",
                    color: blackout ? odColorTokens.textDangerContrast : odColorTokens.dangerSoft,
                    padding: "9px 10px",
                    cursor: "pointer",
                  }}
                >
                  {blackout ? "End GNSS hold" : "Start GNSS hold"}
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={handleManeuver}
                  disabled={sourceMode !== "sim"}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: sourceMode === "sim" ? "transparent" : odColorTokens.disabled,
                    color: sourceMode === "sim" ? odColorTokens.text : odColorTokens.textSubtle,
                    padding: "9px 10px",
                    cursor: sourceMode === "sim" ? "pointer" : "not-allowed",
                  }}
                >
                  Inject maneuver
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={handleExportSimulation}
                  disabled={sourceMode !== "sim"}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: sourceMode === "sim" ? "transparent" : odColorTokens.disabled,
                    color: sourceMode === "sim" ? odColorTokens.text : odColorTokens.textSubtle,
                    padding: "9px 10px",
                    cursor: sourceMode === "sim" ? "pointer" : "not-allowed",
                  }}
                >
                  Export sim array
                </button>
                <button
                  className="type-label"
                  type="button"
                  onClick={focusCameraOnSatellite}
                  style={{
                    border: `1px solid ${odColorTokens.border}`,
                    background: "transparent",
                    color: odColorTokens.text,
                    padding: "9px 10px",
                    cursor: "pointer",
                  }}
                >
                  Zoom to satellite
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {[1, 5, 10, 30, 60].map((multiplier) => (
                  <button
                    className="type-label"
                    key={multiplier}
                    type="button"
                    onClick={() => setTimeMultiplier(multiplier)}
                    style={{
                      flex: 1,
                      border: `1px solid ${odColorTokens.border}`,
                      background:
                        timeMultiplier === multiplier ? odColorTokens.accent : "transparent",
                      color:
                        timeMultiplier === multiplier ? odColorTokens.textContrast : odColorTokens.text,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>

              <div
                className="type-text"
                style={{
                  border: `1px solid ${odColorTokens.borderMuted}`,
                  background: odColorTokens.panelSoft,
                  padding: 10,
                  color: odColorTokens.textMuted,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  className="type-label"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Timeline</span>
                  <span>
                    {hud.streamTimeSec.toFixed(1)}s / {getTimelineMaxSec().toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(getTimelineMaxSec(), 0)}
                  step={Math.max(hud.cadenceSec || 0.1, 0.1)}
                  value={Math.min(hud.streamTimeSec, getTimelineMaxSec())}
                  onChange={(event) =>
                    handleTimelineChange(Number(event.target.value))
                  }
                  style={{ width: "100%", accentColor: odColorTokens.accent }}
                />
                <div>
                  Timeline is fixed: GNSS ingest runs from 0 to{" "}
                  {observationDurationSec.toFixed(1)} s, then the filtered
                  solution propagates forward for 3 days. GNSS stays on the
                  measured arc while the clean and post-filter tracks continue
                  into prediction.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {[5, 10, 25].map((rangeKm) => (
                  <button
                    className="type-label"
                    key={rangeKm}
                    type="button"
                    onClick={() => setScopeRangeKm(rangeKm)}
                    style={{
                      flex: 1,
                      border: `1px solid ${odColorTokens.border}`,
                      background: scopeRangeKm === rangeKm ? odColorTokens.accent : "transparent",
                      color: scopeRangeKm === rangeKm ? odColorTokens.textContrast : odColorTokens.text,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {rangeKm} km scope
                  </button>
                ))}
              </div>

              <button
                className="type-label"
                type="button"
                onClick={() => setOdModeEnabled(false)}
                style={{
                  border: `1px solid ${odColorTokens.border}`,
                  background: odColorTokens.lightSurface,
                  color: odColorTokens.textContrast,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                Exit OD mode
              </button>
            </HudPanel>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <HudPanel
              title="OD STATUS"
              subtitle="Readout is one point in time. During ingest it shows the current GNSS sample; after ingest it switches to propagated EKF and clean/reference states."
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                <MetricCard
                  label="GNSS vs clean"
                  value={`${hud.measurementSeparationKm.toFixed(3)} km`}
                  accent={odColorTokens.dangerSoft}
                />
                <MetricCard
                  label="EKF vs clean"
                  value={`${hud.estimateSeparationKm.toFixed(3)} km`}
                  accent={odColorTokens.accentSoft}
                />
                <MetricCard
                  label="3 sigma envelope"
                  value={`${hud.threeSigmaKm.toFixed(3)} km`}
                  accent={odColorTokens.warn}
                />
                <MetricCard
                  label="NIS"
                  value={hud.normalizedInnovationSquared.toFixed(2)}
                  accent={odColorTokens.success}
                />
              </div>

              <div
                className="type-text"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  color: odColorTokens.textMuted,
                }}
              >
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Current GNSS time
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.sampleTimeLabel}
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Measurement count
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.sampleCount}
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Cadence
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.cadenceSec.toFixed(2)} s
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Mission time
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.streamTimeSec.toFixed(1)} s
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Playback progress
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {(hud.progress * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="type-label" style={{ color: odColorTokens.textSubtle, marginBottom: 4 }}>
                    Current phase
                  </div>
                  <div className="type-text" style={{ color: odColorTokens.text }}>
                    {playbackPhaseLabel}
                  </div>
                </div>
              </div>

              <div
                className="type-text"
                style={{
                  border: `1px solid ${odColorTokens.borderMuted}`,
                  background: odColorTokens.panelSoft,
                  padding: 10,
                  color: odColorTokens.textMuted,
                }}
              >
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    Measurement (km):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.measurement
                      ? formatVector(hud.measurement, 2)
                      : playbackPhaseLabel === "Post-fit propagation"
                        ? "No GNSS sample in prediction arc"
                        : "Awaiting sample"}
                  </span>
                </div>
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    Measurement vel (km/s):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.measurementVelocity
                      ? formatVector(hud.measurementVelocity, 4)
                      : playbackPhaseLabel === "Post-fit propagation"
                        ? "No GNSS sample in prediction arc"
                        : "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    Measurement cov diag (km^2):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.covarianceDiagKm2
                      ? formatCovarianceDiagonal(hud.covarianceDiagKm2, 4)
                      : playbackPhaseLabel === "Post-fit propagation"
                        ? "No GNSS sample in prediction arc"
                        : "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    EKF estimate (km):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {formatVector(hud.estimate, 2)}
                  </span>
                </div>
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    Reference ephemeris (km):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.reference ? formatVector(hud.reference, 2) : "Not provided by file"}
                  </span>
                </div>
                <div>
                  <span className="type-label" style={{ color: odColorTokens.textSubtle }}>
                    Reference vel (km/s):{" "}
                  </span>
                  <span className="type-text" style={{ color: odColorTokens.text }}>
                    {hud.referenceVelocity
                      ? formatVector(hud.referenceVelocity, 4)
                      : "Not provided"}
                  </span>
                </div>
                <div
                  className="type-label"
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: 8,
                  }}
                >
                  <span style={{ color: odColorTokens.danger }}>GNSS track</span>
                  <span style={{ color: odColorTokens.accent }}>Post-filter to +3 days</span>
                  <span style={{ color: odColorTokens.reference }}>Clean/reference to +3 days</span>
                </div>
              </div>
            </HudPanel>

            <HudPanel title="SEPARATION PLAYBACK" subtitle="Primary chart: noisy GNSS separation from the clean propagated ephemeris. Secondary chart: how well the EKF is converging back onto it.">
              <TimeSeriesPlot
                data={history.measurementSeparation}
                label={measurementLabel}
                maxVal={Math.max(1, hud.measurementSeparationKm * 1.4, 5)}
                color={odCanvasColorFallbacks.danger}
              />
              <TimeSeriesPlot
                data={hud.reference ? history.estimateSeparation : history.innovation}
                label={estimateLabel}
                maxVal={Math.max(1, hud.estimateSeparationKm * 1.4, 5)}
                color={odCanvasColorFallbacks.accent}
              />
              <TimeSeriesPlot
                data={history.sigmaEnvelope}
                label="Position covariance 3 sigma (km)"
                maxVal={Math.max(1, hud.threeSigmaKm * 1.4, 5)}
                color={odCanvasColorFallbacks.warn}
              />
            </HudPanel>

            <HudPanel title="RESIDUAL SCOPE" subtitle="Top-down view of the noisy GNSS fix relative to the clean ephemeris.">
              <ResidualScope
                measured={hud.measurement}
                reference={hud.reference ?? hud.estimate}
                blackout={hud.inBlackout}
                maxRangeKm={scopeRangeKm}
                label={scopeLabel}
              />
            </HudPanel>
          </div>
        </div>

        <OperationsLog logs={logs} />
      </Html>
    </group>
  );
}

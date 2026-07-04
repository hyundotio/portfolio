import { ASTRO_CONSTANTS } from "./astro";

const MAX_PROPAGATION_STEP_SEC = 30;

export type Vector3Km = [number, number, number];

export interface CartesianState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

interface StateDerivative {
  dx: number;
  dy: number;
  dz: number;
  dvx: number;
  dvy: number;
  dvz: number;
}

export function magnitude3(vector: Vector3Km): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

export function distance3(a: Vector3Km, b: Vector3Km): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function getAtmosphericDensity(position: Vector3Km): number {
  const radiusKm = magnitude3(position);
  const altitudeKm = radiusKm - ASTRO_CONSTANTS.EARTH_RADIUS_KM;
  const densityAt700Km = 3.614e-13 * 1e9;
  const scaleHeightKm = 88.667;

  return densityAt700Km * Math.exp(-(altitudeKm - 700) / scaleHeightKm);
}

export function computeOrbitalAcceleration(state: CartesianState): Vector3Km {
  const { x, y, z, vx, vy, vz } = state;

  const radiusSquared = x * x + y * y + z * z;
  const radius = Math.sqrt(radiusSquared);
  const radiusCubed = radiusSquared * radius;
  const radiusFifth = radiusSquared * radiusCubed;

  const mu = ASTRO_CONSTANTS.EARTH_GRAVITY_PARAM;
  const j2 = ASTRO_CONSTANTS.J2_OBLATENESS;
  const re = ASTRO_CONSTANTS.EARTH_RADIUS_KM;

  const gravityScale = -mu / radiusCubed;
  const zSquared = z * z;
  const j2Coeff = (1.5 * j2 * mu * re * re) / radiusFifth;
  const j2Term = (5 * zSquared) / radiusSquared;

  const gravityX = x * gravityScale;
  const gravityY = y * gravityScale;
  const gravityZ = z * gravityScale;

  const j2X = j2Coeff * x * (j2Term - 1);
  const j2Y = j2Coeff * y * (j2Term - 1);
  const j2Z = j2Coeff * z * (j2Term - 3);

  const relVx = vx + ASTRO_CONSTANTS.EARTH_ROTATION_RATE * y;
  const relVy = vy - ASTRO_CONSTANTS.EARTH_ROTATION_RATE * x;
  const relVz = vz;
  const relativeSpeed = Math.hypot(relVx, relVy, relVz);
  const density = getAtmosphericDensity([x, y, z]);
  const dragScale =
    -0.5 * ASTRO_CONSTANTS.BALLISTIC_COEFF * density * relativeSpeed;

  return [
    gravityX + j2X + dragScale * relVx,
    gravityY + j2Y + dragScale * relVy,
    gravityZ + j2Z + dragScale * relVz,
  ];
}

function deriveCartesianState(state: CartesianState): StateDerivative {
  const [ax, ay, az] = computeOrbitalAcceleration(state);

  return {
    dx: state.vx,
    dy: state.vy,
    dz: state.vz,
    dvx: ax,
    dvy: ay,
    dvz: az,
  };
}

function addScaledState(
  state: CartesianState,
  derivative: StateDerivative,
  scale: number,
): CartesianState {
  return {
    x: state.x + derivative.dx * scale,
    y: state.y + derivative.dy * scale,
    z: state.z + derivative.dz * scale,
    vx: state.vx + derivative.dvx * scale,
    vy: state.vy + derivative.dvy * scale,
    vz: state.vz + derivative.dvz * scale,
  };
}

export function propagateCartesianState(
  state: CartesianState,
  dtSec: number,
): CartesianState {
  if (dtSec === 0) {
    return state;
  }

  const direction = Math.sign(dtSec) || 1;
  let remainingSec = Math.abs(dtSec);
  let currentState = state;

  while (remainingSec > 1e-9) {
    const stepSec = Math.min(remainingSec, MAX_PROPAGATION_STEP_SEC) * direction;
    const k1 = deriveCartesianState(currentState);
    const k2 = deriveCartesianState(addScaledState(currentState, k1, 0.5 * stepSec));
    const k3 = deriveCartesianState(addScaledState(currentState, k2, 0.5 * stepSec));
    const k4 = deriveCartesianState(addScaledState(currentState, k3, stepSec));

    currentState = {
      x:
        currentState.x +
        (stepSec / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
      y:
        currentState.y +
        (stepSec / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy),
      z:
        currentState.z +
        (stepSec / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz),
      vx:
        currentState.vx +
        (stepSec / 6) * (k1.dvx + 2 * k2.dvx + 2 * k3.dvx + k4.dvx),
      vy:
        currentState.vy +
        (stepSec / 6) * (k1.dvy + 2 * k2.dvy + 2 * k3.dvy + k4.dvy),
      vz:
        currentState.vz +
        (stepSec / 6) * (k1.dvz + 2 * k2.dvz + 2 * k3.dvz + k4.dvz),
    };

    remainingSec -= Math.abs(stepSec);
  }

  return currentState;
}

export function sampleGaussian(sigma: number): number {
  if (sigma <= 0) {
    return 0;
  }

  let u1 = 0;
  let u2 = 0;

  while (u1 === 0) {
    u1 = Math.random();
  }

  while (u2 === 0) {
    u2 = Math.random();
  }

  const mag = Math.sqrt(-2 * Math.log(u1));
  return sigma * mag * Math.cos(2 * Math.PI * u2);
}

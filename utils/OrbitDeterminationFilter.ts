import { ASTRO_CONSTANTS } from "./astro";
import { Matrix } from "./Matrix";
import { computeOrbitalAcceleration } from "./orbitDynamics";

const MAX_FILTER_PROPAGATION_STEP_SEC = 30;

type MeasurementSigmaInput =
  | number
  | [number, number, number]
  | number[]
  | Matrix;

interface OrbitDeterminationFilterOptions {
  positionSigmaKm?: number;
  velocitySigmaKmPerSec?: number;
  processAccelerationSigmaKmPerSec2?: number;
  measurementSigmaKm?: MeasurementSigmaInput;
}

export class OrbitDeterminationFilter {
  fullStateVector: Float64Array;
  errorCovarianceMatrix: Matrix;
  processNoiseMatrix: Matrix;
  sensorNoiseMatrix: Matrix;

  private processAccelerationSigmaKmPerSec2: number;
  private measurementSigmaKm: [number, number, number];

  constructor(
    initialStateXYZ_Vxyz: number[],
    options: OrbitDeterminationFilterOptions = {},
  ) {
    this.fullStateVector = new Float64Array(42);

    for (let i = 0; i < 6; i++) {
      this.fullStateVector[i] = initialStateXYZ_Vxyz[i];
      this.fullStateVector[6 + (i * 6 + i)] = 1.0;
    }

    const positionSigmaKm = options.positionSigmaKm ?? 5.0;
    const velocitySigmaKmPerSec = options.velocitySigmaKmPerSec ?? 0.5;

    this.errorCovarianceMatrix = Matrix.identity(6);
    for (let i = 0; i < 3; i++) {
      this.errorCovarianceMatrix.elements[i * 6 + i] =
        positionSigmaKm * positionSigmaKm;
      this.errorCovarianceMatrix.elements[(i + 3) * 6 + (i + 3)] =
        velocitySigmaKmPerSec * velocitySigmaKmPerSec;
    }

    this.processAccelerationSigmaKmPerSec2 =
      options.processAccelerationSigmaKmPerSec2 ?? 1e-7;
    this.processNoiseMatrix = new Matrix(6, 6);

    this.sensorNoiseMatrix = new Matrix(3, 3);
    this.measurementSigmaKm = [0.5, 0.5, 0.5];
    this.setMeasurementNoise(options.measurementSigmaKm ?? 0.5);
  }

  public tuneFilter(
    processAccelerationExponent: number,
    measurementSigmaKm: MeasurementSigmaInput,
  ) {
    this.processAccelerationSigmaKmPerSec2 = Math.pow(
      10,
      processAccelerationExponent,
    );
    this.setMeasurementNoise(measurementSigmaKm);
  }

  public getMeasurementSigmaKm(): [number, number, number] {
    return [...this.measurementSigmaKm];
  }

  public getPositionThreeSigmaKm(): number {
    const covariance = this.errorCovarianceMatrix.elements;
    const positionTrace =
      covariance[0] + covariance[7] + covariance[14];

    return 3 * Math.sqrt(Math.max(positionTrace, 0));
  }

  public predictOrbit(dt: number) {
    if (dt === 0) {
      return;
    }

    const direction = Math.sign(dt) || 1;
    let remainingSec = Math.abs(dt);

    while (remainingSec > 1e-9) {
      const stepSec =
        Math.min(remainingSec, MAX_FILTER_PROPAGATION_STEP_SEC) * direction;

      this.rk4Step(this.fullStateVector, stepSec);

      const phi = new Matrix(6, 6);
      for (let i = 0; i < 36; i++) {
        phi.elements[i] = this.fullStateVector[6 + i];
      }

      this.processNoiseMatrix = this.buildDiscreteProcessNoise(stepSec);
      this.errorCovarianceMatrix = this.symmetrize(
        phi.multiply(this.errorCovarianceMatrix)
          .multiply(phi.transpose())
          .add(this.processNoiseMatrix),
      );

      remainingSec -= Math.abs(stepSec);
    }
  }

  public correctOrbitWithMeasurement(
    measurementPositionKm: number[],
    biasKm: number[],
    measurementSigmaKm?: MeasurementSigmaInput,
  ) {
    if (measurementSigmaKm !== undefined) {
      this.setMeasurementNoise(measurementSigmaKm);
    }

    const measurementMatrix = new Matrix(3, 6);
    measurementMatrix.elements[0] = 1;
    measurementMatrix.elements[7] = 1;
    measurementMatrix.elements[14] = 1;

    const stateEstimate = new Matrix(6, 1);
    for (let i = 0; i < 6; i++) {
      stateEstimate.elements[i] = this.fullStateVector[i];
    }

    const measurement = Matrix.fromArray(
      [
        measurementPositionKm[0] - biasKm[0],
        measurementPositionKm[1] - biasKm[1],
        measurementPositionKm[2] - biasKm[2],
      ],
      3,
      1,
    );

    const innovation = measurement.subtract(
      measurementMatrix.multiply(stateEstimate),
    );
    const innovationNormKm = Math.hypot(
      innovation.elements[0],
      innovation.elements[1],
      innovation.elements[2],
    );

    const priorCovariance = this.errorCovarianceMatrix;
    const pHt = priorCovariance.multiply(measurementMatrix.transpose());
    const innovationCovariance = measurementMatrix
      .multiply(pHt)
      .add(this.sensorNoiseMatrix);
    const innovationCovarianceInverse = innovationCovariance.inverse();
    const kalmanGain = pHt.multiply(innovationCovarianceInverse);

    const correction = kalmanGain.multiply(innovation);
    for (let i = 0; i < 6; i++) {
      this.fullStateVector[i] += correction.elements[i];
    }

    const identity = Matrix.identity(6);
    const residualProjector = identity.subtract(
      kalmanGain.multiply(measurementMatrix),
    );

    this.errorCovarianceMatrix = this.symmetrize(
      residualProjector
        .multiply(priorCovariance)
        .multiply(residualProjector.transpose())
        .add(
          kalmanGain
            .multiply(this.sensorNoiseMatrix)
            .multiply(kalmanGain.transpose()),
        ),
    );

    const innovationWeighted =
      innovationCovarianceInverse.multiply(innovation);
    const normalizedInnovationSquared =
      innovation.elements[0] * innovationWeighted.elements[0] +
      innovation.elements[1] * innovationWeighted.elements[1] +
      innovation.elements[2] * innovationWeighted.elements[2];

    for (let i = 0; i < 36; i++) {
      this.fullStateVector[6 + i] = i % 7 === 0 ? 1.0 : 0.0;
    }

    return {
      innovationNormKm,
      normalizedInnovationSquared,
    };
  }

  public getBestEstimate() {
    return {
      positionX: this.fullStateVector[0],
      positionY: this.fullStateVector[1],
      positionZ: this.fullStateVector[2],
      velocityX: this.fullStateVector[3],
      velocityY: this.fullStateVector[4],
      velocityZ: this.fullStateVector[5],
    };
  }

  private setMeasurementNoise(measurementSigmaKm: MeasurementSigmaInput) {
    if (measurementSigmaKm instanceof Matrix) {
      this.sensorNoiseMatrix = new Matrix(3, 3);
      this.sensorNoiseMatrix.elements.set(measurementSigmaKm.elements);
      this.measurementSigmaKm = [
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[0], 0)),
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[4], 0)),
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[8], 0)),
      ];
      return;
    }

    if (Array.isArray(measurementSigmaKm) && measurementSigmaKm.length === 9) {
      this.sensorNoiseMatrix = Matrix.fromArray(measurementSigmaKm, 3, 3);
      this.measurementSigmaKm = [
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[0], 0)),
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[4], 0)),
        Math.sqrt(Math.max(this.sensorNoiseMatrix.elements[8], 0)),
      ];
      return;
    }

    const sigmas = Array.isArray(measurementSigmaKm)
      ? measurementSigmaKm
      : [measurementSigmaKm, measurementSigmaKm, measurementSigmaKm];

    this.measurementSigmaKm = [sigmas[0], sigmas[1], sigmas[2]];
    this.sensorNoiseMatrix = new Matrix(3, 3);

    for (let i = 0; i < 3; i++) {
      this.sensorNoiseMatrix.elements[i * 3 + i] =
        this.measurementSigmaKm[i] * this.measurementSigmaKm[i];
    }
  }

  private buildDiscreteProcessNoise(dt: number): Matrix {
    const sigma2 =
      this.processAccelerationSigmaKmPerSec2 *
      this.processAccelerationSigmaKmPerSec2;
    const dt2 = dt * dt;
    const dt3 = dt2 * dt;
    const dt4 = dt2 * dt2;

    const q = new Matrix(6, 6);

    for (let axis = 0; axis < 3; axis++) {
      const posIdx = axis;
      const velIdx = axis + 3;

      q.elements[posIdx * 6 + posIdx] = 0.25 * dt4 * sigma2;
      q.elements[posIdx * 6 + velIdx] = 0.5 * dt3 * sigma2;
      q.elements[velIdx * 6 + posIdx] = 0.5 * dt3 * sigma2;
      q.elements[velIdx * 6 + velIdx] = dt2 * sigma2;
    }

    return q;
  }

  private calculateDerivatives(stateInput: Float64Array): Float64Array {
    const px = stateInput[0];
    const py = stateInput[1];
    const pz = stateInput[2];
    const vx = stateInput[3];
    const vy = stateInput[4];
    const vz = stateInput[5];

    const [ax, ay, az] = computeOrbitalAcceleration({
      x: px,
      y: py,
      z: pz,
      vx,
      vy,
      vz,
    });

    const radiusSquared = px * px + py * py + pz * pz;
    const radius = Math.sqrt(radiusSquared);
    const radiusFifth = radiusSquared * radiusSquared * radius;
    const gravityGradientScale =
      ASTRO_CONSTANTS.EARTH_GRAVITY_PARAM / radiusFifth;

    const gxx = gravityGradientScale * (3 * px * px - radiusSquared);
    const gxy = gravityGradientScale * (3 * px * py);
    const gxz = gravityGradientScale * (3 * px * pz);
    const gyy = gravityGradientScale * (3 * py * py - radiusSquared);
    const gyz = gravityGradientScale * (3 * py * pz);
    const gzz = gravityGradientScale * (3 * pz * pz - radiusSquared);

    const out = new Float64Array(42);
    out[0] = vx;
    out[1] = vy;
    out[2] = vz;
    out[3] = ax;
    out[4] = ay;
    out[5] = az;

    for (let col = 0; col < 6; col++) {
      const p0 = stateInput[6 + col];
      const p1 = stateInput[6 + 6 + col];
      const p2 = stateInput[6 + 12 + col];
      const p3 = stateInput[6 + 18 + col];
      const p4 = stateInput[6 + 24 + col];
      const p5 = stateInput[6 + 30 + col];

      out[6 + col] = p3;
      out[6 + 6 + col] = p4;
      out[6 + 12 + col] = p5;
      out[6 + 18 + col] = gxx * p0 + gxy * p1 + gxz * p2;
      out[6 + 24 + col] = gxy * p0 + gyy * p1 + gyz * p2;
      out[6 + 30 + col] = gxz * p0 + gyz * p1 + gzz * p2;
    }

    return out;
  }

  private rk4Step(state: Float64Array, dt: number) {
    const k1 = this.calculateDerivatives(state);
    const s2 = new Float64Array(42);
    for (let i = 0; i < 42; i++) {
      s2[i] = state[i] + k1[i] * 0.5 * dt;
    }

    const k2 = this.calculateDerivatives(s2);
    const s3 = new Float64Array(42);
    for (let i = 0; i < 42; i++) {
      s3[i] = state[i] + k2[i] * 0.5 * dt;
    }

    const k3 = this.calculateDerivatives(s3);
    const s4 = new Float64Array(42);
    for (let i = 0; i < 42; i++) {
      s4[i] = state[i] + k3[i] * dt;
    }

    const k4 = this.calculateDerivatives(s4);

    for (let i = 0; i < 42; i++) {
      this.fullStateVector[i] =
        state[i] + (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
  }

  private symmetrize(matrix: Matrix): Matrix {
    const out = new Matrix(matrix.rows, matrix.cols);

    for (let row = 0; row < matrix.rows; row++) {
      for (let col = 0; col < matrix.cols; col++) {
        const forward = matrix.elements[row * matrix.cols + col];
        const mirrored = matrix.elements[col * matrix.cols + row];
        out.elements[row * matrix.cols + col] = 0.5 * (forward + mirrored);
      }
    }

    return out;
  }
}

export class Matrix {
  public elements: Float64Array;
  constructor(
    public rows: number,
    public cols: number,
  ) {
    this.elements = new Float64Array(rows * cols);
  }
  static identity(n: number): Matrix {
    const m = new Matrix(n, n);
    for (let i = 0; i < n; i++) m.elements[i * n + i] = 1.0;
    return m;
  }
  static fromArray(data: number[], rows: number, cols: number): Matrix {
    const m = new Matrix(rows, cols);
    m.elements.set(data);
    return m;
  }
  multiply(b: Matrix): Matrix {
    if (this.cols !== b.rows) throw new Error("Matrix dim mismatch");
    const out = new Matrix(this.rows, b.cols);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        let sum = 0.0;
        for (let k = 0; k < this.cols; k++)
          sum += this.elements[r * this.cols + k] * b.elements[k * b.cols + c];
        out.elements[r * b.cols + c] = sum;
      }
    }
    return out;
  }
  add(b: Matrix): Matrix {
    const out = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.elements.length; i++)
      out.elements[i] = this.elements[i] + b.elements[i];
    return out;
  }
  subtract(b: Matrix): Matrix {
    const out = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.elements.length; i++)
      out.elements[i] = this.elements[i] - b.elements[i];
    return out;
  }
  transpose(): Matrix {
    const out = new Matrix(this.cols, this.rows);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++)
        out.elements[c * this.rows + r] = this.elements[r * this.cols + c];
    }
    return out;
  }
  inverse(): Matrix {
    if (this.rows !== this.cols) {
      throw new Error("Matrix inverse requires a square matrix");
    }

    const n = this.rows;
    const aug = new Float64Array(n * n * 2);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) aug[i * 2 * n + j] = this.elements[i * n + j];
      aug[i * 2 * n + n + i] = 1.0;
    }

    for (let i = 0; i < n; i++) {
      let pivotRow = i;
      let pivotMagnitude = Math.abs(aug[i * 2 * n + i]);

      for (let row = i + 1; row < n; row++) {
        const candidate = Math.abs(aug[row * 2 * n + i]);
        if (candidate > pivotMagnitude) {
          pivotMagnitude = candidate;
          pivotRow = row;
        }
      }

      if (pivotMagnitude < 1e-12) {
        throw new Error("Matrix is singular");
      }

      if (pivotRow !== i) {
        for (let j = 0; j < 2 * n; j++) {
          const idxA = i * 2 * n + j;
          const idxB = pivotRow * 2 * n + j;
          const tmp = aug[idxA];
          aug[idxA] = aug[idxB];
          aug[idxB] = tmp;
        }
      }

      const pivot = aug[i * 2 * n + i];
      for (let j = 0; j < 2 * n; j++) aug[i * 2 * n + j] /= pivot;

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k * 2 * n + i];
          for (let j = 0; j < 2 * n; j++)
            aug[k * 2 * n + j] -= factor * aug[i * 2 * n + j];
        }
      }
    }
    const out = new Matrix(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++)
        out.elements[i * n + j] = aug[i * 2 * n + n + j];
    }
    return out;
  }
}

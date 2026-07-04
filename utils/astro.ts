export const ASTRO_CONSTANTS = {
  EARTH_RADIUS_KM: 6378.137,
  EARTH_GRAVITY_PARAM: 398600.4418, // mu
  J2_OBLATENESS: 0.00108263,
  EARTH_ROTATION_RATE: 7.292115e-5, // rad/s
  // Drag Settings: CD=2.2, Area=0.01m^2, Mass=1000kg
  // converted to km^2/kg: (2.2 * 0.01 * 1e-6) / 1000
  BALLISTIC_COEFF: 2.2e-11,
  SENSOR_BIAS: [2.0, -2.0, 0.5],
  SENSOR_NOISE: 0.5,
};

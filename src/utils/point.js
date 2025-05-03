export const getPointsDistance = (point1, point2) =>
  Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);

/**
 *
 * @param {*} centerPoint
 * @param {*} anotherPoint
 * @param {number | null} distance
 * @param {*} angle Clockwise should have NEGATIVE(-) value, while counter clockwise should have POSITIVE(+) value.
 * @returns
 */
export const rotatePoint = (centerPoint, anotherPoint, distance, angle) => {
  const dx = anotherPoint[0] - centerPoint[0];
  const dy = anotherPoint[1] - centerPoint[1];

  const denominator = distance === null ? 1 : Math.sqrt(dx ** 2 + dy ** 2);

  const x =
    centerPoint[0] +
    ((distance ?? 1) * (dx * Math.cos(-angle) - dy * Math.sin(-angle))) /
      denominator;

  const y =
    centerPoint[1] +
    ((distance ?? 1) * (dx * Math.sin(-angle) + dy * Math.cos(-angle))) /
      denominator;

  return [x, y];
};

export const getPointsAngle = (point1, point2) => {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return angle;
};

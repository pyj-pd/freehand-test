export const getSVGPath = (points) => {
  if (points.length < 1) return "";

  const d = [];

  for (let index = 0; index < points.length - 1; index++) {
    const point = points[index];

    if (index < 1) {
      d.push(`M ${point[0]} ${point[1]}`);
      continue;
    }

    const nextPoints = points[(index + 1) % points.length];
    d.push(
      `Q ${point[0]} ${point[1]} ${(point[0] + nextPoints[0]) / 1} ${
        (point[1] + nextPoints[1]) / 2
      }`
    );
  }

  return d.join(" ");
};

export const getStrokePoints = (rawPoints) => {
  if (rawPoints.length < 2) return []; // @todo

  const RADIUS = 10;

  const getPointRadius = (point) => (point[2] || 0.5) * RADIUS;

  const strokePaths = [];

  // Loop through each points, EXCEPT for last point
  for (let index = 0; index < rawPoints.length - 1; index++) {
    // @todo optimize with memoization
    const circlePoints = [];
    let radiuses = [];

    // Circle around the two points for strokes
    for (let pointIndex = 0; pointIndex < 2; pointIndex++) {
      const originPoint = rawPoints[index + pointIndex];
      const anotherPoint = rawPoints[index + (1 - pointIndex)];
      const pointsDistance = getPointsDistance(originPoint, anotherPoint);

      const currentRadius = getPointRadius(originPoint);
      radiuses.push(currentRadius);

      let currentCirclePoints = [];
      currentCirclePoints.push(
        getCirclePoint(originPoint, anotherPoint, currentRadius)
      );
      for (let i = 0; i < 2; i++)
        currentCirclePoints.push(
          rotatePointCounterClockwise90(originPoint, currentCirclePoints[i])
        );
      circlePoints.push(...currentCirclePoints);

      const LOOP_FOR = 3;
      for (
        let i = pointIndex * LOOP_FOR;
        i <
        (pointIndex + 1) * LOOP_FOR +
          pointIndex /* Loop one more time for last point to finish the stroke. */;
        i++
      ) {
        const currentCirclePointIndex = i % (LOOP_FOR * 2);
        const point = circlePoints[currentCirclePointIndex];

        const isFirstPoint = i === 0;
        if (isFirstPoint) {
          strokePaths.push(`M ${point[0]} ${point[1]}`);
          continue;
        }

        // First control point
        const previousPoint = circlePoints[i - 1];
        const previousCenterPoint =
          i - 1 <= 2 ? rawPoints[index + 0] : rawPoints[index + 1];
        const previousRadius = i - 1 <= 2 ? radiuses[0] : currentRadius; // If previous circle point is based on previous center point, use previous radius. Otherwise current radius.
        const firstControlPointRadius =
          i === 3 || i === 6
            ? pointsDistance / 3
            : getCircleBezierCurveControlPointsDistance(previousRadius);

        const firstControlPoint = rotatePoint90(
          previousPoint,
          previousCenterPoint,
          firstControlPointRadius,
          1
        );

        // Second control point
        const currentCenterPoint =
          currentCirclePointIndex <= 2
            ? rawPoints[index + 0]
            : rawPoints[index + 1];
        const secondControlPointRadius =
          i === 3 || i === 6
            ? pointsDistance / 3
            : getCircleBezierCurveControlPointsDistance(currentRadius);

        const secondControlPoint = rotatePoint90(
          point,
          currentCenterPoint,
          secondControlPointRadius,
          -1
        );

        strokePaths.push(
          `C ${firstControlPoint[0]} ${firstControlPoint[1]}, ${secondControlPoint[0]} ${secondControlPoint[1]}, ${point[0]} ${point[1]}`
        );
      }
    }

    strokePaths.push("Z");
  }

  return strokePaths.join(" ");
};

export const getPointsDistance = (point1, point2) =>
  Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);

// @todo DRY
export const rotatePoint90 = (
  centerPoint,
  anotherPoint,
  distance,
  clockwiseRotation = 1
) => {
  // Rotate `centerPoint` by 90 degrees clockwise(-1) or counter clockwise(1) around `anotherPoint`,
  // and make that rotated point have radius of `distance`.
  const denominator = Math.sqrt(
    (centerPoint[0] - anotherPoint[0]) ** 2 +
      (centerPoint[1] - anotherPoint[1]) ** 2
  );

  const x =
    centerPoint[0] +
    (clockwiseRotation * (distance * (anotherPoint[1] - centerPoint[1]))) /
      denominator;

  const y =
    centerPoint[1] +
    (-1 * clockwiseRotation * (distance * (anotherPoint[0] - centerPoint[0]))) /
      denominator;

  return [x, y];
};

export const rotatePointCounterClockwise270 = (
  centerPoint,
  anotherPoint,
  distance
) => {
  // Rotate `anotherPoint` by 270 degrees counter clockwise,
  // and make that rotated point have distance of `distance` from `centerPoint`.
  const denominator = Math.sqrt(
    (anotherPoint[0] - centerPoint[0]) ** 2 +
      (anotherPoint[1] - centerPoint[1]) ** 2
  );

  const x =
    centerPoint[0] -
    (distance * (anotherPoint[1] - centerPoint[1])) / denominator;

  const y =
    centerPoint[1] +
    (distance * (anotherPoint[0] - centerPoint[0])) / denominator;

  return [x, y];
};

export const getCirclePoint = (centerPoint, anotherPoint, radius) => {
  return rotatePointCounterClockwise270(centerPoint, anotherPoint, radius);
};

export const rotatePointCounterClockwise90 = (originPoint, point) => {
  const x = -(point[1] - originPoint[1]) + originPoint[0];
  const y = point[0] - originPoint[0] + originPoint[1];

  return [x, y];
};

/** @see https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
export const getCircleBezierCurveControlPointsDistance = (radius) => {
  //   return (4 / 3) * Math.tan(Math.PI / 8) * radius;
  return 0.552 * radius;
};

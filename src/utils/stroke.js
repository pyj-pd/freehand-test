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

  const getPointRadius = (point) => 5; // (point[2] ?? 0.5) * RADIUS;

  const strokePaths = [];

  // Loop through each points, EXCEPT for last point
  for (let index = 0; index < rawPoints.length - 1; index++) {
    // @todo optimize with memoization
    // let slope;

    // if (index <= 0) slope = getSlope(rawPoints[index], rawPoints[index + 1]);
    // else if (index >= rawPoints.length - 1)
    //   slope = getSlope(rawPoints[index], rawPoints[index - 1]);
    // else slope = getSlope(rawPoints[index - 1], rawPoints[index + 1]);

    // let perpendicularSlope = -1 / slope;

    let currentStrokePaths = [];

    let firstPoint;

    // Circle around the two points for strokes
    for (let pointIndex = 0; pointIndex < 2; pointIndex++) {
      const originPoint = rawPoints[index + pointIndex];
      const anotherPoint = rawPoints[index + (1 - pointIndex)];

      const radius = getPointRadius(originPoint);

      let point = getCirclePoint(originPoint, anotherPoint, radius);

      if (isNaN(point[0]) || isNaN(point[1])) {
        console.log(originPoint, anotherPoint, point);
      }

      for (let i = 0; i < 3; i++) {
        const isFirstPoint = pointIndex === 0 && i === 0;
        if (isFirstPoint) firstPoint = point;

        if (isFirstPoint) strokePaths.push(`M ${point[0]} ${point[1]}`);
        else {
          const controlPoints = getCirclePointControlPoints(
            originPoint,
            point,
            radius
          );

          strokePaths.push(
            `C ${controlPoints[0][0]} ${controlPoints[0][1]}, ${controlPoints[1][0]} ${controlPoints[1][1]}, ${point[0]} ${point[1]}`
          );
        }

        point = rotatePointCounterClockwise(originPoint, point);
      }
    }

    strokePaths.push(`L ${firstPoint[0]} ${firstPoint[1]}`);

    strokePaths.push(...currentStrokePaths);
  }

  return strokePaths.join(" ");
};

export const getSlope = (point1, point2) =>
  (point1[1] - point2[1]) / (point1[0] - point2[0]);

// @todo DRY
export const getCirclePointControlPoints = (
  centerPoint,
  circlePoint,
  radius
) => {
  const distance = getCircleBezierCurveControlPointsDistance(radius);

  // Rotate `centerPoint` by 90 degrees,
  // and make that rotated point have radius of `distance`.
  const denominator = Math.sqrt(
    (centerPoint[0] - circlePoint[0]) ** 2 +
      (centerPoint[1] - circlePoint[1]) ** 2
  );

  const x1 =
    circlePoint[0] +
    (distance * (centerPoint[1] - circlePoint[1])) / denominator;

  const y1 =
    circlePoint[1] -
    (distance * (centerPoint[0] - circlePoint[0])) / denominator;

  const x2 = 2 * circlePoint[0] - x1;
  const y2 = 2 * circlePoint[1] - y1;

  return [
    [x1, y1],
    [x2, y2],
  ];
};

export const getCirclePoint = (centerPoint, anotherPoint, radius) => {
  // Rotate `anotherPoint` by 270 degrees,
  // and make that rotated point have radius of `radius`.
  const denominator = Math.sqrt(
    (anotherPoint[0] - centerPoint[0]) ** 2 +
      (anotherPoint[1] - centerPoint[1]) ** 2
  );

  const x =
    centerPoint[0] -
    (radius * (anotherPoint[1] - centerPoint[1])) / denominator;

  const y =
    centerPoint[1] +
    (radius * (anotherPoint[0] - centerPoint[0])) / denominator;

  return [x, y];
};

// export const movePointParallel = (originPoint, dx, dy) => {
//   const x = originPoint[0] + dx;
//   const y = originPoint[1] + dy;

//   return [x, y];
// };

// export const movePoint = (originPoint, radius, slope, direction = 1) => {
//   const x = originPoint[0] + direction * (radius / Math.sqrt(slope ** 2 + 1));
//   const y =
//     originPoint[1] + direction * ((slope * radius) / Math.sqrt(slope ** 2 + 1));

//   return [x, y];
// };

export const rotatePointCounterClockwise = (originPoint, point) => {
  const x = -(point[1] - originPoint[1]) + originPoint[0];
  const y = point[0] - originPoint[0] + originPoint[1];

  return [x, y];
};

/** @see https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
export const getCircleBezierCurveControlPointsDistance = (radius) => {
  //   return (4 / 3) * Math.tan(Math.PI / 8) * radius;
  return 0.552 * radius;
};

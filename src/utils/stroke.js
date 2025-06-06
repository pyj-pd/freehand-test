import { debugTextElement } from "../elements";
import { getPointsAngle, getPointsDistance, rotatePoint } from "./point";

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

let currentContextId = null;
let lastSvgPath = [];
let lastPointIndex = 0;

/**
 *
 * @param {*} rawPoints
 * @param {*} contextId Used for memoization. @todo use class
 * @returns
 */
export const getStrokePoints = (rawPoints, contextId) => {
  // Initialize
  if (contextId !== currentContextId) {
    currentContextId = contextId;
    lastSvgPath = [];
    lastPointIndex = 0;
  }
  if (rawPoints.length <= 3) return []; // @todo

  const RADIUS = 10;

  const getPointRadius = (point) => (point[2] || 0.5) * RADIUS;

  const strokePaths = [...lastSvgPath];

  debugTextElement.innerText = rawPoints.length;

  // Loop through each points, EXCEPT for last point
  for (let index = lastPointIndex; index < rawPoints.length - 1; index++) {
    // @todo optimize with memoization
    const currentStrokePaths = [];
    const circlePoints = [];
    let radiuses = [];

    const centerPointsDistance = getPointsDistance(
      rawPoints[index],
      rawPoints[index >= rawPoints.length - 1 ? index - 1 : index + 1]
    );

    // Circle around the two points for strokes
    for (let pointIndex = 0; pointIndex < 2; pointIndex++) {
      const originPoint = rawPoints[index + pointIndex];
      const anotherPoint = rawPoints[index + (1 - pointIndex)];

      const currentRadius = getPointRadius(originPoint);
      radiuses.push(currentRadius);

      let currentCirclePoints = [];
      currentCirclePoints.push(
        getCirclePoint(originPoint, anotherPoint, currentRadius)
      );
      for (let i = 0; i < 2; i++)
        currentCirclePoints.push(
          rotatePoint(originPoint, currentCirclePoints[i], null, -Math.PI / 2)
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
        const circlePoint = circlePoints[currentCirclePointIndex];

        const isFirstPoint = i === 0;
        if (isFirstPoint) {
          currentStrokePaths.push(`M${circlePoint[0]} ${circlePoint[1]}`);
          continue;
        }

        // First control point
        const previousCirclePoint = circlePoints[i - 1];
        const previousCenterPoint =
          i - 1 <= 2 ? rawPoints[index + 0] : rawPoints[index + 1];
        const previousRadius = i - 1 <= 2 ? radiuses[0] : currentRadius; // If previous circle point is based on previous center point, use previous radius. Otherwise current radius.
        const firstControlPointRadius =
          i === 3 || i === 6
            ? centerPointsDistance / 3
            : getCircleBezierCurveControlPointsDistance(previousRadius);

        const firstControlPoint = rotatePoint(
          previousCirclePoint,
          previousCenterPoint,
          firstControlPointRadius,
          Math.PI / 2
        );

        // Second control point
        const currentCenterPoint =
          currentCirclePointIndex <= 2
            ? rawPoints[index + 0]
            : rawPoints[index + 1];
        const secondControlPointRadius =
          i === 3 || i === 6
            ? centerPointsDistance / 3
            : getCircleBezierCurveControlPointsDistance(currentRadius);

        const secondControlPoint = rotatePoint(
          circlePoint,
          currentCenterPoint,
          secondControlPointRadius,
          -Math.PI / 2
        );

        currentStrokePaths.push(
          `C${firstControlPoint[0]} ${firstControlPoint[1]}, ${secondControlPoint[0]} ${secondControlPoint[1]}, ${circlePoint[0]} ${circlePoint[1]}`
        );
      }
    }

    currentStrokePaths.push("Z");
    strokePaths.push(currentStrokePaths.join(""));
  }

  // lastSvgPath = [...strokePaths];
  // lastPointIndex = rawPoints.length - 1;

  return strokePaths.join(" ");
};

export const getCirclePoint = (centerPoint, anotherPoint, radius) => {
  return rotatePoint(centerPoint, anotherPoint, radius, -Math.PI / 2);
};

/** @see https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
export const getCircleBezierCurveControlPointsDistance = (radius) => {
  //   return (4 / 3) * Math.tan(Math.PI / 8) * radius;
  return 0.552 * radius;
};

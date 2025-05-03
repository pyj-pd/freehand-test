import "./style.css";
import { generateRandomId } from "./utils/random";
import { getStrokePoints } from "./utils/stroke";
import {
  debugTextElement,
  drawingBoardElement,
  svgPathElement,
} from "./elements";

let points = null;
let pathContextId = null; // @todo use class

function onPointerDown(event) {
  points = [];
  pathContextId = generateRandomId();
}

/**
 * @param {PointerEvent} event
 */
function onPointerMove(event) {
  if (points === null) return;
  event.preventDefault();

  const currentPointData = [event.clientX, event.clientY, event.pressure];

  const lastPointIndex = points.length - 1;
  if (
    lastPointIndex >= 0 &&
    points[lastPointIndex][0] === event.clientX &&
    points[lastPointIndex][1] === event.clientY
  ) {
    if (points[lastPointIndex][2] >= event.pressure) return;
    else {
      points[lastPointIndex] = currentPointData;
    }
  } else points.push(currentPointData);

  // debugSpan.innerText = `${event.clientX}, ${event.clientY}, ${event.pressure}, ${points.length}`;

  const path = getStrokePoints(points, pathContextId);
  svgPathElement.setAttribute("d", path);
}

function onPointerUp(event) {
  points = null;
  pathContextId = null;
}

drawingBoardElement.addEventListener("pointerdown", onPointerDown);
drawingBoardElement.addEventListener("pointermove", onPointerMove);
drawingBoardElement.addEventListener("pointerup", onPointerUp);
drawingBoardElement.addEventListener("pointerleave", onPointerUp);

drawingBoardElement.setAttribute("width", `${document.body.clientWidth}`);
drawingBoardElement.setAttribute("height", `${document.body.clientHeight}`);
drawingBoardElement.setAttribute(
  "viewBox",
  `0 0 ${document.body.clientWidth} ${document.body.clientHeight}`
);

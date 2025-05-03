import "./style.css";
import { getStrokePoints, getSVGPath } from "./utils/stroke";

let points = null;

const drawingBoard = document.getElementById("drawing-board");
const debugSpan = document.getElementById("debug");
const svgPath = drawingBoard.querySelector("path");

function onPointerDown(event) {
  points = [];
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

  debugSpan.innerText = `${event.clientX}, ${event.clientY}, ${event.pressure}, ${points.length}`;

  const path = getStrokePoints(points);
  svgPath.setAttribute("d", path);
}

function onPointerUp(event) {
  points = null;
}

drawingBoard.addEventListener("pointerdown", onPointerDown);
drawingBoard.addEventListener("pointermove", onPointerMove);
drawingBoard.addEventListener("pointerup", onPointerUp);
drawingBoard.addEventListener("pointerleave", onPointerUp);

drawingBoard.setAttribute("width", `${document.body.clientWidth}`);
drawingBoard.setAttribute("height", `${document.body.clientHeight}`);
drawingBoard.setAttribute(
  "viewBox",
  `0 0 ${document.body.clientWidth} ${document.body.clientHeight}`
);

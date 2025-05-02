import "./style.css";
import { getStrokePoints, getSVGPath } from "./utils/stroke";

let points = null;

const drawingBoard = document.getElementById("drawing-board");
const svgPath = drawingBoard.querySelector("path");

function onPointerDown(event) {
  points = [];
}

/**
 * @param {PointerEvent} event
 */
function onPointerMove(event) {
  if (points === null) return;

  points.push([event.clientX, event.clientY, event.pressure]);

  // const path = getSVGPath(points);
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

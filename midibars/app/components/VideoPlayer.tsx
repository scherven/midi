"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MuxPlayerComponentProps {
  playbackId: string;
}

export default function MuxPlayerComponent({
  playbackId,
}: MuxPlayerComponentProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState({ x: 0, y: 0, width: 400, height: 400 });
  const [isDragging, setIsDragging] = useState("");
  const [currentCorner, setCurrentCorner] = useState("");
  const [currentSide, setCurrentSide] = useState("");
  const [rotateStart, setRotateStart] = useState({ angle: 0, x: 0, y: 0 });
  const containerRef = useRef(null);

  const imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${0}`;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setSize({
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging === "rotate") {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const newRotation = currentAngle - rotateStart.angle;
      setRotation(newRotation);
    } else if (isDragging === "move") {
      setSize((prev) => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (isDragging === "corner" && currentCorner) {
      setSize((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        let newWidth = prev.width;
        let newHeight = prev.height;

        if (currentCorner.includes("n")) {
          newHeight -= e.movementY;
          newY += e.movementY;
        }
        if (currentCorner.includes("s")) {
          newHeight += e.movementY;
        }
        if (currentCorner.includes("w")) {
          newWidth -= e.movementX;
          newX += e.movementX;
        }
        if (currentCorner.includes("e")) {
          newWidth += e.movementX;
        }

        return {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
      });
    } else if (isDragging === "side" && currentSide) {
      let { x, y, width, height } = size;
      if (currentSide === "n") {
        height -= e.movementY;
        y += e.movementY;
      } else if (currentSide === "s") {
        height += e.movementY;
      } else if (currentSide === "w") {
        width -= e.movementX;
        x += e.movementX;
      } else if (currentSide === "e") {
        width += e.movementX;
      }
      setSize({ x, y, width, height });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging("");
    setCurrentCorner("");
    setCurrentSide("");
  };

  const handlePan = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging("move");
  };

  const handleResize = (corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCorner(corner);
    setIsDragging("corner");
  };

  const handleCrop = (side: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSide(side);
    setIsDragging("side");
  };

  const handleRotate = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    setRotateStart({ angle: startAngle - rotation, x: centerX, y: centerY });
    setIsDragging("rotate");
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div
        ref={containerRef}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${size.width}px`,
            height: `${size.height}px`,
            transform: `translate(${size.x}px, ${size.y}px) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          <Image
            src={imageUrl}
            alt="Editor"
            width={size.width}
            height={size.height}
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              userSelect: "none",
            }}
          />

          <div
            className="absolute border-2 border-blue-500 cursor-move"
            style={{
              left: 0,
              top: 0,
              width: `${size.width}px`,
              height: `${size.height}px`,
              pointerEvents: isDragging ? "none" : "auto",
            }}
            onMouseDown={(e) => handlePan("move", e)}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
              style={{ top: "-40px" }}
              onMouseDown={(e) => handleRotate("rotate", e)}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-600 border-2 border-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div className="w-0.5 h-6 bg-green-600"></div>
              </div>
            </div>

            {["nw", "ne", "sw", "se"].map((corner) => (
              <div
                key={corner}
                className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-pointer hover:scale-125 transition"
                style={{
                  top: corner.includes("n") ? "-8px" : "auto",
                  bottom: corner.includes("s") ? "-8px" : "auto",
                  left: corner.includes("w") ? "-8px" : "auto",
                  right: corner.includes("e") ? "-8px" : "auto",
                  cursor:
                    corner === "nw"
                      ? "nwse-resize"
                      : corner === "ne"
                        ? "nesw-resize"
                        : corner === "sw"
                          ? "nesw-resize"
                          : "nwse-resize",
                }}
                onMouseDown={(e) => handleResize(corner, e)}
              />
            ))}

            {["n", "e", "s", "w"].map((side) => (
              <div
                key={side}
                className="absolute bg-blue-600 border-2 border-white cursor-pointer hover:bg-blue-700 transition"
                style={{
                  top: side === "n" ? "-4px" : side === "s" ? "auto" : "50%",
                  bottom: side === "s" ? "-4px" : "auto",
                  left: side === "w" ? "-4px" : side === "e" ? "auto" : "50%",
                  right: side === "e" ? "-4px" : "auto",
                  width: side === "n" || side === "s" ? "40px" : "8px",
                  height: side === "e" || side === "w" ? "40px" : "8px",
                  transform:
                    side === "n" || side === "s"
                      ? "translateX(-50%)"
                      : "translateY(-50%)",
                  cursor:
                    side === "n" || side === "s" ? "ns-resize" : "ew-resize",
                }}
                onMouseDown={(e) => handleCrop(side, e)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

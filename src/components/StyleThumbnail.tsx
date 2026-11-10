"use client";

import React from "react";
import { RoofShapeId, RoofStyleOption } from "@/data/roofingData";

interface StyleThumbnailProps {
  patternType: RoofStyleOption["patternType"];
  primaryColor?: string;
}

export function StyleThumbnail({ patternType }: StyleThumbnailProps) {
  const blueFrame = "#1e64b7";
  const slateFill = "#aeb6c2";
  const slateDark = "#7d8794";
  const slateLight = "#d6dce5";

  switch (patternType) {
    case "architectural":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          {/* Blue roof structural rafters/eave frame */}
          <path
            d="M16 24 L60 10 L104 24 L104 74 L16 74 Z"
            fill="#f1f5f9"
            stroke={blueFrame}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Dimensional staggered courses */}
          {[28, 40, 52, 64].map((y, rowIdx) => (
            <g key={y}>
              <line
                x1="18"
                y1={y}
                x2="102"
                y2={y}
                stroke={slateDark}
                strokeWidth="1.4"
              />
              {[24, 42, 58, 76, 90].map((x, i) => {
                const offset = (rowIdx % 2) * 7 - 3;
                const tabW = i % 2 === 0 ? 15 : 11;
                return (
                  <rect
                    key={i}
                    x={Math.max(18, Math.min(92, x + offset))}
                    y={y}
                    width={tabW}
                    height="10"
                    fill={i % 2 === 0 ? slateFill : slateLight}
                    stroke={slateDark}
                    strokeWidth="0.9"
                  />
                );
              })}
            </g>
          ))}
          {/* Blue ridge & eave highlight */}
          <path
            d="M14 25 L60 9 L106 25"
            fill="none"
            stroke={blueFrame}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="74"
            x2="106"
            y2="74"
            stroke={blueFrame}
            strokeWidth="3"
          />
        </svg>
      );

    case "3tab":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="20"
            width="84"
            height="54"
            fill={slateLight}
            stroke={blueFrame}
            strokeWidth="2.5"
          />
          {/* Uniform 3-tab rows */}
          {[20, 33, 46, 59].map((y, rIdx) => (
            <g key={y}>
              <rect
                x="19"
                y={y}
                width="82"
                height="12"
                fill={rIdx % 2 === 0 ? slateFill : "#c2c9d4"}
              />
              <line
                x1="18"
                y1={y + 12}
                x2="102"
                y2={y + 12}
                stroke={slateDark}
                strokeWidth="1.2"
              />
              {/* Keyway cutouts */}
              {[46, 74].map((x) => (
                <line
                  key={x}
                  x1={x + (rIdx % 2) * 14 - 7}
                  y1={y + 3}
                  x2={x + (rIdx % 2) * 14 - 7}
                  y2={y + 12}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
          <rect
            x="18"
            y="20"
            width="84"
            height="54"
            fill="none"
            stroke={blueFrame}
            strokeWidth="2.8"
          />
        </svg>
      );

    case "standing-seam":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="18"
            width="84"
            height="56"
            fill={slateLight}
            stroke={blueFrame}
            strokeWidth="2.8"
          />
          {[32, 46, 60, 74, 88].map((x) => (
            <g key={x}>
              <rect
                x={x - 12}
                y="19"
                width="12"
                height="54"
                fill={slateFill}
                opacity="0.45"
              />
              <line
                x1={x}
                y1="18"
                x2={x}
                y2="74"
                stroke={blueFrame}
                strokeWidth="2.2"
              />
              <line
                x1={x + 2}
                y1="18"
                x2={x + 2}
                y2="74"
                stroke={slateDark}
                strokeWidth="1"
              />
            </g>
          ))}
          <line
            x1="15"
            y1="18"
            x2="105"
            y2="18"
            stroke={blueFrame}
            strokeWidth="3.2"
          />
          <line
            x1="15"
            y1="74"
            x2="105"
            y2="74"
            stroke={blueFrame}
            strokeWidth="3.2"
          />
        </svg>
      );

    case "spanish-tile":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="20"
            width="84"
            height="50"
            fill={slateLight}
            stroke={blueFrame}
            strokeWidth="2.4"
          />
          {[28, 44, 60].map((y) => (
            <path
              key={y}
              d={`M 18 ${y} Q 26 ${y - 7}, 34 ${y} T 50 ${y} T 66 ${y} T 82 ${y} T 102 ${y}`}
              fill="none"
              stroke={slateDark}
              strokeWidth="2"
            />
          ))}
          {[34, 50, 66, 82].map((x) => (
            <line
              key={x}
              x1={x}
              y1="20"
              x2={x}
              y2="70"
              stroke={slateDark}
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
          ))}
          {/* Scalloped eave barrels */}
          <path
            d="M 18 70 Q 26 62, 34 70 Q 42 62, 50 70 Q 58 62, 66 70 Q 74 62, 82 70 Q 92 62, 102 70"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.6"
          />
        </svg>
      );

    case "cedar-shake":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="18"
            width="84"
            height="56"
            fill={slateLight}
            stroke={blueFrame}
            strokeWidth="2.6"
          />
          {[20, 34, 48, 61].map((y, row) => (
            <g key={y}>
              {[20, 33, 49, 63, 79, 91].map((x, idx) => {
                const h = idx % 2 === 0 ? 13 : 11;
                return (
                  <g key={x}>
                    <rect
                      x={x}
                      y={y}
                      width="11"
                      height={h}
                      fill={(row + idx) % 2 === 0 ? slateFill : "#c4cbd6"}
                      stroke={slateDark}
                      strokeWidth="1"
                    />
                    {/* Wood grain lines */}
                    <line
                      x1={x + 4}
                      y1={y + 2}
                      x2={x + 4}
                      y2={y + h - 2}
                      stroke={slateDark}
                      strokeWidth="0.7"
                    />
                  </g>
                );
              })}
            </g>
          ))}
          <rect
            x="18"
            y="18"
            width="84"
            height="56"
            fill="none"
            stroke={blueFrame}
            strokeWidth="2.8"
          />
        </svg>
      );

    case "natural-slate":
    case "designer-slate":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="18"
            width="84"
            height="56"
            fill={slateLight}
            stroke={blueFrame}
            strokeWidth="2.6"
          />
          {[22, 36, 50, 64].map((y, rIdx) => (
            <g key={y}>
              {[24, 42, 60, 78, 94].map((x, cIdx) => {
                const cx = x + (rIdx % 2) * 8 - 4;
                if (cx < 22 || cx > 98) return null;
                return patternType === "designer-slate" ? (
                  <path
                    key={cIdx}
                    d={`M ${cx - 8} ${y - 4} L ${cx + 8} ${y - 4} L ${cx + 8} ${y + 4} Q ${cx} ${y + 11} ${cx - 8} ${y + 4} Z`}
                    fill={(rIdx + cIdx) % 2 === 0 ? slateFill : slateLight}
                    stroke={slateDark}
                    strokeWidth="1.2"
                  />
                ) : (
                  <rect
                    key={cIdx}
                    x={cx - 8}
                    y={y - 4}
                    width="16"
                    height="13"
                    fill={(rIdx + cIdx) % 2 === 0 ? slateFill : "#bac2cf"}
                    stroke={blueFrame}
                    strokeWidth="1.1"
                  />
                );
              })}
            </g>
          ))}
          <rect
            x="18"
            y="18"
            width="84"
            height="56"
            fill="none"
            stroke={blueFrame}
            strokeWidth="2.8"
          />
        </svg>
      );

    case "corrugated":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="18"
            y="20"
            width="84"
            height="52"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.6"
          />
          {[26, 36, 46, 56, 66, 76, 86, 94].map((x) => (
            <line
              key={x}
              x1={x}
              y1="20"
              x2={x}
              y2="72"
              stroke={x % 20 === 6 ? blueFrame : slateLight}
              strokeWidth="2"
            />
          ))}
          {/* Horizontal purlin lines */}
          <line
            x1="18"
            y1="36"
            x2="102"
            y2="36"
            stroke={blueFrame}
            strokeWidth="1.8"
          />
          <line
            x1="18"
            y1="56"
            x2="102"
            y2="56"
            stroke={blueFrame}
            strokeWidth="1.8"
          />
        </svg>
      );

    case "flat-tile":
    default:
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="16"
            y="18"
            width="88"
            height="56"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="3"
          />
          <rect
            x="22"
            y="24"
            width="76"
            height="44"
            fill={slateLight}
            stroke={slateDark}
            strokeWidth="1.5"
          />
          {[35, 46, 57].map((y) => (
            <line
              key={y}
              x1="22"
              y1={y}
              x2="98"
              y2={y}
              stroke={slateDark}
              strokeWidth="1.4"
            />
          ))}
        </svg>
      );
  }
}

export function ShapeThumbnail({ shapeId }: { shapeId: RoofShapeId }) {
  const blueFrame = "#1e64b7";
  const slateFill = "#b8c1ce";
  const wallFill = "#eef2f6";

  switch (shapeId) {
    case "gable":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="24"
            y="44"
            width="72"
            height="30"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <polygon
            points="16,46 60,16 104,46"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <line
            x1="60"
            y1="16"
            x2="60"
            y2="46"
            stroke={blueFrame}
            strokeWidth="1.8"
            strokeDasharray="3 2"
          />
        </svg>
      );
    case "hip":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="24"
            y="46"
            width="72"
            height="28"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <polygon
            points="16,46 42,20 78,20 104,46"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <line
            x1="42"
            y1="20"
            x2="16"
            y2="46"
            stroke={blueFrame}
            strokeWidth="2.5"
          />
          <line
            x1="42"
            y1="20"
            x2="34"
            y2="46"
            stroke={blueFrame}
            strokeWidth="2"
          />
          <line
            x1="78"
            y1="20"
            x2="86"
            y2="46"
            stroke={blueFrame}
            strokeWidth="2"
          />
        </svg>
      );
    case "dutch-gable":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="24"
            y="46"
            width="72"
            height="28"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <polygon
            points="16,46 40,22 80,22 104,46"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.5"
          />
          <polygon
            points="40,22 60,12 80,22"
            fill="#e2e8f0"
            stroke={blueFrame}
            strokeWidth="2.2"
          />
        </svg>
      );
    case "gambrel":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="26"
            y="48"
            width="68"
            height="26"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <polygon
            points="18,48 34,24 60,14 86,24 102,48"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <line
            x1="34"
            y1="24"
            x2="86"
            y2="24"
            stroke={blueFrame}
            strokeWidth="1.6"
            strokeDasharray="3 2"
          />
        </svg>
      );
    case "shed":
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <polygon
            points="24,30 96,46 96,74 24,74"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1="16"
            y1="26"
            x2="104"
            y2="46"
            stroke={blueFrame}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mansard":
    default:
      return (
        <svg viewBox="0 0 120 90" className="w-24 h-20" aria-hidden="true">
          <rect
            x="26"
            y="50"
            width="68"
            height="24"
            fill={wallFill}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <polygon
            points="18,50 28,26 92,26 102,50"
            fill={slateFill}
            stroke={blueFrame}
            strokeWidth="2.5"
          />
          <polygon
            points="28,26 44,16 76,16 92,26"
            fill="#d3dbe6"
            stroke={blueFrame}
            strokeWidth="2.2"
          />
        </svg>
      );
  }
}

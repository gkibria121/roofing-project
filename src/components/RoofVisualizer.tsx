"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ColorSwatch,
  PitchOption,
  RoofEstimateResult,
  RoofShapeOption,
  RoofStyleOption,
} from "@/data/roofingData";
import {
  User,
  Video,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  Move,
  Plus,
  Home,
  Minus,
  Maximize2,
  Minimize2,
  ExternalLink,
  Layers,
} from "lucide-react";

interface RoofVisualizerProps {
  style: RoofStyleOption;
  swatch: ColorSwatch;
  onSelectSwatch: (swatch: ColorSwatch) => void;
  shape: RoofShapeOption;
  pitch: PitchOption;
  estimate: RoofEstimateResult;
  hasGutters: boolean;
  hasSkylight: boolean;
  hasRidgeVent: boolean;
  onCycleStyle: () => void;
}

export function RoofVisualizer({
  style,
  swatch,
  onSelectSwatch,
  shape,
  pitch,
  estimate,
  hasGutters,
  hasSkylight,
  hasRidgeVent,
  onCycleStyle,
}: RoofVisualizerProps) {
  const [viewMode, setViewMode] = useState<"3d" | "front" | "back">("3d");
  const [zoom, setZoom] = useState<number>(1);
  const [rotationY, setRotationY] = useState<number>(-24);
  const [rotationX, setRotationX] = useState<number>(14);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [showScalePerson, setShowScalePerson] = useState<boolean>(false);
  const [showCutawayLayers, setShowCutawayLayers] = useState<boolean>(false);
  const [showSwatchPicker, setShowSwatchPicker] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<"orbit" | "pan">("orbit");

  const dragStartRef = useRef<{
    x: number;
    y: number;
    rotY: number;
    rotX: number;
    panX: number;
    panY: number;
  }>({
    x: 0,
    y: 0,
    rotY: -24,
    rotX: 14,
    panX: 0,
    panY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoRotating || viewMode !== "3d") return;
    const interval = setInterval(() => {
      setRotationY((prev) => {
        const next = prev + 0.8;
        return next > 35 ? -35 : next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [isAutoRotating, viewMode]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (viewMode !== "3d") return;
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotationY,
      rotX: rotationX,
      panX: panOffset.x,
      panY: panOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || viewMode !== "3d") return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (dragMode === "pan") {
      setPanOffset({
        x: Math.max(-90, Math.min(90, dragStartRef.current.panX + dx * 0.7)),
        y: Math.max(-60, Math.min(60, dragStartRef.current.panY + dy * 0.7)),
      });
    } else {
      setRotationY(
        Math.max(-45, Math.min(45, dragStartRef.current.rotY + dx * 0.25))
      );
      setRotationX(
        Math.max(4, Math.min(32, dragStartRef.current.rotX + dy * 0.18))
      );
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setRotationY(-24);
    setRotationX(14);
    setPanOffset({ x: 0, y: 0 });
    setIsAutoRotating(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Compute dynamic roof pitch height for 3D & 2D geometry
  const pitchHeightOffset = Math.round((pitch.angleDeg - 14) * 1.9);
  const yawOffset = (rotationY + 24) * 1.15;
  const tiltOffset = (rotationX - 14) * 0.9;

  // Approximate building dimensions for labels
  const approxLengthFt = Math.round(Math.sqrt(estimate.baseFootprintSqFt * 1.3));
  const approxWidthFt = Math.max(
    12,
    Math.round(estimate.baseFootprintSqFt / approxLengthFt)
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-white border border-slate-200 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-4 sm:p-5 select-none flex flex-col justify-between min-h-[430px] sm:min-h-[470px]"
    >
      {/* Top Bar: 3D | Front | Back switcher + More styles button */}
      <div className="flex items-center justify-between gap-2 z-20">
        <div className="flex-1 flex justify-center sm:pl-20">
          <div
            role="tablist"
            aria-label="Roof preview perspective"
            className="inline-flex items-center bg-slate-100/90 p-1 rounded-md border border-slate-200/80"
          >
            {(
              [
                { id: "3d", label: "3D" },
                { id: "front", label: "Front" },
                { id: "back", label: "Back" },
              ] as const
            ).map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(tab.id)}
                  className={`px-3.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#0284c7] shadow-xs border border-slate-200/70"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onCycleStyle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition cursor-pointer"
          title="Cycle to next roofing material style"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>More styles</span>
        </button>
      </div>

      {/* Color Swatch Floating Bar (when gear icon clicked or always subtle at top-left) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 z-20 px-1">
        <div className="flex items-center gap-1.5 bg-slate-50/90 backdrop-blur-xs border border-slate-200/80 rounded-full px-2.5 py-1">
          <span className="text-[11px] font-medium text-slate-500 mr-1">
            Color:
          </span>
          {style.swatches.map((s) => {
            const isSelected = s.id === swatch.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSwatch(s)}
                title={s.name}
                aria-label={`Select color ${s.name}`}
                aria-pressed={isSelected}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#0284c7] ring-offset-1 scale-110"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                }`}
                style={{ backgroundColor: s.primary }}
              />
            );
          })}
          <span className="text-[11px] font-semibold text-slate-700 ml-1">
            {swatch.name}
          </span>
        </div>

        {showCutawayLayers && (
          <div className="text-[11px] font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-600" />
            <span>Deck & Underlayment Cutaway Active</span>
          </div>
        )}
      </div>

      {/* Main Interactive Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-1">
        {/* Left Floating Controls (Matching Reference Image) */}
        <div className="absolute left-1 bottom-2 flex flex-col gap-2 z-20">
          <div className="flex flex-col bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowScalePerson((v) => !v)}
              aria-pressed={showScalePerson}
              title="Toggle 6ft human scale reference"
              className={`p-2 transition border-b border-slate-100 cursor-pointer ${
                showScalePerson
                  ? "bg-sky-50 text-[#0284c7]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowCutawayLayers((v) => !v)}
              aria-pressed={showCutawayLayers}
              title="Toggle underlayment & roof deck cutaway view"
              className={`p-2 transition cursor-pointer ${
                showCutawayLayers
                  ? "bg-sky-50 text-[#0284c7]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSwatchPicker((v) => !v)}
            aria-pressed={showSwatchPicker}
            title="Toggle material finish inspector"
            className={`p-2 bg-white border border-slate-200 rounded-md shadow-xs transition cursor-pointer ${
              showSwatchPicker
                ? "bg-sky-50 text-[#0284c7] border-sky-300"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowDimensions((v) => !v)}
            aria-pressed={showDimensions}
            title="Toggle architectural dimension callouts"
            className={`p-2 bg-white border border-slate-200 rounded-md shadow-xs transition cursor-pointer ${
              showDimensions
                ? "text-slate-800 bg-slate-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Right Floating Controls (Matching Reference Image) */}
        <div className="absolute right-1 bottom-2 flex flex-col gap-2 z-20">
          <div className="flex flex-col bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setViewMode("3d");
                setIsAutoRotating((v) => !v);
              }}
              aria-pressed={isAutoRotating}
              title={isAutoRotating ? "Pause 3D rotation" : "Auto-rotate 3D model"}
              className={`p-2 transition border-b border-slate-100 cursor-pointer ${
                isAutoRotating
                  ? "bg-sky-50 text-[#0284c7]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isAutoRotating ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#0284c7] fill-[#0284c7]" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setDragMode((m) => (m === "orbit" ? "pan" : "orbit"))
              }
              aria-pressed={dragMode === "pan"}
              title={
                dragMode === "pan"
                  ? "Pan mode active (click to switch to Orbit)"
                  : "Orbit mode active (click to switch to Pan)"
              }
              className={`p-2 transition cursor-pointer ${
                dragMode === "pan"
                  ? "bg-sky-50 text-[#0284c7]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.12).toFixed(2))))}
              title="Zoom in"
              aria-label="Zoom in"
              className="p-2 text-slate-600 hover:bg-slate-50 border-b border-slate-100 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset camera view"
              aria-label="Reset camera view"
              className="p-2 text-slate-600 hover:bg-slate-50 border-b border-slate-100 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.12).toFixed(2))))}
              title="Zoom out"
              aria-label="Zoom out"
              className="p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCutawayLayers((v) => !v)}
            title="Inspect roof deck assembly layers"
            aria-label="Inspect roof deck assembly layers"
            className="p-2 bg-white border border-slate-200 rounded-md shadow-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle fullscreen preview"
            aria-label="Toggle fullscreen preview"
            className="p-2 bg-white border border-slate-200 rounded-md shadow-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* SVG 3D / Front / Back Architectural Canvas */}
        <svg
          viewBox="0 0 620 390"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`w-full h-full max-h-[360px] transition-transform duration-150 ${
            viewMode === "3d"
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          }}
          role="img"
          aria-label={`${viewMode.toUpperCase()} preview of a ${shape.titleSuffix} with ${style.titlePrefix} ${style.titleSuffix} in ${swatch.name}`}
        >
          <defs>
            {/* Soft studio floor shadow */}
            <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.16" />
              <stop offset="65%" stopColor="#0f172a" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Primary Roof Slope Lighting Gradient */}
            <linearGradient id="roofSlopeFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={swatch.accent} />
              <stop offset="55%" stopColor={swatch.primary} />
              <stop offset="100%" stopColor={swatch.secondary} />
            </linearGradient>

            <linearGradient id="roofSlopeSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={swatch.primary} />
              <stop offset="100%" stopColor={swatch.secondary} />
            </linearGradient>

            {/* Earth / Structural Base Cross-section Gradient (like the screenshot!) */}
            <linearGradient id="foundationBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b5344" />
              <stop offset="45%" stopColor="#523d30" />
              <stop offset="100%" stopColor="#3b2b22" />
            </linearGradient>

            <linearGradient id="foundationSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a372b" />
              <stop offset="100%" stopColor="#2e2119" />
            </linearGradient>

            {/* OSB Decking Pattern for Cutaway */}
            <pattern
              id="osbDeckPattern"
              width="14"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <rect width="14" height="10" fill="#d4a359" />
              <path
                d="M2 2 L6 3 M8 6 L12 5 M3 8 L7 7"
                stroke="#b07d35"
                strokeWidth="1.2"
              />
            </pattern>

            {/* Dynamic Material Surface Pattern */}
            <pattern
              id="roofSurfacePattern"
              width="36"
              height="22"
              patternUnits="userSpaceOnUse"
              patternTransform="skewX(-18)"
            >
              <rect width="36" height="22" fill="url(#roofSlopeFront)" />
              {style.patternType === "architectural" && (
                <>
                  <line
                    x1="0"
                    y1="11"
                    x2="36"
                    y2="11"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="0"
                    y1="21.5"
                    x2="36"
                    y2="21.5"
                    stroke="rgba(0,0,0,0.42)"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="2"
                    y="1"
                    width="14"
                    height="9.5"
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="0.8"
                  />
                  <rect
                    x="19"
                    y="1"
                    width="11"
                    height="9.5"
                    fill="rgba(0,0,0,0.12)"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="0.8"
                  />
                  <rect
                    x="10"
                    y="11.5"
                    width="15"
                    height="9.5"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="0.8"
                  />
                  <rect
                    x="27"
                    y="11.5"
                    width="8"
                    height="9.5"
                    fill="rgba(0,0,0,0.14)"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="0.8"
                  />
                </>
              )}

              {style.patternType === "3tab" && (
                <>
                  <line
                    x1="0"
                    y1="11"
                    x2="36"
                    y2="11"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="0"
                    y1="21.5"
                    x2="36"
                    y2="21.5"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="11"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="1.3"
                  />
                  <line
                    x1="24"
                    y1="2"
                    x2="24"
                    y2="11"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="1.3"
                  />
                  <line
                    x1="6"
                    y1="13"
                    x2="6"
                    y2="22"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="1.3"
                  />
                  <line
                    x1="18"
                    y1="13"
                    x2="18"
                    y2="22"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="1.3"
                  />
                  <line
                    x1="30"
                    y1="13"
                    x2="30"
                    y2="22"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="1.3"
                  />
                </>
              )}

              {style.patternType === "standing-seam" && (
                <>
                  <line
                    x1="9"
                    y1="0"
                    x2="9"
                    y2="22"
                    stroke="rgba(255,255,255,0.32)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="11"
                    y1="0"
                    x2="11"
                    y2="22"
                    stroke="rgba(0,0,0,0.48)"
                    strokeWidth="2.2"
                  />
                  <line
                    x1="27"
                    y1="0"
                    x2="27"
                    y2="22"
                    stroke="rgba(255,255,255,0.32)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="29"
                    y1="0"
                    x2="29"
                    y2="22"
                    stroke="rgba(0,0,0,0.48)"
                    strokeWidth="2.2"
                  />
                </>
              )}

              {style.patternType === "corrugated" && (
                <>
                  {[4, 10, 16, 22, 28, 34].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="22"
                      stroke={
                        x % 12 === 4
                          ? "rgba(255,255,255,0.28)"
                          : "rgba(0,0,0,0.35)"
                      }
                      strokeWidth="1.8"
                    />
                  ))}
                </>
              )}

              {style.patternType === "spanish-tile" && (
                <>
                  <path
                    d="M 0 11 Q 6 4, 12 11 Q 18 4, 24 11 Q 30 4, 36 11"
                    fill="none"
                    stroke="rgba(0,0,0,0.42)"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M 0 21 Q 6 14, 12 21 Q 18 14, 24 21 Q 30 14, 36 21"
                    fill="none"
                    stroke="rgba(0,0,0,0.42)"
                    strokeWidth="1.8"
                  />
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="22"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="24"
                    y1="0"
                    x2="24"
                    y2="22"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.2"
                  />
                </>
              )}

              {style.patternType === "cedar-shake" && (
                <>
                  <rect
                    x="1"
                    y="1"
                    width="10"
                    height="10"
                    fill="rgba(255,255,255,0.07)"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1"
                  />
                  <rect
                    x="12"
                    y="1"
                    width="13"
                    height="9"
                    fill="rgba(0,0,0,0.12)"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1"
                  />
                  <rect
                    x="26"
                    y="1"
                    width="9"
                    height="10"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1"
                  />
                  <rect
                    x="5"
                    y="11.5"
                    width="12"
                    height="10"
                    fill="rgba(0,0,0,0.1)"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1"
                  />
                  <rect
                    x="18"
                    y="11.5"
                    width="14"
                    height="9.5"
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(0,0,0,0.38)"
                    strokeWidth="1"
                  />
                </>
              )}

              {(style.patternType === "natural-slate" ||
                style.patternType === "designer-slate" ||
                style.patternType === "flat-tile") && (
                <>
                  <rect
                    x="1"
                    y="1"
                    width="16"
                    height="10"
                    fill="rgba(255,255,255,0.07)"
                    stroke="rgba(0,0,0,0.36)"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="18"
                    y="1"
                    width="16"
                    height="10"
                    fill="rgba(0,0,0,0.08)"
                    stroke="rgba(0,0,0,0.36)"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="9"
                    y="11.5"
                    width="16"
                    height="10"
                    fill="rgba(255,255,255,0.09)"
                    stroke="rgba(0,0,0,0.36)"
                    strokeWidth="1.1"
                  />
                </>
              )}
            </pattern>
          </defs>

          {viewMode === "3d" && (
            <g
              transform={`translate(${yawOffset * 0.45}, ${tiltOffset * 0.35})`}
            >
              {/* Soft ground shadow ellipse */}
              <ellipse
                cx="310"
                cy="325"
                rx="210"
                ry="34"
                fill="url(#floorShadow)"
              />

              {/* 3D Architectural Cutaway Base (Earth/Masonry Plinth + Timber Wall Frame, inspired by screenshot!) */}
              {/* Front Foundation Block */}
              <polygon
                points={`155,258 385,222 385,286 155,326`}
                fill="url(#foundationBase)"
                stroke="#36261d"
                strokeWidth="1.2"
              />
              {/* Side Foundation Block */}
              <polygon
                points={`385,222 465,254 465,316 385,286`}
                fill="url(#foundationSide)"
                stroke="#291d16"
                strokeWidth="1.2"
              />
              {/* Green Turf / Fascia Top Rim on Plinth */}
              <polygon
                points={`152,252 385,216 468,248 465,256 385,224 155,260`}
                fill="#5a8f49"
              />

              {/* House Upper Story Exterior Siding & Studs */}
              <polygon
                points={`175,252 375,219 375,162 175,194`}
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1.4"
              />
              {/* Horizontal Lap Siding Lines on Front Wall */}
              {[172, 182, 192, 202, 212, 222, 232, 242].map((y, idx) => (
                <line
                  key={y}
                  x1="176"
                  y1={y + idx * 0.3}
                  x2="374"
                  y2={y - 31 + idx * 0.3}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}

              {/* Architectural Windows on Front Wall */}
              <polygon
                points="212,226 248,220 248,192 212,198"
                fill="#bae6fd"
                stroke="#64748b"
                strokeWidth="2"
              />
              <line
                x1="230"
                y1="195"
                x2="230"
                y2="223"
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <polygon
                points="296,212 332,206 332,178 296,184"
                fill="#bae6fd"
                stroke="#64748b"
                strokeWidth="2"
              />
              <line
                x1="314"
                y1="181"
                x2="314"
                y2="209"
                stroke="#64748b"
                strokeWidth="1.2"
              />

              {/* Right Gable / Side Wall */}
              <polygon
                points={
                  shape.id === "hip" || shape.id === "mansard"
                    ? `375,219 452,249 452,192 375,162`
                    : shape.id === "shed"
                    ? `375,219 452,249 452,185 375,142`
                    : `375,219 452,249 452,192 414,${102 - pitchHeightOffset} 375,162`
                }
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1.4"
              />

              {/* Structural Steel / Timber Wall Posts embedded into plinth (like screenshot!) */}
              <polygon
                points="178,248 186,246 186,304 178,306"
                fill="#7c4d3a"
                stroke="#472b20"
                strokeWidth="1"
              />
              <polygon
                points="365,217 373,215 373,273 365,275"
                fill="#7c4d3a"
                stroke="#472b20"
                strokeWidth="1"
              />
              <polygon
                points="442,245 449,248 449,302 442,299"
                fill="#633c2c"
                stroke="#3d241a"
                strokeWidth="1"
              />

              {/* MAIN 3D ROOF PLANES (Adapts to Shape & Pitch!) */}
              {shape.id === "shed" ? (
                /* Modern Mono-Pitch Shed Roof */
                <g>
                  <polygon
                    points={`156,182 382,140 466,188 238,228`}
                    fill="url(#roofSurfacePattern)"
                    stroke={swatch.secondary}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Thick Fascia Edge */}
                  <polygon
                    points={`156,182 238,228 238,236 156,190`}
                    fill="#f8fafc"
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                </g>
              ) : shape.id === "hip" || shape.id === "dutch-gable" ? (
                /* Hip / Dutch-Hip Roof */
                <g>
                  {/* Main Front Trapezoid Slope */}
                  <polygon
                    points={`158,200 226,${114 - pitchHeightOffset} 352,${
                      94 - pitchHeightOffset
                    } 382,166`}
                    fill="url(#roofSurfacePattern)"
                    stroke={swatch.secondary}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Right Hip Triangle Slope */}
                  <polygon
                    points={`352,${94 - pitchHeightOffset} 462,196 382,166`}
                    fill="url(#roofSlopeSide)"
                    stroke={swatch.secondary}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {shape.id === "dutch-gable" && (
                    <polygon
                      points={`352,${94 - pitchHeightOffset} 388,${
                        115 - pitchHeightOffset
                      } 366,${126 - pitchHeightOffset}`}
                      fill="#f8fafc"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              ) : shape.id === "gambrel" || shape.id === "mansard" ? (
                /* Gambrel / Mansard Double-Slope Roof */
                <g>
                  {/* Upper Gentle Slope */}
                  <polygon
                    points={`208,${128 - pitchHeightOffset} 404,${
                      96 - pitchHeightOffset
                    } 386,${130 - pitchHeightOffset * 0.5} 188,${
                      162 - pitchHeightOffset * 0.5
                    }`}
                    fill="url(#roofSlopeFront)"
                    stroke={swatch.secondary}
                    strokeWidth="1.8"
                  />
                  {/* Lower Steep Curb Slope */}
                  <polygon
                    points={`188,${162 - pitchHeightOffset * 0.5} 386,${
                      130 - pitchHeightOffset * 0.5
                    } 382,168 158,202`}
                    fill="url(#roofSurfacePattern)"
                    stroke={swatch.secondary}
                    strokeWidth="2"
                  />
                  {/* Back Right Slope */}
                  <polygon
                    points={`404,${96 - pitchHeightOffset} 442,${
                      134 - pitchHeightOffset * 0.5
                    } 462,196 382,168 386,${130 - pitchHeightOffset * 0.5}`}
                    fill="url(#roofSlopeSide)"
                    stroke={swatch.secondary}
                    strokeWidth="1.8"
                  />
                </g>
              ) : (
                /* Classic Gable Roof (Default) */
                <g>
                  {/* Back/Right Slope */}
                  <polygon
                    points={`414,${102 - pitchHeightOffset} 464,196 382,166`}
                    fill="url(#roofSlopeSide)"
                    stroke={swatch.secondary}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Main Front Slope */}
                  <polygon
                    points={`158,200 214,${132 - pitchHeightOffset} 414,${
                      102 - pitchHeightOffset
                    } 382,166`}
                    fill="url(#roofSurfacePattern)"
                    stroke={swatch.secondary}
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Cutaway Layer Inspection Overlay (if enabled) */}
              {showCutawayLayers && (
                <g>
                  {/* OSB Timber Decking Layer */}
                  <polygon
                    points={`168,194 202,${148 - pitchHeightOffset * 0.7} 275,${
                      136 - pitchHeightOffset * 0.7
                    } 250,181`}
                    fill="url(#osbDeckPattern)"
                    stroke="#92400e"
                    strokeWidth="1.5"
                  />
                  {/* Ice & Water + Synthetic Underlayment Layer */}
                  <polygon
                    points={`195,190 222,${150 - pitchHeightOffset * 0.7} 298,${
                      138 - pitchHeightOffset * 0.7
                    } 276,177`}
                    fill="#1e293b"
                    stroke="#38bdf8"
                    strokeWidth="1.4"
                  />
                  {/* Layer Callout Labels */}
                  <g transform="translate(115, 76)">
                    <rect
                      x="0"
                      y="0"
                      width="136"
                      height="42"
                      rx="5"
                      fill="rgba(255,255,255,0.95)"
                      stroke="#0284c7"
                      strokeWidth="1.2"
                    />
                    <text
                      x="8"
                      y="15"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      1. OSB Roof Deck + Rafters
                    </text>
                    <text
                      x="8"
                      y="27"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#0284c7"
                    >
                      2. Ice & Water Barrier
                    </text>
                    <text
                      x="8"
                      y="38"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#334155"
                    >
                      3. {style.titlePrefix} {style.titleSuffix}
                    </text>
                  </g>
                </g>
              )}

              {/* Skylight Add-on Preview */}
              {hasSkylight && (
                <g>
                  <polygon
                    points={`285,${146 - pitchHeightOffset * 0.6} 324,${
                      140 - pitchHeightOffset * 0.6
                    } 314,${164 - pitchHeightOffset * 0.3} 275,${
                      170 - pitchHeightOffset * 0.3
                    }`}
                    fill="#38bdf8"
                    fillOpacity="0.82"
                    stroke="#f8fafc"
                    strokeWidth="2.4"
                  />
                  <line
                    x1="290"
                    y1={148 - pitchHeightOffset * 0.6}
                    x2="308"
                    y2={162 - pitchHeightOffset * 0.3}
                    stroke="rgba(255,255,255,0.75)"
                    strokeWidth="1.6"
                  />
                </g>
              )}

              {/* Ridge Cap & Continuous Ridge Vent */}
              {shape.id !== "shed" && (
                <line
                  x1={shape.id === "hip" ? 226 : 214}
                  y1={
                    shape.id === "hip"
                      ? 114 - pitchHeightOffset
                      : 132 - pitchHeightOffset
                  }
                  x2={shape.id === "hip" ? 352 : 414}
                  y2={
                    shape.id === "hip"
                      ? 94 - pitchHeightOffset
                      : 102 - pitchHeightOffset
                  }
                  stroke={hasRidgeVent ? "#1e293b" : swatch.secondary}
                  strokeWidth={hasRidgeVent ? "6.5" : "4.5"}
                  strokeLinecap="round"
                />
              )}

              {/* Eave Fascia Trim & Seamless Aluminum Gutter + Downspout */}
              <line
                x1="157"
                y1="201"
                x2="383"
                y2="167"
                stroke={hasGutters ? "#0284c7" : "#f8fafc"}
                strokeWidth={hasGutters ? "5" : "3"}
                strokeLinecap="round"
              />
              {hasGutters && (
                <path
                  d="M 378 168 L 378 265 L 386 272"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Scale Reference Human Silhouette (6'0") */}
              {showScalePerson && (
                <g transform="translate(106, 226)">
                  <circle cx="14" cy="12" r="7" fill="#334155" />
                  <path
                    d="M6 22 C6 20 22 20 22 22 L24 50 L19 50 L18 32 L17 78 L11 78 L10 52 L9 78 L3 78 L4 32 L3 50 L-1 50 Z"
                    fill="#334155"
                  />
                  <line
                    x1="30"
                    y1="5"
                    x2="30"
                    y2="78"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x="34"
                    y="45"
                    fontSize="10"
                    fontWeight="600"
                    fill="#0284c7"
                  >
                    6&apos;0&quot;
                  </text>
                </g>
              )}

              {/* Dimension Annotations in 3D View */}
              {showDimensions && (
                <g>
                  {/* Roof Length Callout */}
                  <line
                    x1="155"
                    y1="340"
                    x2="385"
                    y2="302"
                    stroke="#64748b"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x="232"
                    y="311"
                    width="82"
                    height="20"
                    rx="4"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                  />
                  <text
                    x="273"
                    y="324"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="600"
                    fill="#334155"
                  >
                    ~{approxLengthFt} ft Length
                  </text>

                  {/* Span / Width Callout */}
                  <line
                    x1="392"
                    y1="300"
                    x2="472"
                    y2="262"
                    stroke="#64748b"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x="412"
                    y="272"
                    width="74"
                    height="20"
                    rx="4"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                  />
                  <text
                    x="449"
                    y="285"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="600"
                    fill="#334155"
                  >
                    ~{approxWidthFt} ft Span
                  </text>

                  {/* Sloped Roof Area Badge */}
                  <g transform="translate(225, 36)">
                    <rect
                      x="0"
                      y="0"
                      width="175"
                      height="24"
                      rx="12"
                      fill="#f0f9ff"
                      stroke="#bae6fd"
                    />
                    <text
                      x="87"
                      y="15.5"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#0369a1"
                    >
                      {estimate.effectiveSlopedSqFt.toLocaleString()} sq ft •{" "}
                      {pitch.ratio} Pitch
                    </text>
                  </g>
                </g>
              )}
            </g>
          )}

          {viewMode === "front" && (
            /* FRONT ARCHITECTURAL ELEVATION VIEW */
            <g>
              {/* Grid lines */}
              {[80, 140, 200, 260, 320].map((y) => (
                <line
                  key={y}
                  x1="70"
                  y1={y}
                  x2="550"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              ))}

              {/* Ground Line */}
              <line
                x1="80"
                y1="320"
                x2="540"
                y2="320"
                stroke="#475569"
                strokeWidth="2.5"
              />

              {/* House Front Wall */}
              <rect
                x="140"
                y="195"
                width="340"
                height="125"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Front Door & Symmetrical Windows */}
              <rect
                x="290"
                y="245"
                width="40"
                height="75"
                fill="#e2e8f0"
                stroke="#475569"
                strokeWidth="1.8"
              />
              <rect
                x="180"
                y="225"
                width="65"
                height="50"
                fill="#e0f2fe"
                stroke="#64748b"
                strokeWidth="1.8"
              />
              <rect
                x="375"
                y="225"
                width="65"
                height="50"
                fill="#e0f2fe"
                stroke="#64748b"
                strokeWidth="1.8"
              />

              {/* Front Elevation Roof Polygon */}
              <polygon
                points={
                  shape.id === "shed"
                    ? `115,${135 - pitchHeightOffset} 505,195 115,195`
                    : shape.id === "hip" || shape.id === "dutch-gable"
                    ? `115,195 215,${110 - pitchHeightOffset} 405,${
                        110 - pitchHeightOffset
                      } 505,195`
                    : `115,195 310,${95 - pitchHeightOffset} 505,195`
                }
                fill="url(#roofSurfacePattern)"
                stroke={swatch.secondary}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Dimension lines for Front View */}
              <line
                x1="115"
                y1="345"
                x2="505"
                y2="345"
                stroke="#0284c7"
                strokeWidth="1.5"
              />
              <text
                x="310"
                y="362"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#0284c7"
              >
                Front Elevation Width: {approxLengthFt} ft (
                {estimate.effectiveSlopedSqFt.toLocaleString()} sq ft total roof
                area)
              </text>
              <text
                x="310"
                y="58"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#334155"
              >
                Front Elevation • {style.titlePrefix} {style.titleSuffix} (
                {pitch.ratio} Slope / {pitch.angleDeg}°)
              </text>
            </g>
          )}

          {viewMode === "back" && (
            /* BACK ELEVATION & DRAINAGE / FLASHING VIEW */
            <g>
              <line
                x1="80"
                y1="320"
                x2="540"
                y2="320"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <rect
                x="140"
                y="195"
                width="340"
                height="125"
                fill="#f1f5f9"
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Rear Patio Sliding Doors */}
              <rect
                x="235"
                y="230"
                width="150"
                height="90"
                fill="#e0f2fe"
                stroke="#64748b"
                strokeWidth="2"
              />
              <line
                x1="310"
                y1="230"
                x2="310"
                y2="320"
                stroke="#64748b"
                strokeWidth="1.8"
              />

              {/* Rear Roof Plane */}
              <polygon
                points={`115,195 205,${108 - pitchHeightOffset} 415,${
                  108 - pitchHeightOffset
                } 505,195`}
                fill="url(#roofSurfacePattern)"
                stroke={swatch.secondary}
                strokeWidth="3"
              />

              {/* Plumbing Vent Stack & Chimney Flashing Details on Back Slope */}
              <rect
                x="230"
                y={115 - pitchHeightOffset}
                width="10"
                height="26"
                fill="#334155"
              />
              <rect
                x="385"
                y={92 - pitchHeightOffset}
                width="32"
                height="48"
                fill="#991b1b"
                stroke="#450a0a"
                strokeWidth="1.5"
              />

              {/* Rear Gutter & Downspout Callout */}
              <line
                x1="115"
                y1="196"
                x2="505"
                y2="196"
                stroke="#0284c7"
                strokeWidth="4.5"
              />
              <line
                x1="145"
                y1="198"
                x2="145"
                y2="320"
                stroke="#0284c7"
                strokeWidth="3.5"
              />
              <line
                x1="475"
                y1="198"
                x2="475"
                y2="320"
                stroke="#0284c7"
                strokeWidth="3.5"
              />

              <text
                x="310"
                y="58"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#334155"
              >
                Back Elevation • Vent Boots, Step Flashing & Rear Drainage (
                {estimate.perimeterLinearFt} lin. ft perimeter)
              </text>
              <text
                x="310"
                y="355"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="600"
                fill="#475569"
              >
                Includes {estimate.wastePct}% waste allowance (
                {estimate.totalWithWasteSqFt.toLocaleString()} sq ft total
                material ordered)
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Subtle Bottom Interactive Hint Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-12 pt-1">
        <span>
          {viewMode === "3d"
            ? "Drag roof to rotate 3D • Click camera icon for deck cutaway"
            : `${viewMode.toUpperCase()} architectural elevation view`}
        </span>
        <span className="font-medium text-slate-500">
          {estimate.roofingSquares} Squares ({estimate.bundlesOrPanelsCount}{" "}
          bundles)
        </span>
      </div>
    </div>
  );
}

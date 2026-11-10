"use client";

import React, { useState, useMemo } from "react";
import {
  ADDON_OPTIONS,
   calculateRoofEstimate,
  ColorSwatch,
  PITCH_OPTIONS,
  PRODUCT_CATEGORIES,
  ROOF_SHAPES,
  ROOF_STYLES,
  RoofProductCategory,
  RoofShapeOption,
  RoofStyleOption,
} from "@/data/roofingData";
import { RoofVisualizer } from "./RoofVisualizer";
import { ShapeThumbnail, StyleThumbnail } from "./StyleThumbnail";
import {
  RotateCcw,
  HelpCircle,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  Ruler,
  Calculator,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function RoofingEstimator() {
  // Roof Size / Feet State
  const [inputMode, setInputMode] = useState<"sqft" | "dimensions">("sqft");
  const [footprintSqFt, setFootprintSqFt] = useState<number>(1800);
  const [sqftInputText, setSqftInputText] = useState<string>("1800");
  const [sqftError, setSqftError] = useState<string>("");

  const [lengthFt, setLengthFt] = useState<number>(45);
  const [widthFt, setWidthFt] = useState<number>(40);

  // Product Filter & ZIP Code
  const [productCategory, setProductCategory] =
    useState<RoofProductCategory>("all");
  const [zipCode, setZipCode] = useState<string>("94014");
  const [zipError, setZipError] = useState<string>("");

  // Active Right-Panel Configurator Tab
  const [activeTab, setActiveTab] = useState<"style" | "shape" | "addons">(
    "style"
  );

  // Selected Style, Swatch, Shape, Pitch, Stories, Add-ons
  const [selectedStyle, setSelectedStyle] = useState<RoofStyleOption>(
    ROOF_STYLES[0]
  );
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch>(
    ROOF_STYLES[0].swatches[0]
  );
  const [selectedShape, setSelectedShape] = useState<RoofShapeOption>(
    ROOF_SHAPES[0]
  );
  const [selectedPitchId, setSelectedPitchId] = useState<string>("6:12");
  const [stories, setStories] = useState<1 | 2 | 3>(1);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    ADDON_OPTIONS.filter((a) => a.defaultSelected).map((a) => a.id)
  );
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);

  const selectedPitch = useMemo(
    () =>
      PITCH_OPTIONS.find((p) => p.id === selectedPitchId) || PITCH_OPTIONS[2],
    [selectedPitchId]
  );

  const filteredStyles = useMemo(() => {
    if (productCategory === "all") return ROOF_STYLES;
    return ROOF_STYLES.filter((s) => s.category === productCategory);
  }, [productCategory]);

  const estimate = useMemo(
    () =>
      calculateRoofEstimate({
        footprintSqFt,
        lengthFt,
        widthFt,
        inputMode,
        style: selectedStyle,
        shape: selectedShape,
        pitch: selectedPitch,
        selectedAddonIds,
        zipCode,
        stories,
      }),
    [
      footprintSqFt,
      lengthFt,
      widthFt,
      inputMode,
      selectedStyle,
      selectedShape,
      selectedPitch,
      selectedAddonIds,
      zipCode,
      stories,
    ]
  );

  const handleSelectStyle = (style: RoofStyleOption) => {
    setSelectedStyle(style);
    setSelectedSwatch(style.swatches[0]);
  };

  const handleCycleStyle = () => {
    const currentIndex = ROOF_STYLES.findIndex(
      (s) => s.id === selectedStyle.id
    );
    const nextStyle = ROOF_STYLES[(currentIndex + 1) % ROOF_STYLES.length];
    handleSelectStyle(nextStyle);
  };

  const handleResetAll = () => {
    setInputMode("sqft");
    setFootprintSqFt(1800);
    setSqftInputText("1800");
    setSqftError("");
    setLengthFt(45);
    setWidthFt(40);
    setProductCategory("all");
    setZipCode("94014");
    setZipError("");
    setSelectedStyle(ROOF_STYLES[0]);
    setSelectedSwatch(ROOF_STYLES[0].swatches[0]);
    setSelectedShape(ROOF_SHAPES[0]);
    setSelectedPitchId("6:12");
    setStories(1);
    setSelectedAddonIds(
      ADDON_OPTIONS.filter((a) => a.defaultSelected).map((a) => a.id)
    );
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const stepActiveTab = (direction: -1 | 1) => {
    const tabs: ("style" | "shape" | "addons")[] = ["style", "shape", "addons"];
    const idx = tabs.indexOf(activeTab);
    const nextIdx = (idx + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIdx]);
  };

  // Validate Sq Ft on Blur, clear on Input (Modern Web Guidance `forms`)
  const handleSqftInputChange = (val: string) => {
    setSqftInputText(val);
    const num = Number(val.replace(/,/g, ""));
    if (!Number.isNaN(num) && num >= 100 && num <= 25000) {
      setFootprintSqFt(num);
      if (sqftError) setSqftError("");
    }
  };

  const handleSqftBlur = () => {
    const num = Number(sqftInputText.replace(/,/g, ""));
    if (Number.isNaN(num) || num < 100 || num > 25000) {
      setSqftError("Please enter a roof area between 100 and 25,000 sq ft.");
    } else {
      setSqftError("");
      setFootprintSqFt(Math.round(num));
      setSqftInputText(String(Math.round(num)));
    }
  };

  // Validate ZIP on Blur, clear on Input (Modern Web Guidance `forms`)
  const handleZipChange = (val: string) => {
    setZipCode(val);
    if (/^\d{5}$/.test(val.trim()) && zipError) {
      setZipError("");
    }
  };

  const handleZipBlur = () => {
    if (zipCode.trim() !== "" && !/^\d{5}$/.test(zipCode.trim())) {
      setZipError("Enter a valid 5-digit US ZIP code (e.g. 94014).");
    } else {
      setZipError("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-16">
      {/* Clean Light Theme Top Navigation Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center text-white font-bold shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                RoofCraft{" "}
                <span className="font-normal text-slate-500">
                  3D Studio &amp; Cost Estimator
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interactive Roof Preview • Real-Time Material &amp; Labor
                Calculator
              </p>
            </div>
          </div>

          {/* Live Header Estimate Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500">Region:</span>
              <span className="font-semibold text-slate-800">
                {estimate.regionName} ({zipCode || "US"})
              </span>
            </div>

            <div className="bg-sky-50 border border-sky-200/90 rounded-lg px-3.5 py-1.5 flex items-center gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-sky-700">
                  Estimated Total
                </div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  ${estimate.totalCost.toLocaleString()}
                </div>
              </div>
              <div className="h-7 w-px bg-sky-200 hidden sm:block" />
              <div className="hidden sm:block text-right">
                <div className="text-[11px] font-semibold text-sky-800">
                  ${estimate.costPerSqFt.toFixed(2)} / ft²
                </div>
                <div className="text-[10px] text-slate-500">
                  {estimate.effectiveSlopedSqFt.toLocaleString()} sq ft sloped
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Column Configurator Workspace (Matching Reference Image Layout) */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: 3D/2D Interactive Preview + Estimate Summary + Technical Details Accordion */}
          <div className="lg:col-span-6 flex flex-col gap-4 lg:sticky lg:top-22">
            <RoofVisualizer
              style={selectedStyle}
              swatch={selectedSwatch}
              onSelectSwatch={setSelectedSwatch}
              shape={selectedShape}
              pitch={selectedPitch}
              estimate={estimate}
              hasGutters={selectedAddonIds.includes("gutters")}
              hasSkylight={selectedAddonIds.includes("skylight")}
              hasRidgeVent={selectedAddonIds.includes("ridge-vent")}
              onCycleStyle={handleCycleStyle}
            />

            {/* Live Cost Estimate Summary Card */}
            <section
              aria-label="Live Roofing Cost Estimate"
              className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284c7] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Roofing Estimate</span>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                      ${estimate.totalCost.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Est. Range: ${estimate.lowRangeCost.toLocaleString()} – $
                      {estimate.highRangeCost.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Includes{" "}
                    <strong className="text-slate-700 font-semibold">
                      {selectedStyle.titlePrefix} {selectedStyle.titleSuffix}
                    </strong>{" "}
                    ({selectedSwatch.name}) on a{" "}
                    <strong className="text-slate-700 font-semibold">
                      {estimate.effectiveSlopedSqFt.toLocaleString()} sq ft
                    </strong>{" "}
                    {selectedShape.titleSuffix.toLowerCase()} ({selectedPitch.ratio}{" "}
                    pitch).
                  </p>
                </div>

                <div className="flex flex-col items-end bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 py-2">
                  <span className="text-[11px] text-slate-500">
                    Price per Sq Ft
                  </span>
                  <span className="text-lg font-bold text-[#0284c7]">
                    ${estimate.costPerSqFt.toFixed(2)} / ft²
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ~${estimate.monthlyPaymentEst.toLocaleString()}/mo financing
                  </span>
                </div>
              </div>

              {/* Visual Cost Breakdown Bar */}
              <div className="mt-4">
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    style={{
                      width: `${Math.round(
                        (estimate.materialCost / estimate.totalCost) * 100
                      )}%`,
                    }}
                    className="bg-[#0284c7] transition-all duration-300"
                    title="Roofing Materials"
                  />
                  <div
                    style={{
                      width: `${Math.round(
                        (estimate.laborCost / estimate.totalCost) * 100
                      )}%`,
                    }}
                    className="bg-[#38bdf8] transition-all duration-300"
                    title="Certified Installation Labor"
                  />
                  <div
                    style={{
                      width: `${Math.max(
                        4,
                        100 -
                          Math.round(
                            (estimate.materialCost / estimate.totalCost) * 100
                          ) -
                          Math.round(
                            (estimate.laborCost / estimate.totalCost) * 100
                          )
                      )}%`,
                    }}
                    className="bg-[#4ca87a] transition-all duration-300"
                    title="Tear-off, Underlayment & Add-ons"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                      <span>Materials ({estimate.wastePct}% waste)</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      ${estimate.materialCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                      <span>Installation Labor</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      ${estimate.laborCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#4ca87a]" />
                      <span>Prep &amp; Add-ons</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      ${estimate.addonsCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#4ca87a]" />
                  <span>
                    Warranty:{" "}
                    <strong className="text-slate-800">
                      {selectedStyle.warrantyYears}
                    </strong>{" "}
                    • Lifespan:{" "}
                    <strong className="text-slate-800">
                      {selectedStyle.lifespanYears}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-md shadow-2xs transition cursor-pointer"
                  >
                    <span>View Itemized Breakdown</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Technical details Accordion (Matching Screenshot + Modern Web Guidance `<details>` pattern) */}
            <div aria-label="Roofing Specifications and Details" className="space-y-3">
              <details className="group bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-slate-50/70 transition">
                  <span className="text-base font-bold text-slate-900">
                    Technical details
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-slate-500 transition-transform duration-200"
                  >
                    <Plus className="w-4 h-4 group-open:hidden" />
                    <Minus className="w-4 h-4 hidden group-open:block" />
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Flat Footprint Area
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {estimate.baseFootprintSqFt.toLocaleString()} sq ft
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Sloped Roof Area ({selectedPitch.ratio})
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {estimate.effectiveSlopedSqFt.toLocaleString()} sq ft
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Total Order (+{estimate.wastePct}% Waste)
                      </div>
                      <div className="text-sm font-bold text-[#0284c7] mt-0.5">
                        {estimate.totalWithWasteSqFt.toLocaleString()} sq ft
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Roofing Squares (100 ft²)
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {estimate.roofingSquares} Squares
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Est. Bundles / Panels
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {estimate.bundlesOrPanelsCount} Units
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Perimeter &amp; Ridge Length
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {estimate.perimeterLinearFt} ft / {estimate.ridgeLinearFt}{" "}
                        ft
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Wind Resistance Rating
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        Up to {selectedStyle.windRatingMph} mph
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Fire &amp; Impact Rating
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedStyle.fireRating} • UL 2218
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 text-[11px]">
                        Dead Load Weight
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedStyle.weightLbsPerSquare} lbs / square
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* RIGHT COLUMN: "Choose your style" & Feet Input Card (Matching Screenshot) */}
          <div className="lg:col-span-6">
            <form
              aria-labelledby="configurator-heading"
              onSubmit={(e) => e.preventDefault()}
              className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_16px_rgba(15,23,42,0.04)] p-5 sm:p-7"
            >
              {/* Header: Choose your style */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2
                  id="configurator-heading"
                  className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Choose your style
                </h2>
                <span className="text-xs font-medium text-[#0284c7] bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-full">
                  Step-by-step Estimator
                </span>
              </div>

              {/* PRODUCT Dropdown & ZIP CODE Row (Exact match to screenshot layout) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="product-category-select"
                    className="uppercase tracking-wider text-slate-400 font-semibold"
                  >
                    PRODUCT:
                  </label>
                  <select
                    id="product-category-select"
                    name="productCategory"
                    value={productCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value as RoofProductCategory;
                      setProductCategory(nextCat);
                      setActiveTab("style");
                      if (nextCat !== "all") {
                        const firstMatch = ROOF_STYLES.find(
                          (s) => s.category === nextCat
                        );
                        if (firstMatch) handleSelectStyle(firstMatch);
                      }
                    }}
                    className="font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 rounded px-2 py-1 cursor-pointer"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="zip-code-input"
                      className="uppercase tracking-wider text-slate-400 font-semibold"
                    >
                      ZIP CODE:
                    </label>
                    <input
                      id="zip-code-input"
                      name="zipCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      pattern="\d{5}"
                      maxLength={5}
                      enterKeyHint="done"
                      value={zipCode}
                      onChange={(e) => handleZipChange(e.target.value)}
                      onBlur={handleZipBlur}
                      aria-invalid={zipError ? "true" : "false"}
                      aria-describedby="zip-help"
                      className="w-20 font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center text-xs"
                    />
                  </div>
                  <span
                    id="zip-help"
                    className={`text-[11px] mt-0.5 ${
                      zipError ? "text-red-600 font-medium" : "text-slate-400"
                    }`}
                  >
                    {zipError || `5-digit ZIP (${estimate.zipMultiplier}x regional index)`}
                  </span>
                </div>
              </div>

              {/* ROOF FEET / DIMENSIONS INPUT SECTION */}
              <fieldset className="my-5 bg-slate-50/80 border border-slate-200/90 rounded-xl p-4">
                <legend className="px-2 text-xs font-bold uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>1. Enter Roof Size in Feet</span>
                </legend>

                {/* Input Mode Switcher: Total Sq Ft vs Length x Width Ft */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode("sqft")}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        inputMode === "sqft"
                          ? "bg-[#0284c7] text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Total Area (Sq Ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("dimensions")}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        inputMode === "dimensions"
                          ? "bg-[#0284c7] text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Length × Width (Feet)
                    </button>
                  </div>

                  {/* Quick Home Presets */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400 mr-1">Presets:</span>
                    {[
                      { label: "1,200 ft²", sqft: 1200 },
                      { label: "1,800 ft²", sqft: 1800 },
                      { label: "2,500 ft²", sqft: 2500 },
                      { label: "3,400 ft²", sqft: 3400 },
                    ].map((preset) => (
                      <button
                        key={preset.sqft}
                        type="button"
                        onClick={() => {
                          setInputMode("sqft");
                          setFootprintSqFt(preset.sqft);
                          setSqftInputText(String(preset.sqft));
                          setSqftError("");
                        }}
                        className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                          inputMode === "sqft" && footprintSqFt === preset.sqft
                            ? "bg-sky-100 border-sky-400 text-sky-900 font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {inputMode === "sqft" ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label
                          htmlFor="roof-sqft-input"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Roof Footprint Area (100 – 25,000 sq ft):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="roof-sqft-input"
                            name="footprintSqFt"
                            type="text"
                            inputMode="numeric"
                            value={sqftInputText}
                            onChange={(e) =>
                              handleSqftInputChange(e.target.value)
                            }
                            onBlur={handleSqftBlur}
                            aria-invalid={sqftError ? "true" : "false"}
                            aria-describedby="sqft-helper"
                            className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900"
                          />
                          <span className="text-xs font-semibold text-slate-500">
                            sq ft
                          </span>
                          <input
                            type="range"
                            id="roof-sqft-slider"
                            name="footprintSqFtSlider"
                            aria-label="Adjust roof square footage slider"
                            min={400}
                            max={6000}
                            step={50}
                            value={Math.min(6000, Math.max(400, footprintSqFt))}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setFootprintSqFt(v);
                              setSqftInputText(String(v));
                              setSqftError("");
                            }}
                            className="flex-1 accent-[#0284c7] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      id="sqft-helper"
                      className={`text-[11px] ${
                        sqftError ? "text-red-600 font-medium" : "text-slate-500"
                      }`}
                    >
                      {sqftError ||
                        `With ${selectedPitch.ratio} pitch (${selectedPitch.areaMultiplier}x slope factor), true roof surface is ${estimate.effectiveSlopedSqFt.toLocaleString()} sq ft.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label
                        htmlFor="roof-length-ft"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Building Length (ft):
                      </label>
                      <input
                        id="roof-length-ft"
                        name="lengthFt"
                        type="number"
                        min={10}
                        max={250}
                        value={lengthFt}
                        onChange={(e) =>
                          setLengthFt(Math.max(10, Number(e.target.value) || 10))
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="roof-width-ft"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Building Width (ft):
                      </label>
                      <input
                        id="roof-width-ft"
                        name="widthFt"
                        type="number"
                        min={10}
                        max={250}
                        value={widthFt}
                        onChange={(e) =>
                          setWidthFt(Math.max(10, Number(e.target.value) || 10))
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                      <div className="text-slate-400 text-[10px]">
                        Calculated Area
                      </div>
                      <div className="font-bold text-[#0284c7]">
                        {estimate.baseFootprintSqFt.toLocaleString()} ft² flat →{" "}
                        {estimate.effectiveSlopedSqFt.toLocaleString()} ft²
                      </div>
                    </div>
                  </div>
                )}

                {/* Pitch / Slope & Stories Compact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/80">
                  <div>
                    <label
                      htmlFor="roof-pitch-select"
                      className="block text-[11px] font-semibold text-slate-600 mb-1"
                    >
                      Roof Pitch (Slope Steepness):
                    </label>
                    <select
                      id="roof-pitch-select"
                      name="roofPitch"
                      value={selectedPitchId}
                      onChange={(e) => setSelectedPitchId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      {PITCH_OPTIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} — {p.areaMultiplier}x Area
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Home Height / Access:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([1, 2, 3] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStories(st)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                            stories === st
                              ? "bg-sky-50 border-[#0284c7] text-[#0284c7]"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {st} {st === 1 ? "Story" : "Stories"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Toolbar Action Row (Matching Reference Screenshot: Blue Package Button + Green Reset + Secondary Button + Arrows) */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("style")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                      activeTab === "style"
                        ? "bg-[#0070cc] text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>Roof Package</span>
                    <HelpCircle className="w-3.5 h-3.5 opacity-90" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAll}
                    title="Reset estimator to default configuration"
                    aria-label="Reset estimator to default configuration"
                    className="p-2 rounded-md bg-[#4ca87a] hover:bg-[#3f9168] text-white shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("shape")}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold transition border cursor-pointer ${
                      activeTab === "shape"
                        ? "bg-[#0070cc] text-white border-[#0070cc] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Roof Shape
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("addons")}
                    className={`px-3 py-2 rounded-md text-xs font-semibold transition border cursor-pointer ${
                      activeTab === "addons"
                        ? "bg-[#0070cc] text-white border-[#0070cc] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Gutters &amp; Prep ({selectedAddonIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab((prev) =>
                        prev === "addons" ? "style" : "addons"
                      )
                    }
                    title="More configuration options"
                    aria-label="More configuration options"
                    className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <div className="inline-flex rounded-md border border-slate-200 bg-slate-50/70 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => stepActiveTab(-1)}
                      title="Previous category"
                      aria-label="Previous category"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white border-r border-slate-200 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepActiveTab(1)}
                      title="Next category"
                      aria-label="Next category"
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TAB 1: ROOF MATERIAL STYLE CARDS (3-Column Grid Matching Screenshot) */}
              {activeTab === "style" && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredStyles.map((styleItem) => {
                      const isSelected = selectedStyle.id === styleItem.id;
                      const combinedPerSqFt = (
                        styleItem.materialCostPerSqFt +
                        styleItem.laborCostPerSqFt
                      ).toFixed(2);
                      return (
                        <button
                          key={styleItem.id}
                          type="button"
                          onClick={() => handleSelectStyle(styleItem)}
                          aria-pressed={isSelected}
                          className={`group text-left flex flex-col rounded-xl p-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-[#3b82f6] bg-sky-50/35 shadow-xs"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Square Graphic Box with Blue Architectural Illustration */}
                          <div
                            className={`w-full aspect-square rounded-lg bg-white border flex flex-col items-center justify-center p-3 mb-2.5 transition ${
                              isSelected
                                ? "border-[#3b82f6] shadow-2xs"
                                : "border-slate-200 group-hover:border-slate-300"
                            }`}
                          >
                            <StyleThumbnail
                              patternType={styleItem.patternType}
                            />
                            <span className="mt-1.5 text-[10px] font-semibold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-full">
                              ~${combinedPerSqFt} / ft²
                            </span>
                          </div>

                          {/* Card Title (Regular Prefix + Bold Suffix like Screenshot) */}
                          <div className="text-[13px] text-slate-800 leading-snug mb-1">
                            <span>{styleItem.titlePrefix} - </span>
                            <strong className="font-bold text-slate-900">
                              {styleItem.titleSuffix}
                            </strong>
                          </div>

                          {/* Italicized Short Description (Like Screenshot) */}
                          <p className="text-[11.5px] italic text-slate-500 leading-relaxed">
                            {styleItem.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: ROOF SHAPE / ARCHITECTURAL GEOMETRY CARDS */}
              {activeTab === "shape" && (
                <div>
                  <p className="text-xs text-slate-500 mb-3">
                    Select your roof&apos;s architectural geometry. Complex shapes
                    with hips and valleys adjust material waste and labor.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ROOF_SHAPES.map((shapeItem) => {
                      const isSelected = selectedShape.id === shapeItem.id;
                      return (
                        <button
                          key={shapeItem.id}
                          type="button"
                          onClick={() => setSelectedShape(shapeItem)}
                          aria-pressed={isSelected}
                          className={`group text-left flex flex-col rounded-xl p-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-[#3b82f6] bg-sky-50/35 shadow-xs"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          <div
                            className={`w-full aspect-square rounded-lg bg-white border flex flex-col items-center justify-center p-3 mb-2.5 transition ${
                              isSelected
                                ? "border-[#3b82f6]"
                                : "border-slate-200 group-hover:border-slate-300"
                            }`}
                          >
                            <ShapeThumbnail shapeId={shapeItem.id} />
                            <span className="mt-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {shapeItem.complexityMultiplier}x Complexity
                            </span>
                          </div>

                          <div className="text-[13px] text-slate-800 leading-snug mb-1">
                            <span>{shapeItem.titlePrefix} - </span>
                            <strong className="font-bold text-slate-900">
                              {shapeItem.titleSuffix}
                            </strong>
                          </div>

                          <p className="text-[11.5px] italic text-slate-500 leading-relaxed">
                            {shapeItem.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: GUTTERS, TEAR-OFF & UNDERLAYMENT ADD-ONS */}
              {activeTab === "addons" && (
                <fieldset className="space-y-3">
                  <legend className="text-xs text-slate-500 mb-2">
                    Customize tear-off, underlayment protection, ventilation,
                    and perimeter gutters:
                  </legend>
                  {ADDON_OPTIONS.map((addon) => {
                    const checked = selectedAddonIds.includes(addon.id);
                    const itemCost =
                      addon.pricingType === "per_sqft"
                        ? Math.round(
                            estimate.effectiveSlopedSqFt *
                              addon.unitPrice *
                              estimate.zipMultiplier
                          )
                        : addon.pricingType === "per_perimeter_ft"
                        ? Math.round(
                            estimate.perimeterLinearFt *
                              addon.unitPrice *
                              estimate.zipMultiplier
                          )
                        : Math.round(addon.unitPrice * estimate.zipMultiplier);

                    return (
                      <div
                        key={addon.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition ${
                          checked
                            ? "bg-sky-50/40 border-[#0284c7]"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`addon-${addon.id}`}
                          name={`addon_${addon.id}`}
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-1 w-4 h-4 accent-[#0284c7] rounded cursor-pointer"
                        />
                        <label
                          htmlFor={`addon-${addon.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {addon.title}
                            </span>
                            <span className="text-xs font-bold text-[#0284c7] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                              +${itemCost.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs italic text-slate-500 mt-0.5">
                            {addon.description}
                          </p>
                        </label>
                      </div>
                    );
                  })}
                </fieldset>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Itemized Estimate Modal */}
      {quoteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuoteModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                  Official Estimate Summary
                </span>
                <h3
                  id="quote-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {selectedStyle.titlePrefix} {selectedStyle.titleSuffix} Roof
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">
                  Roof Dimensions &amp; Slope:
                </span>
                <span className="font-semibold text-slate-900">
                  {estimate.baseFootprintSqFt.toLocaleString()} ft² flat →{" "}
                  {estimate.effectiveSlopedSqFt.toLocaleString()} ft² sloped (
                  {selectedPitch.ratio})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">
                  Material Order (+{estimate.wastePct}% waste):
                </span>
                <span className="font-semibold text-slate-900">
                  {estimate.totalWithWasteSqFt.toLocaleString()} sq ft (
                  {estimate.roofingSquares} Squares)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">
                  {selectedStyle.titlePrefix} {selectedStyle.titleSuffix} (
                  {selectedSwatch.name}):
                </span>
                <span className="font-bold text-slate-900">
                  ${estimate.materialCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">
                  Installation Labor ({selectedShape.titleSuffix}, {stories}-Story):
                </span>
                <span className="font-bold text-slate-900">
                  ${estimate.laborCost.toLocaleString()}
                </span>
              </div>
              {estimate.addonBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-1.5 border-b border-slate-100"
                >
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ca87a]" />
                    {item.title}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${item.cost.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-base font-extrabold text-slate-900">
                <span>Estimated Total Installed Cost</span>
                <span className="text-[#0284c7]">
                  ${estimate.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
              >
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

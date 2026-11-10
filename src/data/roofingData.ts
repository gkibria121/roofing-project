export type RoofProductCategory =
  | "all"
  | "asphalt"
  | "metal"
  | "tile"
  | "wood"
  | "slate";

export type RoofShapeId =
  | "gable"
  | "hip"
  | "dutch-gable"
  | "gambrel"
  | "shed"
  | "mansard";

export interface ColorSwatch {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface RoofStyleOption {
  id: string;
  category: Exclude<RoofProductCategory, "all">;
  categoryLabel: string;
  titlePrefix: string;
  titleSuffix: string;
  description: string;
  materialCostPerSqFt: number;
  laborCostPerSqFt: number;
  lifespanYears: string;
  windRatingMph: number;
  fireRating: string;
  weightLbsPerSquare: number;
  warrantyYears: string;
  wasteFactorPct: number;
  patternType:
    | "3tab"
    | "architectural"
    | "designer-slate"
    | "standing-seam"
    | "corrugated"
    | "spanish-tile"
    | "flat-tile"
    | "cedar-shake"
    | "natural-slate";
  swatches: ColorSwatch[];
}

export interface RoofShapeOption {
  id: RoofShapeId;
  titlePrefix: string;
  titleSuffix: string;
  description: string;
  complexityMultiplier: number;
  wasteAddPct: number;
  defaultPitch: string;
}

export interface PitchOption {
  id: string;
  label: string;
  ratio: string;
  angleDeg: number;
  areaMultiplier: number;
  laborMultiplier: number;
  description: string;
}

export interface AddonOption {
  id: string;
  title: string;
  description: string;
  pricingType: "per_sqft" | "per_perimeter_ft" | "flat";
  unitPrice: number;
  defaultSelected: boolean;
}

export const PRODUCT_CATEGORIES: { id: RoofProductCategory; label: string }[] = [
  { id: "all", label: "All Roofing Materials" },
  { id: "asphalt", label: "Asphalt Shingles" },
  { id: "metal", label: "Metal Roofing" },
  { id: "tile", label: "Clay & Concrete Tile" },
  { id: "wood", label: "Cedar Wood Shake" },
  { id: "slate", label: "Natural & Quarried Slate" },
];

export const ROOF_STYLES: RoofStyleOption[] = [
  {
    id: "architectural-shingle",
    category: "asphalt",
    categoryLabel: "Asphalt Shingles",
    titlePrefix: "Architectural",
    titleSuffix: "Dimensional",
    description:
      "Dual-layered laminated shingles crafted for a sculpted, high-definition shadow look",
    materialCostPerSqFt: 3.15,
    laborCostPerSqFt: 3.1,
    lifespanYears: "30–35 Years",
    windRatingMph: 130,
    fireRating: "Class A",
    weightLbsPerSquare: 240,
    warrantyYears: "Limited Lifetime",
    wasteFactorPct: 10,
    patternType: "architectural",
    swatches: [
      {
        id: "weathered-wood",
        name: "Weathered Wood",
        primary: "#6e655f",
        secondary: "#574f4a",
        accent: "#857b74",
      },
      {
        id: "charcoal-slate",
        name: "Charcoal Black",
        primary: "#373c42",
        secondary: "#262a2e",
        accent: "#4e555d",
      },
      {
        id: "desert-tan",
        name: "Cedar Harvest",
        primary: "#8c6246",
        secondary: "#6e4b34",
        accent: "#a87959",
      },
      {
        id: "harbor-blue",
        name: "Harbor Estate Blue",
        primary: "#485b6e",
        secondary: "#354454",
        accent: "#60778f",
      },
    ],
  },
  {
    id: "3tab-traditional",
    category: "asphalt",
    categoryLabel: "Asphalt Shingles",
    titlePrefix: "Traditional",
    titleSuffix: "3-Tab Flat",
    description:
      "Single-layer fiberglass shingles with uniform cutouts made from popular materials",
    materialCostPerSqFt: 2.25,
    laborCostPerSqFt: 2.6,
    lifespanYears: "20–25 Years",
    windRatingMph: 70,
    fireRating: "Class A",
    weightLbsPerSquare: 190,
    warrantyYears: "25-Year Standard",
    wasteFactorPct: 8,
    patternType: "3tab",
    swatches: [
      {
        id: "ash-grey",
        name: "Estate Grey",
        primary: "#737982",
        secondary: "#595e66",
        accent: "#8d949e",
      },
      {
        id: "autumn-brown",
        name: "Autumn Brown",
        primary: "#7a5843",
        secondary: "#5e4332",
        accent: "#946d55",
      },
      {
        id: "onyx",
        name: "Onyx Black",
        primary: "#34373b",
        secondary: "#232528",
        accent: "#4b4f54",
      },
    ],
  },
  {
    id: "standing-seam-metal",
    category: "metal",
    categoryLabel: "Metal Roofing",
    titlePrefix: "Standing Seam",
    titleSuffix: "Vertical",
    description:
      "Concealed-fastener interlocking steel panels crafted for a sophisticated modern look",
    materialCostPerSqFt: 5.8,
    laborCostPerSqFt: 4.9,
    lifespanYears: "50–70 Years",
    windRatingMph: 150,
    fireRating: "Class A",
    weightLbsPerSquare: 125,
    warrantyYears: "50-Year Kynar 500",
    wasteFactorPct: 12,
    patternType: "standing-seam",
    swatches: [
      {
        id: "matte-slate",
        name: "Matte Galvalume Slate",
        primary: "#4d5966",
        secondary: "#38424d",
        accent: "#687687",
      },
      {
        id: "copper-penny",
        name: "Architectural Copper",
        primary: "#a65e3e",
        secondary: "#82472d",
        accent: "#c47552",
      },
      {
        id: "forest-green",
        name: "Hartford Green",
        primary: "#335443",
        secondary: "#243d30",
        accent: "#466e59",
      },
      {
        id: "polar-silver",
        name: "Cool Mill Silver",
        primary: "#8a95a1",
        secondary: "#6d7782",
        accent: "#a6b2bf",
      },
    ],
  },
  {
    id: "spanish-barrel-tile",
    category: "tile",
    categoryLabel: "Clay & Concrete Tile",
    titlePrefix: "Spanish Barrel",
    titleSuffix: "Clay Tile",
    description:
      "High-profile S-curve terracotta clay tiles with air channels for natural cooling",
    materialCostPerSqFt: 7.4,
    laborCostPerSqFt: 6.2,
    lifespanYears: "75–100 Years",
    windRatingMph: 140,
    fireRating: "Class A",
    weightLbsPerSquare: 850,
    warrantyYears: "75-Year Structural",
    wasteFactorPct: 14,
    patternType: "spanish-tile",
    swatches: [
      {
        id: "terracotta",
        name: "Classic Terracotta",
        primary: "#b85a3a",
        secondary: "#914328",
        accent: "#d47250",
      },
      {
        id: "mission-blend",
        name: "Santa Barbara Blend",
        primary: "#9e6340",
        secondary: "#78482c",
        accent: "#bd7c55",
      },
      {
        id: "sand-adobe",
        name: "Sonoran Adobe",
        primary: "#b38862",
        secondary: "#8f6a49",
        accent: "#cca078",
      },
    ],
  },
  {
    id: "cedar-wood-shake",
    category: "wood",
    categoryLabel: "Cedar Wood Shake",
    titlePrefix: "Hand Split",
    titleSuffix: "Cedar Shake",
    description:
      "Natural Western Red Cedar shakes with split-face grain and warm organic texture",
    materialCostPerSqFt: 6.9,
    laborCostPerSqFt: 5.4,
    lifespanYears: "30–40 Years",
    windRatingMph: 115,
    fireRating: "Class B (Treated)",
    weightLbsPerSquare: 280,
    warrantyYears: "30-Year Certi-Label",
    wasteFactorPct: 13,
    patternType: "cedar-shake",
    swatches: [
      {
        id: "western-cedar",
        name: "Fresh Western Cedar",
        primary: "#9c6744",
        secondary: "#784c2f",
        accent: "#b87f58",
      },
      {
        id: "silvered-driftwood",
        name: "Aged Driftwood",
        primary: "#7d7770",
        secondary: "#615c56",
        accent: "#99928a",
      },
      {
        id: "espresso-stain",
        name: "Timber Espresso",
        primary: "#5c4333",
        secondary: "#422f23",
        accent: "#785946",
      },
    ],
  },
  {
    id: "natural-quarried-slate",
    category: "slate",
    categoryLabel: "Natural & Quarried Slate",
    titlePrefix: "Quarried Stone",
    titleSuffix: "Slate Tile",
    description:
      "Hand-cleft genuine metamorphic stone tiles where every roof plane lasts a century",
    materialCostPerSqFt: 10.5,
    laborCostPerSqFt: 7.8,
    lifespanYears: "100+ Years",
    windRatingMph: 160,
    fireRating: "Class A",
    weightLbsPerSquare: 950,
    warrantyYears: "100-Year Quarry",
    wasteFactorPct: 15,
    patternType: "natural-slate",
    swatches: [
      {
        id: "vermont-slate",
        name: "Vermont Blue-Grey",
        primary: "#46515c",
        secondary: "#323a42",
        accent: "#5e6b78",
      },
      {
        id: "buckingham-black",
        name: "Buckingham Slate",
        primary: "#31353a",
        secondary: "#202326",
        accent: "#474c54",
      },
      {
        id: "heather-plum",
        name: "Royal Heather Slate",
        primary: "#574854",
        secondary: "#3f333d",
        accent: "#705e6c",
      },
    ],
  },
  {
    id: "designer-luxury-shingle",
    category: "asphalt",
    categoryLabel: "Asphalt Shingles",
    titlePrefix: "Luxury",
    titleSuffix: "Scalloped Slate",
    description:
      "Heavyweight artisan shingles with scalloped edges mimicking old-world carriage slate",
    materialCostPerSqFt: 4.5,
    laborCostPerSqFt: 3.6,
    lifespanYears: "40–50 Years",
    windRatingMph: 135,
    fireRating: "Class A",
    weightLbsPerSquare: 350,
    warrantyYears: "50-Year Platinum",
    wasteFactorPct: 11,
    patternType: "designer-slate",
    swatches: [
      {
        id: "castle-grey",
        name: "Chateau Slate",
        primary: "#555d66",
        secondary: "#3e444b",
        accent: "#6f7985",
      },
      {
        id: "tudor-bark",
        name: "Tudor Brownstone",
        primary: "#635147",
        secondary: "#4a3b34",
        accent: "#7d685c",
      },
    ],
  },
  {
    id: "corrugated-ribbed-metal",
    category: "metal",
    categoryLabel: "Metal Roofing",
    titlePrefix: "Structural",
    titleSuffix: "Ribbed Metal",
    description:
      "Exposed-fastener galvalume steel panels with reinforced trapezoidal ribs",
    materialCostPerSqFt: 3.8,
    laborCostPerSqFt: 3.3,
    lifespanYears: "40–50 Years",
    windRatingMph: 130,
    fireRating: "Class A",
    weightLbsPerSquare: 110,
    warrantyYears: "40-Year Paint",
    wasteFactorPct: 10,
    patternType: "corrugated",
    swatches: [
      {
        id: "barn-red",
        name: "Colonial Barn Red",
        primary: "#8f3931",
        secondary: "#6e2923",
        accent: "#ab4940",
      },
      {
        id: "zinc-grey",
        name: "Zinc Galvalume",
        primary: "#6d7782",
        secondary: "#545c66",
        accent: "#8894a1",
      },
    ],
  },
  {
    id: "flat-interlocking-tile",
    category: "tile",
    categoryLabel: "Clay & Concrete Tile",
    titlePrefix: "Picture Frame",
    titleSuffix: "Flat Concrete",
    description:
      "Smooth interlocking concrete tiles with crisp linear shadow lines on every course",
    materialCostPerSqFt: 5.6,
    laborCostPerSqFt: 5.1,
    lifespanYears: "50–75 Years",
    windRatingMph: 135,
    fireRating: "Class A",
    weightLbsPerSquare: 780,
    warrantyYears: "50-Year Limited",
    wasteFactorPct: 12,
    patternType: "flat-tile",
    swatches: [
      {
        id: "graphite-concrete",
        name: "Modern Graphite",
        primary: "#4a4e54",
        secondary: "#35383d",
        accent: "#62676e",
      },
      {
        id: "taupe-stone",
        name: "Warm Limestone",
        primary: "#877c70",
        secondary: "#6b6157",
        accent: "#a39689",
      },
    ],
  },
];

export const ROOF_SHAPES: RoofShapeOption[] = [
  {
    id: "gable",
    titlePrefix: "Traditional",
    titleSuffix: "Gable Roof",
    description:
      "Two classic sloping planes meeting at a central ridge; efficient drainage & minimal waste",
    complexityMultiplier: 1.0,
    wasteAddPct: 0,
    defaultPitch: "6:12",
  },
  {
    id: "hip",
    titlePrefix: "Four-Sided",
    titleSuffix: "Hip Roof",
    description:
      "All four sides slope gently downward to the walls for superior high-wind stability",
    complexityMultiplier: 1.08,
    wasteAddPct: 5,
    defaultPitch: "6:12",
  },
  {
    id: "dutch-gable",
    titlePrefix: "Architectural",
    titleSuffix: "Dutch Hip",
    description:
      "Full four-sided hip base topped with a decorative miniature gablet along the ridge",
    complexityMultiplier: 1.12,
    wasteAddPct: 6,
    defaultPitch: "6:12",
  },
  {
    id: "gambrel",
    titlePrefix: "Barn Style",
    titleSuffix: "Gambrel",
    description:
      "Symmetrical two-sided roof with dual-angle slopes on each side for maximum attic space",
    complexityMultiplier: 1.14,
    wasteAddPct: 7,
    defaultPitch: "8:12",
  },
  {
    id: "shed",
    titlePrefix: "Modern",
    titleSuffix: "Mono-Pitch Shed",
    description:
      "Single sleek sloping plane favored in contemporary architectural home additions",
    complexityMultiplier: 0.96,
    wasteAddPct: -2,
    defaultPitch: "4:12",
  },
  {
    id: "mansard",
    titlePrefix: "French Estate",
    titleSuffix: "Mansard",
    description:
      "Four-sided double-slope profile creating an elegant upper-story living envelope",
    complexityMultiplier: 1.22,
    wasteAddPct: 10,
    defaultPitch: "8:12",
  },
];

export const PITCH_OPTIONS: PitchOption[] = [
  {
    id: "3:12",
    label: "Low Slope (3/12)",
    ratio: "3:12",
    angleDeg: 14,
    areaMultiplier: 1.031,
    laborMultiplier: 0.96,
    description: "Gentle walkable incline; rises 3 inches per 12 inches of run",
  },
  {
    id: "4:12",
    label: "Moderate (4/12)",
    ratio: "4:12",
    angleDeg: 18.4,
    areaMultiplier: 1.054,
    laborMultiplier: 1.0,
    description: "Standard residential pitch; comfortable walkability",
  },
  {
    id: "6:12",
    label: "Standard (6/12)",
    ratio: "6:12",
    angleDeg: 26.6,
    areaMultiplier: 1.118,
    laborMultiplier: 1.06,
    description: "Most popular American home pitch with balanced curb appeal",
  },
  {
    id: "8:12",
    label: "Steep (8/12)",
    ratio: "8:12",
    angleDeg: 33.7,
    areaMultiplier: 1.202,
    laborMultiplier: 1.15,
    description: "Prominent architectural profile; requires safety harnesses",
  },
  {
    id: "10:12",
    label: "Very Steep (10/12)",
    ratio: "10:12",
    angleDeg: 39.8,
    areaMultiplier: 1.302,
    laborMultiplier: 1.28,
    description: "Dramatic Tudor/Victorian slope with steep-charge installation",
  },
];

export const ADDON_OPTIONS: AddonOption[] = [
  {
    id: "tear-off",
    title: "Existing Roof Tear-Off & Disposal",
    description: "Full removal of 1 layer of old shingles, magnetic nail sweep & dumpster haul-away",
    pricingType: "per_sqft",
    unitPrice: 1.35,
    defaultSelected: true,
  },
  {
    id: "synthetic-underlayment",
    title: "Ice & Water Shield + Synthetic Underlayment",
    description: "Self-adhering eaves membrane plus breathable high-tear deck barrier",
    pricingType: "per_sqft",
    unitPrice: 0.85,
    defaultSelected: true,
  },
  {
    id: "ridge-vent",
    title: "Continuous Ridge Vent & Flashing Kit",
    description: "Baffled Cobra ridge ventilation, drip edge metal & pipe boot flashings",
    pricingType: "flat",
    unitPrice: 680,
    defaultSelected: true,
  },
  {
    id: "gutters",
    title: "Seamless 6\" Aluminum Gutters & Downspouts",
    description: "Custom-extruded perimeter k-style gutters with hidden hangers",
    pricingType: "per_perimeter_ft",
    unitPrice: 9.5,
    defaultSelected: false,
  },
  {
    id: "skylight",
    title: "Skylight Curb Reflashing / Replacement",
    description: "Tempered Low-E glass skylight with step-flashing kit",
    pricingType: "flat",
    unitPrice: 1150,
    defaultSelected: false,
  },
];

export function getZipMultiplier(zip: string): {
  multiplier: number;
  regionName: string;
} {
  const clean = zip.trim();
  if (!/^\d{5}$/.test(clean)) {
    return { multiplier: 1.0, regionName: "National Average" };
  }
  const firstDigit = clean[0];
  switch (firstDigit) {
    case "9":
      if (clean.startsWith("94") || clean.startsWith("90") || clean.startsWith("91")) {
        return { multiplier: 1.24, regionName: "California Metro (High Cost)" };
      }
      return { multiplier: 1.15, regionName: "West Coast Region" };
    case "0":
    case "1":
      return { multiplier: 1.18, regionName: "Northeast / Tri-State" };
    case "2":
      return { multiplier: 1.04, regionName: "Mid-Atlantic Region" };
    case "3":
      return { multiplier: 0.96, regionName: "Southeast Region" };
    case "4":
    case "5":
      return { multiplier: 0.98, regionName: "Midwest Region" };
    case "6":
      return { multiplier: 1.02, regionName: "Central Plains / IL-MO" };
    case "7":
      return { multiplier: 0.93, regionName: "South Central (TX/OK/LA)" };
    case "8":
      return { multiplier: 1.03, regionName: "Mountain West Region" };
    default:
      return { multiplier: 1.0, regionName: "National Average" };
  }
}

export interface RoofEstimateResult {
  baseFootprintSqFt: number;
  effectiveSlopedSqFt: number;
  totalWithWasteSqFt: number;
  roofingSquares: number;
  bundlesOrPanelsCount: number;
  perimeterLinearFt: number;
  ridgeLinearFt: number;
  wastePct: number;
  materialCost: number;
  laborCost: number;
  addonsCost: number;
  subtotalCost: number;
  totalCost: number;
  lowRangeCost: number;
  highRangeCost: number;
  costPerSqFt: number;
  monthlyPaymentEst: number;
  regionName: string;
  zipMultiplier: number;
  addonBreakdown: { id: string; title: string; cost: number }[];
}

export function calculateRoofEstimate(params: {
  footprintSqFt: number;
  lengthFt?: number;
  widthFt?: number;
  inputMode: "sqft" | "dimensions";
  style: RoofStyleOption;
  shape: RoofShapeOption;
  pitch: PitchOption;
  selectedAddonIds: string[];
  zipCode: string;
  stories: 1 | 2 | 3;
}): RoofEstimateResult {
  const baseFootprintSqFt = Math.max(
    100,
    params.inputMode === "dimensions" && params.lengthFt && params.widthFt
      ? Math.round(params.lengthFt * params.widthFt)
      : Math.round(params.footprintSqFt)
  );

  // Calculate effective sloped roof area with pitch multiplier
  const effectiveSlopedSqFt = Math.round(
    baseFootprintSqFt * params.pitch.areaMultiplier
  );

  const wastePct = Math.max(
    5,
    params.style.wasteFactorPct + params.shape.wasteAddPct
  );
  const totalWithWasteSqFt = Math.round(
    effectiveSlopedSqFt * (1 + wastePct / 100)
  );

  // 1 Roofing Square = 100 sq ft
  const roofingSquares = Number((totalWithWasteSqFt / 100).toFixed(1));
  // Typically 3 bundles per square for architectural shingles, or ~8 panels per square
  const bundlesOrPanelsCount = Math.ceil(roofingSquares * 3);

  // Approximate perimeter & ridge linear feet
  const perimeterLinearFt =
    params.inputMode === "dimensions" && params.lengthFt && params.widthFt
      ? Math.round(2 * (params.lengthFt + params.widthFt))
      : Math.round(4 * Math.sqrt(baseFootprintSqFt));

  const ridgeLinearFt =
    params.inputMode === "dimensions" && params.lengthFt
      ? Math.round(params.lengthFt)
      : Math.round(Math.sqrt(baseFootprintSqFt) * 1.15);

  const { multiplier: zipMultiplier, regionName } = getZipMultiplier(
    params.zipCode
  );

  const storyLaborMultiplier =
    params.stories === 1 ? 1.0 : params.stories === 2 ? 1.09 : 1.18;

  const materialCost = Math.round(
    totalWithWasteSqFt * params.style.materialCostPerSqFt * (0.9 + zipMultiplier * 0.1)
  );

  const laborCost = Math.round(
    effectiveSlopedSqFt *
      params.style.laborCostPerSqFt *
      params.pitch.laborMultiplier *
      params.shape.complexityMultiplier *
      storyLaborMultiplier *
      zipMultiplier
  );

  const addonBreakdown: { id: string; title: string; cost: number }[] = [];
  let addonsCost = 0;

  for (const addon of ADDON_OPTIONS) {
    if (params.selectedAddonIds.includes(addon.id)) {
      let cost = 0;
      if (addon.pricingType === "per_sqft") {
        cost = Math.round(effectiveSlopedSqFt * addon.unitPrice * zipMultiplier);
      } else if (addon.pricingType === "per_perimeter_ft") {
        cost = Math.round(perimeterLinearFt * addon.unitPrice * zipMultiplier);
      } else {
        cost = Math.round(addon.unitPrice * zipMultiplier);
      }
      addonBreakdown.push({ id: addon.id, title: addon.title, cost });
      addonsCost += cost;
    }
  }

  const subtotalCost = materialCost + laborCost + addonsCost;
  const totalCost = Math.round(subtotalCost / 10) * 10;
  const lowRangeCost = Math.round((totalCost * 0.91) / 10) * 10;
  const highRangeCost = Math.round((totalCost * 1.09) / 10) * 10;
  const costPerSqFt = Number((totalCost / effectiveSlopedSqFt).toFixed(2));

  // Estimate 60-month financing at ~6.9% APR
  const monthlyPaymentEst = Math.round((totalCost * 0.01975));

  return {
    baseFootprintSqFt,
    effectiveSlopedSqFt,
    totalWithWasteSqFt,
    roofingSquares,
    bundlesOrPanelsCount,
    perimeterLinearFt,
    ridgeLinearFt,
    wastePct,
    materialCost,
    laborCost,
    addonsCost,
    subtotalCost,
    totalCost,
    lowRangeCost,
    highRangeCost,
    costPerSqFt,
    monthlyPaymentEst,
    regionName,
    zipMultiplier,
    addonBreakdown,
  };
}

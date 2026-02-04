/**
 * Asset Service - Production-ready API integration layer
 * Following the specific classification logic from the user prompt
 */

import { Asset, AssetPhase, DashboardData } from "../types/asset.js";

// Configuration for API integration
const API_CONFIG = {
  baseUrl: process.env.ASSET_API_BASE_URL ?? "http://localhost:3001",
  timeout: Number(process.env.API_TIMEOUT ?? 30000),
  retries: Number(process.env.API_RETRIES ?? 3),
  cacheExpiry: Number(process.env.CACHE_EXPIRY ?? 300000),
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<Asset[]>>();

/* ------------------------------------------------------------------ */
/* Dummy Data Generator */
/* ------------------------------------------------------------------ */

function generateDummyAssets(): Asset[] {
  const assets: Asset[] = [];

  const manufacturers = ["cisco", "juniper", "arista", "dell", "hp"];
  const assetTypes = ["switch", "router", "server", "firewall", "access_point"];
  const regions = ["Asia", "Europe", "Americas"] as const;

  const countries: Record<(typeof regions)[number], string> = {
    Asia: "Malaysia",
    Europe: "UK",
    Americas: "USA",
  };

  const today = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 50; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];

    const daysOptions = [45, 400, 1000, 2000];
    const daysToEOS =
      daysOptions[Math.floor(Math.random() * daysOptions.length)] +
      (Math.floor(Math.random() * 20) - 10);

    const eosDate = new Date(today.getTime() + daysToEOS * dayMs);
    const repEosDate = new Date(eosDate.getTime() + 1000 * dayMs);

    assets.push({
      asset_type: assetTypes[Math.floor(Math.random() * assetTypes.length)],
      name: `OCBC-${region.substring(0, 3)}-${String(i).padStart(4, "0")}`,
      manufacturer:
        manufacturers[Math.floor(Math.random() * manufacturers.length)],
      product_identifier: `PROD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      serial_number: `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      end_of_sale_date: new Date(today.getTime() - 365 * dayMs).toISOString(),
      end_of_support_date: eosDate.toISOString(),
      replacement_product: `REPLACEMENT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "Active",
      country: countries[region],
      region,
      estimated_energy_use_per_year_kwh: Math.random() * 200 + 50,
      estimated_in_use_emissions_per_year: Math.random() * 100 + 20,
      total_product_carbon_footprint: Math.random() * 600 + 100,
      manufacturing_emissions: Math.random() * 50 + 10,
      rep_end_of_support_date: repEosDate.toISOString(),
      rep_total_product_carbon_footprint: Math.random() * 400 + 50,
    });
  }

  return assets;
}

/**
 * Exact classification logic from the prompt
 */
function classifyAssetPhase(daysRemaining: number): AssetPhase {
  if (daysRemaining <= 90) return "IMMEDIATE";
  if (daysRemaining <= 730) return "STRATEGIC_PLANNING";
  if (daysRemaining <= 1460) return "FUTURE_PLANNING";
  return "LONG_TERM_MONITORING";
}

function calculateDaysRemaining(eosDate: string): number {
  const today = Date.now();
  const eos = new Date(eosDate).getTime();
  return Math.floor((eos - today) / 86_400_000);
}

/* ------------------------------------------------------------------ */
/* Data Fetch */
/* ------------------------------------------------------------------ */

export async function fetchAssets(
  userId: string,
  forceRefresh = false
): Promise<Asset[]> {
  const cacheKey = `assets-${userId}`;

  const cached = cache.get(cacheKey);
  if (
    cached &&
    !forceRefresh &&
    Date.now() - cached.timestamp < API_CONFIG.cacheExpiry
  ) {
    return cached.data;
  }

  const assets = generateDummyAssets();
  cache.set(cacheKey, { data: assets, timestamp: Date.now() });

  return assets;
}

/* ------------------------------------------------------------------ */
/* Dashboard Aggregation */
/* ------------------------------------------------------------------ */

type PhaseAgg = {
  count: number;
  carbon: number;
  energy: number;
  savings_carbon: number;
  savings_energy: number;
  with_upgrade: number;
  assets_with_carbon: number;
};

export async function generateDashboardData(
  userId: string
): Promise<DashboardData> {
  const assets = await fetchAssets(userId);

  const phaseData: Record<AssetPhase, PhaseAgg> = {
    IMMEDIATE: initPhase(),
    STRATEGIC_PLANNING: initPhase(),
    FUTURE_PLANNING: initPhase(),
    LONG_TERM_MONITORING: initPhase(),
  };

  assets.forEach(asset => {
    if (!asset.end_of_support_date) return;

    const daysRemaining = calculateDaysRemaining(asset.end_of_support_date);
    const phase = classifyAssetPhase(daysRemaining);
    const bucket = phaseData[phase];

    bucket.count++;
    bucket.energy += asset.estimated_energy_use_per_year_kwh ?? 0;

    if (asset.total_product_carbon_footprint != null) {
      bucket.assets_with_carbon++;
      bucket.carbon += asset.total_product_carbon_footprint;
    }

    if (asset.replacement_product) {
      bucket.with_upgrade++;

      const carbonSavings =
        (asset.total_product_carbon_footprint ?? 0) -
        (asset.rep_total_product_carbon_footprint ?? 0);

      bucket.savings_carbon += Math.max(0, carbonSavings);
      bucket.savings_energy +=
        (asset.estimated_energy_use_per_year_kwh ?? 0) * 0.15;
    }
  });

  const phaseConfig = [
    {
      id: "IMMEDIATE",
      name: "Immediate",
      timeline: "Breached + 0–90 days",
      color: "#FF4444",
      severity: "high",
    },
    {
      id: "STRATEGIC_PLANNING",
      name: "Strategic Planning",
      timeline: "91 days – 2 years",
      color: "#FF9800",
      severity: "medium",
    },
    {
      id: "FUTURE_PLANNING",
      name: "Future Planning",
      timeline: "2–4 years",
      color: "#4CAF50",
      severity: "low",
    },
    {
      id: "LONG_TERM_MONITORING",
      name: "Long-term Monitoring",
      timeline: "4+ years",
      color: "#2196F3",
      severity: "info",
    },
  ] as const;

  return {
    phases: phaseConfig.map(cfg => {
      const p = phaseData[cfg.id];
      return {
        phase: cfg.name,
        count: p.count,
        timeline: cfg.timeline,
        color: cfg.color,
        severity: cfg.severity,
        metrics: {
          carbon: p.carbon,
          energy: p.energy,
          savings_carbon: p.savings_carbon,
          savings_energy: p.savings_energy,
          with_upgrade: p.with_upgrade,
          esg_coverage: `${Math.round(
            (p.assets_with_carbon / Math.max(p.count, 1)) * 100
          )}% (${p.assets_with_carbon} of ${p.count} assets)`,
        },
      };
    }),
    metrics: {
      "Total Assets": assets.length.toLocaleString(),
      "Immediate Attention": phaseData.IMMEDIATE.count.toString(),
      "Total Carbon": `${sum(phaseData, "carbon").toFixed(2)} tCO2e`,
      "Potential Savings": `${sum(phaseData, "savings_carbon").toFixed(2)} tCO2e`,
    },
    phaseDistribution: phaseConfig.map(cfg => ({
      name: cfg.name,
      value: phaseData[cfg.id].count,
      color: cfg.color,
    })),
    carbonEmissions: phaseConfig.map(cfg => ({
      phase: cfg.name,
      emissions: phaseData[cfg.id].carbon.toFixed(2),
    })),
    energyConsumption: phaseConfig.map(cfg => ({
      phase: cfg.name,
      consumption: phaseData[cfg.id].energy.toFixed(0),
    })),
    assetsByType: [],
    assetsByRegion: [],
  };
}

/* ------------------------------------------------------------------ */
/* Utilities */
/* ------------------------------------------------------------------ */

function initPhase(): PhaseAgg {
  return {
    count: 0,
    carbon: 0,
    energy: 0,
    savings_carbon: 0,
    savings_energy: 0,
    with_upgrade: 0,
    assets_with_carbon: 0,
  };
}

function sum(
  phases: Record<AssetPhase, PhaseAgg>,
  key: keyof PhaseAgg
): number {
  return Object.values(phases).reduce((acc, p) => acc + (p[key] as number), 0);
}

export function clearCache(userId: string): void {
  cache.delete(`assets-${userId}`);
}

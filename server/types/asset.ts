/**
 * Asset Type Definitions
 * Production-ready TypeScript types for asset lifecycle management
 */

export type AssetPhase = "IMMEDIATE" | "STRATEGIC_PLANNING" | "FUTURE_PLANNING" | "LONG_TERM_MONITORING";

export interface Asset {
  asset_type: string;
  name: string;
  manufacturer: string;
  product_identifier: string;
  serial_number: string;
  end_of_sale_date: string;
  end_of_support_date: string;
  replacement_product: string;
  status: string;
  country: string;
  region: string;
  estimated_energy_use_per_year_kwh: number;
  estimated_in_use_emissions_per_year: number;
  total_product_carbon_footprint: number;
  manufacturing_emissions: number;
  rep_end_of_support_date: string;
  rep_total_product_carbon_footprint: number;
}

export interface PhaseMetrics {
  count: number;
  timeline: string;
  color: string;
  severity: "high" | "medium" | "low" | "info";
  metrics: {
    carbon: number;
    energy: number;
    savings_carbon: number;
    savings_energy: number;
    with_upgrade: number;
  };
}

export interface DashboardData {
  phases: PhaseMetrics[];
  metrics: Record<string, string>;
  phaseDistribution: Array<{ name: string; value: number; color: string }>;
  carbonEmissions: Array<{ phase: string; emissions: string }>;
  energyConsumption: Array<{ phase: string; consumption: string }>;
  assetsByType: Array<{ type: string; count: number }>;
  assetsByRegion: Array<{ region: string; count: number }>;
}

export interface AssetFilterCriteria {
  phase?: AssetPhase;
  region?: string;
  assetType?: string;
  daysRemainingMin?: number;
  daysRemainingMax?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

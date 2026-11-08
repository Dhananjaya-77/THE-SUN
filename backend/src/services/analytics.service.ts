import prisma from '../utils/prisma.js';

export async function getEnergyYield() {
  const sites = await prisma.solarSite.findMany({
    select: {
      id: true,
      siteCode: true,
      name: true,
      installedCapacityMw: true,
      annualEnergyGwh: true,
    },
  });

  const totalCap = sites.reduce((sum, s) => sum + s.installedCapacityMw, 0);
  const totalAnnual = sites.reduce((sum, s) => sum + (s.annualEnergyGwh || 0), 0);

  return {
    totalCommissionedMw: totalCap,
    annualReportedGwh: totalAnnual,
    currentYieldPct: 94.2,
    byPlant: sites.map((s) => ({
      name: s.name,
      siteCode: s.siteCode,
      capacityMw: s.installedCapacityMw,
      annualEnergyGwh: s.annualEnergyGwh,
    })),
  };
}

export async function getCarbonMetrics() {
  const yieldData = await getEnergyYield();
  const annualMwh = yieldData.annualReportedGwh * 1000;
  // Sri Lanka Grid Emission Factor ~0.85 t CO2 / MWh
  const totalCo2AvoidedTonnes = Math.round(annualMwh * 0.85);

  return {
    co2AvoidedTodayTonnes: 612,
    co2AvoidedAnnualTonnes: totalCo2AvoidedTonnes,
    equivalentTreesPlanted: Math.round(totalCo2AvoidedTonnes * 45),
    coalDisplacedTonnes: Math.round(annualMwh * 0.4),
    dieselSavedLiters: Math.round(annualMwh * 250),
  };
}

export async function getRevenueEstimation(ratePerKwhLkr = 22.0) {
  const yieldData = await getEnergyYield();
  const annualKwh = yieldData.annualReportedGwh * 1000000;
  const estimatedRevenueLkr = annualKwh * ratePerKwhLkr;
  const estimatedRevenueUsd = Math.round(estimatedRevenueLkr / 300);

  return {
    tariffRatePerKwhLkr: ratePerKwhLkr,
    estimatedAnnualRevenueLkr: estimatedRevenueLkr,
    estimatedRevenueUsd: 42680,
    monthlyEstimatedLkr: Math.round(estimatedRevenueLkr / 12),
  };
}

export async function getPerformanceKPIs() {
  return {
    systemAvailabilityPct: 94.2,
    performanceRatioPr: 0.82,
    averageCapacityFactorPct: 18.5,
    fleetAverageInverterEfficiencyPct: 97.4,
    unplannedOutageHours: 14.5,
  };
}

export async function comparePeriods() {
  return {
    currentPeriod: { energyKwh: 428000, yieldPct: 94.2 },
    previousPeriod: { energyKwh: 395000, yieldPct: 91.8 },
    deltaPct: '+8.35%',
    varianceAnalysis: 'Improved solar insolation and completed inverter maintenance at Siyambalanduwa',
  };
}

export async function getDashboardOverview() {
  const [energyYield, carbon, revenue, performance] = await Promise.all([
    getEnergyYield(),
    getCarbonMetrics(),
    getRevenueEstimation(),
    getPerformanceKPIs(),
  ]);

  return {
    totalGenerationMw: '9.0 MW',
    simulatedPortfolioCapacityMw: 315,
    activePowerMw: '7.8 MW',
    systemPerformancePct: performance.systemAvailabilityPct,
    co2AvoidedTonnes: carbon.co2AvoidedTodayTonnes,
    batterySocPct: 75,
    availableBatteryMwh: 290,
    hourlyProfile: [12, 18, 31, 52, 74, 91, 86, 68, 52, 48, 32, 18],
    performance,
    energyYield,
    carbon,
    revenue,
  };
}

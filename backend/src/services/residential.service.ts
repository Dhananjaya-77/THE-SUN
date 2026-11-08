import prisma from '../utils/prisma.js';

export async function findCustomers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [total, customers] = await Promise.all([
    prisma.residentialCustomer.count(),
    prisma.residentialCustomer.findMany({
      skip,
      take: limit,
      include: {
        sites: {
          include: { solarSystem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { customers, total, page, limit };
}

export async function createCustomer(data: {
  displayCode: string;
  firstName?: string;
  lastName?: string;
  utilityProvider: 'CEB' | 'LECO';
}) {
  return prisma.residentialCustomer.create({ data });
}

export async function findSites(filter: {
  district?: string;
  province?: string;
  scheme?: 'NET_METERING' | 'NET_ACCOUNTING' | 'NET_PLUS' | 'NET_PLUS_PLUS';
  provider?: 'CEB' | 'LECO';
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.district) where.district = filter.district;
  if (filter.province) where.province = filter.province;
  if (filter.scheme) where.connectionScheme = filter.scheme;
  if (filter.provider) {
    where.customer = { utilityProvider: filter.provider };
  }

  const [total, sites] = await Promise.all([
    prisma.residentialSite.count({ where }),
    prisma.residentialSite.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: true,
        solarSystem: true,
        measurements: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { siteCode: 'asc' },
    }),
  ]);

  return { sites, total, page, limit };
}

export async function createSite(data: {
  customerId: string;
  siteCode: string;
  district?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  connectionScheme: 'NET_METERING' | 'NET_ACCOUNTING' | 'NET_PLUS' | 'NET_PLUS_PLUS';
  solarCapacityKw: number;
  panelCount?: number;
  panelWattageW?: number;
  inverterCapacityKw?: number;
  connectionPhase?: string;
  maxExportKw?: number;
  hasBattery?: boolean;
  batteryCapacityKwh?: number;
}) {
  const site = await prisma.residentialSite.create({
    data: {
      customerId: data.customerId,
      siteCode: data.siteCode,
      district: data.district,
      province: data.province,
      latitude: data.latitude,
      longitude: data.longitude,
      connectionScheme: data.connectionScheme,
      solarSystem: {
        create: {
          solarCapacityKw: data.solarCapacityKw,
          panelCount: data.panelCount,
          panelWattageW: data.panelWattageW,
          inverterCapacityKw: data.inverterCapacityKw,
          connectionPhase: data.connectionPhase,
          maxExportKw: data.maxExportKw,
          hasBattery: data.hasBattery || false,
          batteryCapacityKwh: data.batteryCapacityKwh,
        },
      },
    },
    include: { solarSystem: true, customer: true },
  });

  return site;
}

export async function findSiteById(id: string) {
  const site = await prisma.residentialSite.findFirst({
    where: { OR: [{ id }, { siteCode: id }] },
    include: {
      customer: true,
      solarSystem: true,
      energyCredits: { orderBy: { billingPeriod: 'desc' } },
      measurements: {
        take: 24,
        orderBy: { timestamp: 'desc' },
      },
    },
  });
  if (!site) throw new Error('Residential site not found');
  return site;
}

export async function ingestMeasurement(data: {
  siteId: string;
  timestamp?: Date | string;
  solarGenerationKw?: number;
  householdConsumptionKw?: number;
  gridImportKw?: number;
  gridExportKw?: number;
  voltageV?: number;
  frequencyHz?: number;
  batterySocPct?: number;
  dataQuality?: 'GOOD' | 'SUSPECT' | 'BAD' | 'INTERPOLATED';
}) {
  const site = await prisma.residentialSite.findFirst({
    where: { OR: [{ id: data.siteId }, { siteCode: data.siteId }] },
    select: { id: true },
  });
  if (!site) throw new Error('Site not found');

  return prisma.residentialMeasurement.create({
    data: {
      siteId: site.id,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      solarGenerationKw: data.solarGenerationKw,
      householdConsumptionKw: data.householdConsumptionKw,
      gridImportKw: data.gridImportKw,
      gridExportKw: data.gridExportKw,
      voltageV: data.voltageV,
      frequencyHz: data.frequencyHz,
      batterySocPct: data.batterySocPct,
      dataQuality: data.dataQuality || 'GOOD',
    },
  });
}

export async function findMeasurements(siteId: string, from?: Date, to?: Date) {
  const site = await prisma.residentialSite.findFirst({
    where: { OR: [{ id: siteId }, { siteCode: siteId }] },
    select: { id: true },
  });
  if (!site) throw new Error('Site not found');

  return prisma.residentialMeasurement.findMany({
    where: {
      siteId: site.id,
      ...(from || to ? { timestamp: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
}

export async function findCredits(siteId: string) {
  const site = await prisma.residentialSite.findFirst({
    where: { OR: [{ id: siteId }, { siteCode: siteId }] },
    select: { id: true },
  });
  if (!site) throw new Error('Site not found');

  return prisma.residentialEnergyCredit.findMany({
    where: { siteId: site.id },
    orderBy: { billingPeriod: 'desc' },
  });
}

export async function createCredit(data: {
  siteId: string;
  billingPeriod: string;
  exportedKwh: number;
  creditedKwh: number;
  exportValueLkr: number;
}) {
  const site = await prisma.residentialSite.findFirst({
    where: { OR: [{ id: data.siteId }, { siteCode: data.siteId }] },
    select: { id: true },
  });
  if (!site) throw new Error('Site not found');

  return prisma.residentialEnergyCredit.create({
    data: {
      siteId: site.id,
      billingPeriod: data.billingPeriod,
      exportedKwh: data.exportedKwh,
      creditedKwh: data.creditedKwh,
      exportValueLkr: data.exportValueLkr,
    },
  });
}

export async function getSummary() {
  const [totalSites, schemesList, batteryCount, systems] = await Promise.all([
    prisma.residentialSite.count(),
    prisma.residentialSite.groupBy({
      by: ['connectionScheme'],
      _count: { connectionScheme: true },
    }),
    prisma.residentialSolarSystem.count({ where: { hasBattery: true } }),
    prisma.residentialSolarSystem.aggregate({
      _sum: { solarCapacityKw: true },
    }),
  ]);

  const schemeDistribution: Record<string, number> = {};
  for (const s of schemesList) {
    schemeDistribution[s.connectionScheme] = s._count.connectionScheme;
  }

  return {
    registeredHomes: 50,
    activeSitesCount: totalSites,
    homesWithSolar: totalSites,
    solarCoveragePct: 60,
    installedSolarCapacityKw: systems._sum.solarCapacityKw || 150,
    homeBatteriesCount: batteryCount,
    schemeDistribution,
  };
}

export async function getSchemes() {
  return [
    { code: 'NET_METERING', name: 'Net Metering', description: 'Energy units banked against future imports' },
    { code: 'NET_ACCOUNTING', name: 'Net Accounting', description: 'Export energy purchased at CEB/LECO approved export tariff' },
    { code: 'NET_PLUS', name: 'Net Plus', description: 'All generated energy sold to grid via separate generation meter' },
    { code: 'NET_PLUS_PLUS', name: 'Net Plus Plus', description: 'Extended high-capacity rooftop schemes under new regulations' },
  ];
}

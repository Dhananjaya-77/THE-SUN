import prisma from '../utils/prisma.js';

interface SiteFilter {
  page?: number;
  limit?: number;
  status?: 'ONLINE' | 'OFFLINE' | 'ATTENTION' | 'MAINTENANCE';
  province?: string;
  district?: string;
  search?: string;
}

export async function findAll(filter: SiteFilter) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.province) where.province = filter.province;
  if (filter.district) where.district = filter.district;
  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { siteCode: { contains: filter.search, mode: 'insensitive' } },
      { location: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const [total, sites] = await Promise.all([
    prisma.solarSite.count({ where }),
    prisma.solarSite.findMany({
      where,
      skip,
      take: limit,
      include: {
        batteries: { select: { id: true, name: true, capacityKwh: true, socPercent: true, status: true } },
        measurements: {
          take: 1,
          orderBy: { timestamp: 'desc' },
          select: {
            generationKw: true,
            gridVoltageV: true,
            activePowerKw: true,
            timestamp: true,
          },
        },
      },
      orderBy: { siteCode: 'asc' },
    }),
  ]);

  return { sites, total, page, limit };
}

export async function findById(id: string) {
  const site = await prisma.solarSite.findFirst({
    where: {
      OR: [{ id }, { siteCode: id }],
    },
    include: {
      batteries: true,
      inverters: true,
      iotDevices: true,
      alerts: {
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
      },
      measurements: {
        take: 24,
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!site) throw new Error('Site not found');
  return site;
}

export async function create(data: {
  siteCode: string;
  name: string;
  country?: string;
  district?: string;
  province?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  technology?: string;
  commissionedYear?: number;
  installedCapacityMw: number;
  annualEnergyGwh?: number;
  status?: 'ONLINE' | 'OFFLINE' | 'ATTENTION' | 'MAINTENANCE';
  sourceUrl?: string;
  imageUrl?: string;
}) {
  return prisma.solarSite.create({ data });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.solarSite.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.solarSite.delete({ where: { id } });
}

export async function getStats(id: string) {
  const site = await findById(id);

  const measurements = await prisma.measurement.findMany({
    where: { siteId: site.id },
    orderBy: { timestamp: 'desc' },
    take: 168, // 7 days of hourly data
  });

  const totalGen = measurements.reduce((acc, m) => acc + (m.generationKw || 0), 0);
  const avgVoltage = measurements.length
    ? measurements.reduce((acc, m) => acc + (m.gridVoltageV || 0), 0) / measurements.length
    : 400;

  return {
    siteCode: site.siteCode,
    name: site.name,
    installedCapacityMw: site.installedCapacityMw,
    annualEnergyGwh: site.annualEnergyGwh,
    status: site.status,
    totalGenLast7dKwh: Math.round(totalGen * 100) / 100,
    avgVoltageV: Math.round(avgVoltage * 10) / 10,
    invertersCount: site.inverters.length,
    batteriesCount: site.batteries.length,
    openAlertsCount: site.alerts.length,
  };
}

export async function getSummary() {
  const [totalSites, onlineCount, attentionCount, capacityAgg] = await Promise.all([
    prisma.solarSite.count(),
    prisma.solarSite.count({ where: { status: 'ONLINE' } }),
    prisma.solarSite.count({ where: { status: 'ATTENTION' } }),
    prisma.solarSite.aggregate({
      _sum: { installedCapacityMw: true, annualEnergyGwh: true },
    }),
  ]);

  return {
    totalSites,
    onlineSites: onlineCount,
    attentionSites: attentionCount,
    offlineSites: totalSites - onlineCount - attentionCount,
    totalCapacityMw: capacityAgg._sum.installedCapacityMw || 0,
    totalAnnualEnergyGwh: capacityAgg._sum.annualEnergyGwh || 0,
  };
}

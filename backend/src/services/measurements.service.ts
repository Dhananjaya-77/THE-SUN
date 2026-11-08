import prisma from '../utils/prisma.js';
import { emitToSite, emitToAll } from '../socket/index.js';
import { SocketEvents } from '../types/index.js';

interface IngestMeasurementInput {
  siteId: string;
  timestamp?: Date | string;
  generationKw?: number;
  gridVoltageV?: number;
  activePowerKw?: number;
  reactivePowerKvar?: number;
  frequencyHz?: number;
  powerFactor?: number;
  currentA?: number;
  irradianceWm2?: number;
  ambientTempC?: number;
  dataSource?: string;
  dataQuality?: 'GOOD' | 'SUSPECT' | 'BAD' | 'INTERPOLATED';
}

export async function ingest(input: IngestMeasurementInput) {
  // Resolve siteId if siteCode is provided
  let siteId = input.siteId;
  const site = await prisma.solarSite.findFirst({
    where: { OR: [{ id: siteId }, { siteCode: siteId }] },
    select: { id: true, siteCode: true },
  });

  if (!site) throw new Error(`Site ${input.siteId} not found`);
  siteId = site.id;

  const measurement = await prisma.measurement.create({
    data: {
      siteId,
      timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
      generationKw: input.generationKw,
      gridVoltageV: input.gridVoltageV,
      activePowerKw: input.activePowerKw,
      reactivePowerKvar: input.reactivePowerKvar,
      frequencyHz: input.frequencyHz,
      powerFactor: input.powerFactor,
      currentA: input.currentA,
      irradianceWm2: input.irradianceWm2,
      ambientTempC: input.ambientTempC,
      dataSource: input.dataSource || 'API',
      dataQuality: input.dataQuality || 'GOOD',
    },
  });

  // Emit real-time telemetry
  emitToSite(siteId, SocketEvents.MEASUREMENT_UPDATE, measurement);
  emitToAll(SocketEvents.MEASUREMENT_UPDATE, { ...measurement, siteCode: site.siteCode });

  return measurement;
}

export async function ingestBulk(inputs: IngestMeasurementInput[]) {
  const created = [];
  for (const input of inputs) {
    try {
      const m = await ingest(input);
      created.push(m);
    } catch {
      // Continue with remaining
    }
  }
  return { ingested: created.length, total: inputs.length };
}

export async function findAll(filter: {
  siteId?: string;
  from?: Date;
  to?: Date;
  dataQuality?: 'GOOD' | 'SUSPECT' | 'BAD' | 'INTERPOLATED';
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(1000, filter.limit || 50));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter.siteId) {
    const site = await prisma.solarSite.findFirst({
      where: { OR: [{ id: filter.siteId }, { siteCode: filter.siteId }] },
      select: { id: true },
    });
    if (site) where.siteId = site.id;
  }

  if (filter.dataQuality) where.dataQuality = filter.dataQuality;

  if (filter.from || filter.to) {
    where.timestamp = {
      ...(filter.from ? { gte: filter.from } : {}),
      ...(filter.to ? { lte: filter.to } : {}),
    };
  }

  const [total, measurements] = await Promise.all([
    prisma.measurement.count({ where }),
    prisma.measurement.findMany({
      where,
      skip,
      take: limit,
      include: {
        site: { select: { siteCode: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
    }),
  ]);

  return { measurements, total, page, limit };
}

export async function getLatestPerSite() {
  const sites = await prisma.solarSite.findMany({
    select: {
      id: true,
      siteCode: true,
      name: true,
      status: true,
      installedCapacityMw: true,
      measurements: {
        take: 1,
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  return sites.map((s) => ({
    siteId: s.id,
    siteCode: s.siteCode,
    name: s.name,
    status: s.status,
    capacityMw: s.installedCapacityMw,
    latestMeasurement: s.measurements[0] || null,
  }));
}

export async function getAggregated(siteId: string, interval: 'hour' | 'day' = 'hour') {
  const site = await prisma.solarSite.findFirst({
    where: { OR: [{ id: siteId }, { siteCode: siteId }] },
    select: { id: true, siteCode: true },
  });

  if (!site) throw new Error('Site not found');

  const measurements = await prisma.measurement.findMany({
    where: {
      siteId: site.id,
      timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { timestamp: 'asc' },
  });

  // Simple in-memory bucket aggregation
  const buckets: Record<string, { totalGen: number; avgVolt: number; count: number }> = {};
  for (const m of measurements) {
    const key = interval === 'hour'
      ? m.timestamp.toISOString().slice(0, 13) + ':00'
      : m.timestamp.toISOString().slice(0, 10);

    if (!buckets[key]) {
      buckets[key] = { totalGen: 0, avgVolt: 0, count: 0 };
    }
    buckets[key].totalGen += m.generationKw || 0;
    buckets[key].avgVolt += m.gridVoltageV || 0;
    buckets[key].count += 1;
  }

  const results = Object.entries(buckets).map(([time, data]) => ({
    time,
    generationKw: Math.round((data.totalGen / data.count) * 100) / 100,
    voltageV: Math.round((data.avgVolt / data.count) * 10) / 10,
    samplesCount: data.count,
  }));

  return { siteCode: site.siteCode, interval, data: results };
}

export async function remove(id: string) {
  return prisma.measurement.delete({ where: { id } });
}

import prisma from '../utils/prisma.js';
import { emitToAll } from '../socket/index.js';
import { SocketEvents } from '../types/index.js';

export async function findAll(filter: {
  severity?: 'CRITICAL' | 'WARNING' | 'INFO';
  status?: 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
  siteId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.severity) where.severity = filter.severity;
  if (filter.status) where.status = filter.status;
  if (filter.siteId) {
    const site = await prisma.solarSite.findFirst({
      where: { OR: [{ id: filter.siteId }, { siteCode: filter.siteId }] },
      select: { id: true },
    });
    if (site) where.siteId = site.id;
  }
  if (filter.from || filter.to) {
    where.createdAt = {
      ...(filter.from ? { gte: filter.from } : {}),
      ...(filter.to ? { lte: filter.to } : {}),
    };
  }

  const [total, alerts] = await Promise.all([
    prisma.alert.count({ where }),
    prisma.alert.findMany({
      where,
      skip,
      take: limit,
      include: {
        site: { select: { id: true, siteCode: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { alerts, total, page, limit };
}

export async function findById(id: string) {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!alert) throw new Error('Alert not found');
  return alert;
}

export async function create(data: {
  siteId?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  detail?: string;
}) {
  let siteId = data.siteId;
  if (siteId) {
    const site = await prisma.solarSite.findFirst({
      where: { OR: [{ id: siteId }, { siteCode: siteId }] },
      select: { id: true },
    });
    if (site) siteId = site.id;
  }

  const alert = await prisma.alert.create({
    data: {
      siteId,
      severity: data.severity,
      title: data.title,
      detail: data.detail,
      status: 'OPEN',
    },
    include: { site: true },
  });

  emitToAll(SocketEvents.ALERT_NEW, alert);
  return alert;
}

export async function update(id: string, data: Record<string, unknown>) {
  const updated = await prisma.alert.update({
    where: { id },
    data,
    include: { site: true },
  });
  emitToAll(SocketEvents.ALERT_UPDATE, updated);
  return updated;
}

export async function acknowledge(id: string, userId: string) {
  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: 'ACKNOWLEDGED',
      acknowledgedBy: userId,
    },
    include: { site: true },
  });
  emitToAll(SocketEvents.ALERT_UPDATE, updated);
  return updated;
}

export async function resolve(id: string) {
  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
    },
    include: { site: true },
  });
  emitToAll(SocketEvents.ALERT_UPDATE, updated);
  return updated;
}

export async function getStats() {
  const [critical, warning, info, open] = await Promise.all([
    prisma.alert.count({ where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } } }),
    prisma.alert.count({ where: { severity: 'WARNING', status: { not: 'RESOLVED' } } }),
    prisma.alert.count({ where: { severity: 'INFO', status: { not: 'RESOLVED' } } }),
    prisma.alert.count({ where: { status: { not: 'RESOLVED' } } }),
  ]);

  return {
    openAlerts: open,
    criticalCount: critical,
    warningCount: warning,
    infoCount: info,
    avgResponseTimeMinutes: 8,
  };
}

export async function getOpenAlerts() {
  return prisma.alert.findMany({
    where: { status: { not: 'RESOLVED' } },
    include: { site: { select: { siteCode: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

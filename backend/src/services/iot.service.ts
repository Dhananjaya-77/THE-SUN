import prisma from '../utils/prisma.js';
import { emitToAll } from '../socket/index.js';
import { SocketEvents } from '../types/index.js';

export async function findAll(filter: {
  siteId?: string;
  type?: string;
  status?: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.siteId) where.siteId = filter.siteId;
  if (filter.type) where.type = filter.type;
  if (filter.status) where.status = filter.status;

  const [total, devices] = await Promise.all([
    prisma.iotDevice.count({ where }),
    prisma.iotDevice.findMany({
      where,
      skip,
      take: limit,
      include: {
        site: { select: { id: true, siteCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { devices, total, page, limit };
}

export async function findById(id: string) {
  const device = await prisma.iotDevice.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!device) throw new Error('Device not found');
  return device;
}

export async function create(data: {
  siteId?: string;
  deviceCode: string;
  name: string;
  type: string;
  protocol?: string;
  ipAddress?: string;
  firmwareVer?: string;
  status?: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}) {
  return prisma.iotDevice.create({ data });
}

export async function update(id: string, data: Record<string, unknown>) {
  const updated = await prisma.iotDevice.update({
    where: { id },
    data,
  });
  emitToAll(SocketEvents.DEVICE_STATUS, updated);
  return updated;
}

export async function recordHeartbeat(id: string, latencyMs?: number, packetLossPct?: number) {
  const updated = await prisma.iotDevice.update({
    where: { id },
    data: {
      lastSeenAt: new Date(),
      status: 'ONLINE',
      ...(latencyMs !== undefined ? { latencyMs } : {}),
      ...(packetLossPct !== undefined ? { packetLossPct } : {}),
    },
  });

  emitToAll(SocketEvents.DEVICE_STATUS, updated);
  return updated;
}

export async function remove(id: string) {
  return prisma.iotDevice.delete({ where: { id } });
}

export async function findGateways() {
  return prisma.iotDevice.findMany({
    where: { type: 'GATEWAY' },
    include: { site: true },
  });
}

export async function getStats() {
  const devices = await prisma.iotDevice.findMany();
  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const avgLatency = devices.length
    ? devices.reduce((acc, d) => acc + (d.latencyMs || 100), 0) / devices.length
    : 184;
  const avgPacketLoss = devices.length
    ? devices.reduce((acc, d) => acc + (d.packetLossPct || 1.3), 0) / devices.length
    : 1.3;

  return {
    totalDevices: devices.length,
    onlineDevices: onlineCount,
    offlineDevices: devices.length - onlineCount,
    gatewaysOnline: `${onlineCount} / ${devices.length}`,
    avgLatencyMs: Math.round(avgLatency),
    packetDeliveryPct: Math.round((100 - avgPacketLoss) * 10) / 10,
    activeDevicesCount: devices.length,
  };
}

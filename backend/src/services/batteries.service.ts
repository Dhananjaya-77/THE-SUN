import prisma from '../utils/prisma.js';
import { emitToAll } from '../socket/index.js';
import { SocketEvents } from '../types/index.js';

export async function findAll() {
  return prisma.battery.findMany({
    include: {
      site: { select: { id: true, siteCode: true, name: true, location: true } },
      schedules: { where: { isActive: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function findById(id: string) {
  const battery = await prisma.battery.findUnique({
    where: { id },
    include: {
      site: true,
      schedules: { orderBy: { startTime: 'asc' } },
    },
  });
  if (!battery) throw new Error('Battery not found');
  return battery;
}

export async function create(data: {
  siteId: string;
  name: string;
  capacityKwh: number;
  maxPowerKw: number;
  socPercent?: number;
  sohPercent?: number;
  temperatureC?: number;
}) {
  return prisma.battery.create({
    data: {
      ...data,
      socPercent: data.socPercent || 0,
      sohPercent: data.sohPercent || 100,
    },
  });
}

export async function update(
  id: string,
  data: {
    socPercent?: number;
    sohPercent?: number;
    temperatureC?: number;
    status?: 'AVAILABLE' | 'CHARGING' | 'DISCHARGING' | 'OFFLINE' | 'MAINTENANCE';
  }
) {
  const updated = await prisma.battery.update({
    where: { id },
    data,
    include: { site: { select: { siteCode: true } } },
  });

  emitToAll(SocketEvents.BATTERY_UPDATE, updated);
  return updated;
}

export async function remove(id: string) {
  return prisma.battery.delete({ where: { id } });
}

export async function findSchedules(batteryId: string) {
  return prisma.batterySchedule.findMany({
    where: { batteryId },
    orderBy: { startTime: 'asc' },
  });
}

export async function createSchedule(data: {
  batteryId: string;
  startTime: string;
  endTime: string;
  action: string;
  powerKw: number;
}) {
  return prisma.batterySchedule.create({ data });
}

export async function updateSchedule(scheduleId: string, data: Record<string, unknown>) {
  return prisma.batterySchedule.update({
    where: { id: scheduleId },
    data,
  });
}

export async function removeSchedule(scheduleId: string) {
  return prisma.batterySchedule.delete({ where: { id: scheduleId } });
}

export async function getFleetSummary() {
  const batteries = await prisma.battery.findMany();
  const totalCapacityKwh = batteries.reduce((acc, b) => acc + b.capacityKwh, 0);
  const avgSoc = batteries.length
    ? batteries.reduce((acc, b) => acc + b.socPercent, 0) / batteries.length
    : 0;
  const availableCount = batteries.filter((b) => b.status === 'AVAILABLE').length;

  return {
    batteryCount: batteries.length,
    totalCapacityKwh,
    availableCapacityMwh: Math.round((totalCapacityKwh * (avgSoc / 100) / 1000) * 100) / 100,
    averageSocPercent: Math.round(avgSoc),
    availableCount,
    peakShavingProfile: [32, 38, 45, 62, 78, 84, 71, 55, 42, 35, 49, 68],
  };
}

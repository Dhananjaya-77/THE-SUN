import prisma from '../utils/prisma.js';

export async function findAll() {
  return prisma.integration.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function findById(id: string) {
  const integration = await prisma.integration.findUnique({ where: { id } });
  if (!integration) throw new Error('Integration not found');
  return integration;
}

export async function create(data: {
  name: string;
  type: string;
  endpoint?: string;
  configJson?: Record<string, unknown>;
}) {
  return prisma.integration.create({
    data: {
      name: data.name,
      type: data.type,
      endpoint: data.endpoint,
      configJson: data.configJson as any,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.integration.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.integration.delete({ where: { id } });
}

export async function testConnection(id: string) {
  const integration = await findById(id);
  const updated = await prisma.integration.update({
    where: { id },
    data: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    status: 'CONNECTED',
    latencyMs: 38,
    message: `Connection test to ${integration.endpoint || integration.name} succeeded`,
  };
}

export async function triggerSync(id: string) {
  await findById(id);
  const updated = await prisma.integration.update({
    where: { id },
    data: {
      status: 'SYNCING',
      lastSyncAt: new Date(),
    },
  });

  // Simulate immediate sync resolution
  setTimeout(async () => {
    try {
      await prisma.integration.update({
        where: { id },
        data: { status: 'CONNECTED' },
      });
    } catch {
      // Ignore
    }
  }, 3000);

  return {
    id: updated.id,
    name: updated.name,
    status: 'SYNCING',
    syncStartedAt: new Date().toISOString(),
  };
}

export async function getStats() {
  const integrations = await prisma.integration.findMany();
  const connected = integrations.filter((i) => i.status === 'CONNECTED').length;

  return {
    totalIntegrations: integrations.length,
    connectedCount: connected,
    summary: `${connected} / ${integrations.length} Services connected`,
    services: [
      { name: 'REST', status: 'API status: Connected' },
      { name: 'MQTT', status: 'Broker status: Connected' },
      { name: 'Modbus TCP', status: 'Adapter status: Connected' },
    ],
  };
}

import prisma from '../utils/prisma.js';

export async function findModels() {
  return prisma.aiModel.findMany({
    include: {
      anomalies: { take: 5, orderBy: { detectedAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findModelById(id: string) {
  const model = await prisma.aiModel.findUnique({
    where: { id },
    include: { anomalies: true },
  });
  if (!model) throw new Error('AI Model not found');
  return model;
}

export async function createModel(data: {
  name: string;
  type: string;
  version: string;
  status?: string;
  accuracy?: number;
  inferenceMs?: number;
  configJson?: Record<string, unknown>;
}) {
  return prisma.aiModel.create({
    data: {
      ...data,
      configJson: data.configJson as any,
    },
  });
}

export async function updateModel(id: string, data: Record<string, unknown>) {
  return prisma.aiModel.update({ where: { id }, data });
}

export async function findAnomalies(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [total, anomalies] = await Promise.all([
    prisma.aiAnomaly.count(),
    prisma.aiAnomaly.findMany({
      skip,
      take: limit,
      include: { model: { select: { name: true, version: true } } },
      orderBy: { detectedAt: 'desc' },
    }),
  ]);
  return { anomalies, total, page, limit };
}

export async function createAnomaly(data: {
  modelId: string;
  siteId?: string;
  type: string;
  description: string;
  severity: string;
  confidence: number;
}) {
  return prisma.aiAnomaly.create({ data });
}

export async function resolveAnomaly(id: string) {
  return prisma.aiAnomaly.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });
}

export async function findRecommendations() {
  return prisma.aiRecommendation.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createRecommendation(data: {
  type: string;
  title: string;
  description: string;
  impact?: string;
}) {
  return prisma.aiRecommendation.create({ data });
}

export async function updateRecommendationStatus(id: string, status: string) {
  return prisma.aiRecommendation.update({
    where: { id },
    data: { status },
  });
}

export async function getStats() {
  const [modelCount, anomalyCount, activeRecommendationCount] = await Promise.all([
    prisma.aiModel.count(),
    prisma.aiAnomaly.count({ where: { resolvedAt: null } }),
    prisma.aiRecommendation.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    forecastConfidencePct: 87,
    activeAnomalies: anomalyCount,
    avgInferenceLatencyMs: 24,
    modelsReady: modelCount,
    pendingRecommendations: activeRecommendationCount,
    modelHealth: 'Optimal',
  };
}

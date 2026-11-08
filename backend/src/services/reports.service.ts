import prisma from '../utils/prisma.js';

export async function findAll(filter: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.type) where.type = filter.type;
  if (filter.status) where.status = filter.status;

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { reports, total, page, limit };
}

export async function findById(id: string) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new Error('Report not found');
  return report;
}

export async function generate(data: {
  name: string;
  type: string;
  format?: string;
  parameters?: Record<string, unknown>;
}) {
  const report = await prisma.report.create({
    data: {
      name: data.name,
      type: data.type,
      format: data.format || 'PDF',
      parameters: data.parameters as any,
      status: 'COMPLETED',
      generatedUrl: `/reports/export-${Date.now()}.${(data.format || 'PDF').toLowerCase()}`,
    },
  });
  return report;
}

export async function remove(id: string) {
  return prisma.report.delete({ where: { id } });
}

export async function findSchedules() {
  return prisma.reportSchedule.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSchedule(data: {
  reportType: string;
  cronExpr: string;
  recipients?: Record<string, unknown>;
}) {
  const now = new Date();
  return prisma.reportSchedule.create({
    data: {
      reportType: data.reportType,
      cronExpr: data.cronExpr,
      recipients: data.recipients as any,
      isActive: true,
      nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function updateSchedule(id: string, data: Record<string, unknown>) {
  return prisma.reportSchedule.update({ where: { id }, data });
}

export async function removeSchedule(id: string) {
  return prisma.reportSchedule.delete({ where: { id } });
}

export async function getTemplates() {
  return [
    { code: 'FLEET_SUMMARY', name: 'Daily Fleet Performance Summary', format: 'PDF / CSV', description: 'Comprehensive energy, uptime, and alarm metrics' },
    { code: 'REGULATORY', name: 'CEB/LECO Regulatory Compliance Report', format: 'PDF', description: 'Statutory grid standard compliance pack' },
    { code: 'PERFORMANCE', name: 'Performance Ratio & Loss Breakdown', format: 'CSV', description: 'Inverter-level degradation, soiling, and thermal losses' },
    { code: 'CARBON', name: 'Carbon & Fuel Savings Certificate', format: 'PDF', description: 'Avoided CO₂ emissions and fossil fuel displacement calculations' },
  ];
}

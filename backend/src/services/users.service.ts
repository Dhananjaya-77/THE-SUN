import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';

interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
}

export async function findAll(filter: UserFilter) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter.role) {
    where.role = filter.role;
  }
  if (filter.search) {
    where.OR = [
      { email: { contains: filter.search, mode: 'insensitive' } },
      { firstName: { contains: filter.search, mode: 'insensitive' } },
      { lastName: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { users, total, page, limit };
}

export async function findById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      siteScopes: {
        include: {
          site: true,
        },
      },
    },
  });

  if (!user) throw new Error('User not found');
  return user;
}

export async function update(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    role?: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
    isActive?: boolean;
    password?: string;
  }
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
}

export async function deactivate(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, email: true, isActive: true },
  });
}

export async function getScopes(userId: string) {
  return prisma.userSiteScope.findMany({
    where: { userId },
    include: { site: true },
  });
}

export async function assignScope(userId: string, siteId: string) {
  return prisma.userSiteScope.upsert({
    where: { userId_siteId: { userId, siteId } },
    update: {},
    create: { userId, siteId },
    include: { site: true },
  });
}

export async function removeScope(userId: string, siteId: string) {
  return prisma.userSiteScope.deleteMany({
    where: { userId, siteId },
  });
}

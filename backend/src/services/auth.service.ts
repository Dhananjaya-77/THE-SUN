import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { config } from '../config/index.js';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
}

interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role || 'READONLY',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: input.userAgent || null,
      ipAddress: input.ipAddress || null,
      expiresAt,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string; email: string; role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY' };

    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      throw new Error('Invalid or expired refresh token');
    }

    const payload = { id: session.user.id, email: session.user.email, role: session.user.role };
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { accessToken };
  } catch {
    throw new Error('Invalid refresh token');
  }
}

export async function logout(token: string) {
  await prisma.session.deleteMany({
    where: { refreshToken: token },
  });
  return true;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      siteScopes: {
        include: {
          site: {
            select: {
              id: true,
              siteCode: true,
              name: true,
              district: true,
              province: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

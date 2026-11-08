declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
      };
    }
  }
}

export {};

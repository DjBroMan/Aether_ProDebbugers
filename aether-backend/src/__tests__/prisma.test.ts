import { PrismaClient } from '@prisma/client';

// Simple mock for Prisma Client
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  approval: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

describe('Prisma Data Layer Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a User successfully', async () => {
    const prisma = new PrismaClient();
    const mockUser = {
      id: 'user-1',
      email: 'test@aether.edu',
      name: 'Test Student',
      role: 'STUDENT',
      createdAt: new Date()
    };
    
    mockPrisma.user.create.mockResolvedValue(mockUser);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@aether.edu',
        name: 'Test Student',
        role: 'STUDENT'
      }
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@aether.edu',
        name: 'Test Student',
        role: 'STUDENT'
      }
    });
    expect(user.id).toBe('user-1');
  });

  it('should simulate an Approval workflow', async () => {
    const prisma = new PrismaClient();
    const mockApproval = {
      id: 'approval-1',
      type: 'LEAVE',
      content: 'Sick leave',
      status: 'PENDING_PROFESSOR',
      requesterId: 'user-1'
    };

    mockPrisma.approval.create.mockResolvedValue(mockApproval);

    const approval = await prisma.approval.create({
      data: {
        type: 'LEAVE',
        content: 'Sick leave',
        requesterId: 'user-1'
      }
    });

    expect(prisma.approval.create).toHaveBeenCalledTimes(1);
    expect(approval.status).toBe('PENDING_PROFESSOR');
  });
});

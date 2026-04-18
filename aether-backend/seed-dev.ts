import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const devId = 'dummy'; // the default mock ID from LandingScreen fallback
  const devId2 = 'dev123'; // the "Enter Developer Mode" mock ID

  // Create or upsert the Developer User structurally
  for (const id of [devId, devId2]) {
    await prisma.user.upsert({
      where: { email: `dev_${id}@aether.university` },
      update: {},
      create: {
        id,
        email: `dev_${id}@aether.university`,
        name: 'Aether Architect',
        role: 'STUDENT',
      },
    });
  }

  // Clear existing mock data softly
  await prisma.task.deleteMany({ where: { assigneeId: devId2 } });
  await prisma.event.deleteMany();

  // Create dummy tasks
  await prisma.task.create({
    data: {
      title: 'Submit Lab Record for Physics',
      deadline: new Date(Date.now() + 86400000), // tomorrow
      status: 'PENDING',
      assigneeId: devId2
    }
  });

  // Create dummy Schedule
  await prisma.event.createMany({
    data: [
      {
        title: 'Advanced Data Structures',
        location: 'Block C, Room 402',
        startTime: new Date(Date.now() + 1800000), // 30 mins from now
        endTime: new Date(Date.now() + 5400000),
        professorId: 'prof1'
      },
      {
        title: 'Quantum Physics',
        location: 'Block A, Lab 2',
        startTime: new Date(Date.now() + 9000000), // 2.5 hours from now
        endTime: new Date(Date.now() + 12600000),
        professorId: 'prof2'
      },
      {
        title: 'Machine Learning Ethics',
        location: 'Virtual Classroom 1',
        startTime: new Date(Date.now() + 16200000), // 4.5 hours from now
        endTime: new Date(Date.now() + 19800000),
        professorId: 'prof3'
      }
    ]
  });

  console.log('Seeded Dev Campus Environment successfully!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

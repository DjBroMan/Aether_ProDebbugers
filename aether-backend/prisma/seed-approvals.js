const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Clear old clutter
  await prisma.notification.deleteMany({});
  await prisma.approval.deleteMany({});
  console.log('✓ Cleared notifications and approvals');

  // 2. Ensure demo users exist for all roles
  const roles = [
    { id: 'demo-student', name: 'Priyank Sharma', email: 'priyank.s@aether.edu', role: 'STUDENT' },
    { id: 'demo-faculty', name: 'Prof. M. Rao', email: 'prof.rao@aether.edu', role: 'PROFESSOR' },
    { id: 'demo-hod', name: 'Dr. Anita Desai', email: 'hod.desai@aether.edu', role: 'HOD' },
    { id: 'demo-principal', name: 'Dr. R. Krishnan', email: 'principal@aether.edu', role: 'PRINCIPAL' },
    { id: 'demo-admin', name: 'Admin Office', email: 'admin@aether.edu', role: 'ADMIN' },
  ];
  for (const u of roles) {
    await prisma.user.upsert({ where: { id: u.id }, update: { name: u.name, role: u.role }, create: u });
  }
  console.log('✓ Upserted 5 demo users');

  // 3. Seed 3 clean approval requests at different stages of the chain
  await prisma.approval.createMany({
    data: [
      {
        type: 'Leave',
        content: JSON.stringify({ reason: 'Medical appointment on Apr 22', duration: '1 day' }),
        status: 'PENDING_PROFESSOR',
        requesterId: 'demo-student',
      },
      {
        type: 'Room Booking',
        content: JSON.stringify({ room: 'Auditorium', date: 'Apr 25', time: '14:00–16:00', event: 'ACM Workshop' }),
        status: 'PENDING_HOD',
        requesterId: 'demo-student',
      },
      {
        type: 'Bonafide',
        content: JSON.stringify({ purpose: 'Passport application', urgency: 'Medium' }),
        status: 'COMPLETED',
        requesterId: 'demo-student',
      },
    ],
  });
  console.log('✓ Seeded 3 clean approvals at different chain stages');
  console.log('  → Leave: PENDING_PROFESSOR (awaits Faculty)');
  console.log('  → Room Booking: PENDING_HOD (already cleared by Faculty, awaits HOD)');
  console.log('  → Bonafide: COMPLETED (fully approved)');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Campus Data Seeding...\n');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected\n');

    // 1. Clear only the tables we're replacing
    console.log('📦 Clearing old data...');
    const notifCount = await prisma.notification.deleteMany({});
    const approvalCount = await prisma.approval.deleteMany({});
    const ticketCount = await prisma.ticket.deleteMany({});
    const taskCount = await prisma.task.deleteMany({});
    const eventCount = await prisma.event.deleteMany({});
    const announcementCount = await prisma.announcement.deleteMany({});
    
    console.log(`✓ Cleared:`);
    console.log(`  - ${notifCount.count} notifications`);
    console.log(`  - ${approvalCount.count} approvals`);
    console.log(`  - ${ticketCount.count} tickets`);
    console.log(`  - ${taskCount.count} tasks`);
    console.log(`  - ${eventCount.count} events`);
    console.log(`  - ${announcementCount.count} announcements\n`);

    // 2. Seed Users (upsert to preserve existing users not in this list)
    console.log('👥 Seeding users...');
    const usersData = [
      { id: 'user-1', name: 'Priyank', email: 'priyank@aether.edu', role: 'STUDENT' },
      { id: 'user-2', name: 'Harshav', email: 'harshav@aether.edu', role: 'STUDENT' },
      { id: 'user-3', name: 'Ananya', email: 'ananya@aether.edu', role: 'STUDENT' },
      { id: 'user-4', name: 'Rahul', email: 'rahul@aether.edu', role: 'STUDENT' },
      
      { id: 'user-5', name: 'Dr. Mehta', email: 'mehta@aether.edu', role: 'PROFESSOR' },
      { id: 'user-6', name: 'Prof. Iyer', email: 'iyer@aether.edu', role: 'PROFESSOR' },
      { id: 'user-7', name: 'Dr. Sharma', email: 'sharma@aether.edu', role: 'HOD' },
      { id: 'user-8', name: 'Dr. Kapoor', email: 'kapoor@aether.edu', role: 'HOD' },
      
      { id: 'user-9', name: 'Dean Verma', email: 'dean@aether.edu', role: 'PRINCIPAL' },
      { id: 'user-10', name: 'Principal Rao', email: 'principal@aether.edu', role: 'ADMIN' },
    ];

    let createdUsers = 0;
    for (const u of usersData) {
      const result = await prisma.user.upsert({
        where: { id: u.id },
        update: { name: u.name, email: u.email, role: u.role },
        create: u,
      });
      createdUsers++;
    }
    console.log(`✓ Seeded ${createdUsers} users\n`);

    // 3. Seed Approvals (mapped from requests)
    console.log('📋 Seeding approvals...');
    const approvalsData = [
      {
        type: 'Leave',
        content: JSON.stringify({ title: 'Medical Leave', reason: 'Fever for 2 days' }),
        status: 'COMPLETED',
        requesterId: 'user-1',
      },
      {
        type: 'Issue',
        content: JSON.stringify({ title: 'WiFi not working', description: 'Internet down in lab' }),
        status: 'PENDING_PROFESSOR',
        requesterId: 'user-2',
      },
      {
        type: 'Certificate',
        content: JSON.stringify({ title: 'Bonafide Certificate', reason: 'Needed for internship' }),
        status: 'COMPLETED',
        requesterId: 'user-3',
      },
      {
        type: 'Room Booking',
        content: JSON.stringify({ title: 'Book room for event', room: 'Need seminar hall' }),
        status: 'REJECTED',
        requesterId: 'user-4',
      },
      {
        type: 'Leave',
        content: JSON.stringify({ title: 'Family Function', reason: 'Out of station' }),
        status: 'PENDING_PROFESSOR',
        requesterId: 'user-1',
      },
    ];

    const approvalsResult = await prisma.approval.createMany({ data: approvalsData });
    console.log(`✓ Seeded ${approvalsResult.count} approvals\n`);

    // 4. Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notificationsData = [
      { message: 'Leave approved', type: 'APPROVAL', isRead: false, userId: 'user-1' },
      { message: 'Issue received', type: 'TICKET_RESOLVED', isRead: false, userId: 'user-2' },
      { message: 'Certificate ready', type: 'APPROVAL', isRead: true, userId: 'user-3' },
      { message: 'Room request rejected', type: 'REJECTION', isRead: false, userId: 'user-4' },
      { message: 'HOD commented on your request', type: 'ANNOUNCEMENT', isRead: false, userId: 'user-1' },
    ];

    const notificationsResult = await prisma.notification.createMany({ data: notificationsData });
    console.log(`✓ Seeded ${notificationsResult.count} notifications\n`);

    // 5. Seed Tickets (mapped from issues)
    console.log('🎫 Seeding tickets...');
    const ticketsData = [
      {
        title: 'WiFi Issue',
        description: 'No internet in lab',
        status: 'OPEN',
        authorId: 'user-2',
      },
      {
        title: 'Projector Fault',
        description: 'Projector not working in R102',
        status: 'RESOLVED',
        authorId: 'user-4',
      },
      {
        title: 'AC not working',
        description: 'Room too hot',
        status: 'OPEN',
        authorId: 'user-3',
      },
    ];

    const ticketsResult = await prisma.ticket.createMany({ data: ticketsData });
    console.log(`✓ Seeded ${ticketsResult.count} tickets\n`);

    // 6. Seed Events
    console.log('📅 Seeding events...');
    const eventsData = [
      {
        title: 'DBMS Lecture',
        startTime: new Date('2026-04-19T09:00:00Z'),
        endTime: new Date('2026-04-19T10:00:00Z'),
        location: 'Lab-1',
        professorId: 'user-5',
      },
      {
        title: 'AI Seminar by Dean',
        startTime: new Date('2026-04-20T10:00:00Z'),
        endTime: new Date('2026-04-20T12:00:00Z'),
        location: 'SeminarHall',
        professorId: 'user-9',
      },
      {
        title: 'Tech Club Event',
        startTime: new Date('2026-04-20T11:00:00Z'),
        endTime: new Date('2026-04-20T13:00:00Z'),
        location: 'SeminarHall',
        professorId: 'user-1',
      },
    ];

    const eventsResult = await prisma.event.createMany({ data: eventsData });
    console.log(`✓ Seeded ${eventsResult.count} events\n`);

    console.log('✅ Campus data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • ${createdUsers} users`);
    console.log(`  • ${approvalsResult.count} approvals`);
    console.log(`  • ${notificationsResult.count} notifications`);
    console.log(`  • ${ticketsResult.count} tickets`);
    console.log(`  • ${eventsResult.count} events`);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


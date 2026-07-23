import { prisma } from './src/config/prisma.js';

async function main() {
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        endsWith: '@test.com',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const testUserIds = testUsers.map((user) => user.id);

  console.log(`Found ${testUsers.length} test users.`);

  if (testUserIds.length === 0) {
    console.log('No test users found.');
    return;
  }

  const testItems = await prisma.item.findMany({
    where: {
      ownerId: {
        in: testUserIds,
      },
    },
    select: {
      id: true,
    },
  });

  const testItemIds = testItems.map((item) => item.id);

  const testBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { renterId: { in: testUserIds } },
        { itemId: { in: testItemIds } },
      ],
    },
    select: {
      id: true,
    },
  });

  const testBookingIds = testBookings.map((booking) => booking.id);

  console.log(`Found ${testItems.length} test items.`);
  console.log(`Found ${testBookings.length} test bookings.`);

  // Delete comparisons first
  if (testBookingIds.length > 0) {
    await prisma.conditionComparison.deleteMany({
      where: {
        bookingId: {
          in: testBookingIds,
        },
      },
    });

    // Delete evidence
    await prisma.conditionEvidence.deleteMany({
      where: {
        bookingId: {
          in: testBookingIds,
        },
      },
    });

    // Delete payments
    await prisma.payment.deleteMany({
      where: {
        bookingId: {
          in: testBookingIds,
        },
      },
    });

    // Delete bookings
    await prisma.booking.deleteMany({
      where: {
        id: {
          in: testBookingIds,
        },
      },
    });
  }

  // Delete images belonging to test items
  if (testItemIds.length > 0) {
    await prisma.itemImage.deleteMany({
      where: {
        itemId: {
          in: testItemIds,
        },
      },
    });

    // Delete items
    await prisma.item.deleteMany({
      where: {
        id: {
          in: testItemIds,
        },
      },
    });
  }

  // Finally delete test users
  await prisma.user.deleteMany({
    where: {
      id: {
        in: testUserIds,
      },
    },
  });

  console.log('Test data cleanup completed successfully.');
}

main()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
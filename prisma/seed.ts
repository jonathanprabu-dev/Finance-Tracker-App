import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The app ships with no demo data — it starts empty so you can enter your own
// accounts, transactions, liabilities, and holdings. Running this seed simply
// clears every table back to that empty state.
async function main() {
  console.log("Clearing all data (empty starting state)...");

  await prisma.netWorthSnapshot.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.liability.deleteMany();
  await prisma.account.deleteMany();

  console.log("Done. The app is now empty.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

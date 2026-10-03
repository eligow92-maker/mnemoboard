import { PrismaClient } from "@prisma/client";
import { seedPegWords } from "../src/modules/word-images/seed";

const prisma = new PrismaClient();

seedPegWords(prisma)
  .then(async () => {
    console.log(`Lista GSP: ${await prisma.pegWord.count()} haseł`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const randomBool = () => Math.random() > 0.5;

const dummyUsers = [
  { name: 'Alice Johnson',    mobileNumber: '9876543210', email: 'alice.johnson@example.com' },
  { name: 'Bob Smith',        mobileNumber: '9123456780', email: 'bob.smith@example.com' },
  { name: 'Carol White',      mobileNumber: '9988776655', email: 'carol.white@example.com' },
  { name: 'David Brown',      mobileNumber: '9871234567', email: 'david.brown@example.com' },
  { name: 'Eva Martinez',     mobileNumber: '9765432109', email: 'eva.martinez@example.com' },
  { name: 'Frank Lee',        mobileNumber: '9654321098', email: 'frank.lee@example.com' },
  { name: 'Grace Kim',        mobileNumber: '9543210987', email: 'grace.kim@example.com' },
  { name: 'Henry Wilson',     mobileNumber: '9432109876', email: 'henry.wilson@example.com' },
  { name: 'Irene Taylor',     mobileNumber: '9321098765', email: 'irene.taylor@example.com' },
  { name: 'Jack Anderson',    mobileNumber: '9210987654', email: 'jack.anderson@example.com' },
  { name: 'Karen Thomas',     mobileNumber: '9109876543', email: 'karen.thomas@example.com' },
  { name: 'Liam Jackson',     mobileNumber: '9098765432', email: 'liam.jackson@example.com' },
  { name: 'Mona Harris',      mobileNumber: '9987654321', email: 'mona.harris@example.com' },
  { name: 'Nathan Clark',     mobileNumber: '9876012345', email: 'nathan.clark@example.com' },
  { name: 'Olivia Lewis',     mobileNumber: '9765901234', email: 'olivia.lewis@example.com' },
  { name: 'Peter Robinson',   mobileNumber: '9654890123', email: 'peter.robinson@example.com' },
  { name: 'Quinn Walker',     mobileNumber: '9543789012', email: 'quinn.walker@example.com' },
  { name: 'Rachel Hall',      mobileNumber: '9432678901', email: 'rachel.hall@example.com' },
  { name: 'Samuel Allen',     mobileNumber: '9321567890', email: 'samuel.allen@example.com' },
  { name: 'Tina Young',       mobileNumber: '9210456789', email: 'tina.young@example.com' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters for FK constraints)
  await prisma.notificationLog.deleteMany();
  await prisma.user.deleteMany();

  const created = await Promise.all(
    dummyUsers.map((u) =>
      prisma.user.create({
        data: {
          ...u,
          sms:          randomBool(),
          emailChannel: randomBool(),
          whatsapp:     randomBool(),
          inapp:        randomBool(),
        },
      })
    )
  );

  console.log(`✅ Seeded ${created.length} users successfully.`);
  created.forEach((u) =>
    console.log(
      `   [${u.id}] ${u.name.padEnd(20)} sms=${u.sms} email=${u.emailChannel} wa=${u.whatsapp} inapp=${u.inapp}`
    )
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

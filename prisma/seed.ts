import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient, JobStatus, BudgetCategory, ChangeOrderStatus } from "../src/generated/prisma/client";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create clients
  const acme = await prisma.client.create({
    data: {
      name: "Acme Properties LLC",
      email: "contact@acmeproperties.com",
      phone: "(480) 555-0101",
      address: "4500 N Scottsdale Rd, Scottsdale, AZ 85251",
      notes: "Commercial property management company. Prefers email communication.",
    },
  });

  const johnson = await prisma.client.create({
    data: {
      name: "Mike & Sarah Johnson",
      email: "mjohnson@email.com",
      phone: "(602) 555-0145",
      address: "1234 Desert Rose Ln, Phoenix, AZ 85016",
      notes: "Referred by the Williams family. Want full backyard renovation.",
    },
  });

  const riverdale = await prisma.client.create({
    data: {
      name: "Riverdale HOA",
      email: "board@riverdalehoa.org",
      phone: "(623) 555-0188",
      address: "200 Riverdale Community Dr, Surprise, AZ 85374",
      notes: "Annual maintenance contract. Contact is Karen Mills, board treasurer.",
    },
  });

  // Job 1: In Progress
  const job1 = await prisma.job.create({
    data: {
      jobNumber: "HK-2026-001",
      title: "Full Backyard Renovation",
      description: "Complete backyard overhaul including pool surround, artificial turf, pergola, and drip irrigation system.",
      siteAddress: "1234 Desert Rose Ln, Phoenix, AZ 85016",
      status: JobStatus.IN_PROGRESS,
      estimatedStartDate: new Date("2026-03-15"),
      actualStartDate: new Date("2026-03-17"),
      estimatedEndDate: new Date("2026-04-20"),
      estimatedBudget: 48500,
      clientId: johnson.id,
      budgetItems: {
        create: [
          {
            category: BudgetCategory.LABOR,
            description: "Site prep and excavation",
            estimatedAmount: 4200,
            actualAmount: 4500,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Artificial turf (650 sq ft)",
            estimatedAmount: 9750,
            actualAmount: 9750,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Concrete pavers - pool surround",
            estimatedAmount: 7800,
            actualAmount: 8100,
          },
          {
            category: BudgetCategory.LABOR,
            description: "Pergola framing and install",
            estimatedAmount: 6500,
            actualAmount: 0,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Drip irrigation system",
            estimatedAmount: 3200,
            actualAmount: 0,
          },
          {
            category: BudgetCategory.SUBCONTRACTOR,
            description: "Electrical - pergola lighting",
            estimatedAmount: 2800,
            actualAmount: 0,
          },
        ],
      },
      changeOrders: {
        create: [
          {
            coNumber: 1,
            description: "Upgrade pergola to steel frame vs wood",
            amount: 2400,
            status: ChangeOrderStatus.APPROVED,
            approvedAt: new Date("2026-03-20"),
          },
          {
            coNumber: 2,
            description: "Add outdoor misting system",
            amount: 1850,
            status: ChangeOrderStatus.PENDING,
          },
        ],
      },
      jobNotes: {
        create: [
          {
            content: "Excavation and grading completed 3/19. Turf base compacted and ready.",
            createdAt: new Date("2026-03-19"),
          },
          {
            content: "Pavers delivered. Started laying pool surround section. Client stopped by, happy with progress.",
            createdAt: new Date("2026-03-25"),
          },
        ],
      },
      scheduleBlocks: {
        create: [
          {
            title: "Pergola framing",
            start: new Date("2026-04-07T07:00:00"),
            end: new Date("2026-04-09T17:00:00"),
            notes: "2-person crew: Carlos + Diego",
          },
          {
            title: "Irrigation install",
            start: new Date("2026-04-10T07:00:00"),
            end: new Date("2026-04-11T17:00:00"),
          },
        ],
      },
    },
  });

  // Job 2: Estimate stage
  const job2 = await prisma.job.create({
    data: {
      jobNumber: "HK-2026-002",
      title: "Commercial Entrance Landscaping",
      description: "Redesign of main entrance landscaping for office complex. Includes new planting beds, decorative rock, and updated irrigation.",
      siteAddress: "4500 N Scottsdale Rd, Scottsdale, AZ 85251",
      status: JobStatus.ESTIMATE,
      estimatedBudget: 22000,
      clientId: acme.id,
      budgetItems: {
        create: [
          {
            category: BudgetCategory.LABOR,
            description: "Demo and removal of existing landscaping",
            estimatedAmount: 2800,
            actualAmount: 0,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Desert plants and shrubs",
            estimatedAmount: 5400,
            actualAmount: 0,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Decomposed granite and boulders",
            estimatedAmount: 3600,
            actualAmount: 0,
          },
          {
            category: BudgetCategory.LABOR,
            description: "Install and planting",
            estimatedAmount: 6200,
            actualAmount: 0,
          },
        ],
      },
    },
  });

  // Job 3: Complete, invoiced
  const job3 = await prisma.job.create({
    data: {
      jobNumber: "HK-2026-003",
      title: "HOA Common Area Spring Cleanup",
      description: "Annual spring cleanup of all HOA common areas: trim shrubs, refresh mulch, clean up winter damage, fertilize turf.",
      siteAddress: "200 Riverdale Community Dr, Surprise, AZ 85374",
      status: JobStatus.INVOICED,
      estimatedStartDate: new Date("2026-03-03"),
      actualStartDate: new Date("2026-03-03"),
      estimatedEndDate: new Date("2026-03-05"),
      actualEndDate: new Date("2026-03-05"),
      estimatedBudget: 4800,
      clientId: riverdale.id,
      budgetItems: {
        create: [
          {
            category: BudgetCategory.LABOR,
            description: "3-person crew, 3 days",
            estimatedAmount: 3600,
            actualAmount: 3600,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Mulch (12 yards)",
            estimatedAmount: 840,
            actualAmount: 780,
          },
          {
            category: BudgetCategory.MATERIALS,
            description: "Fertilizer and supplies",
            estimatedAmount: 360,
            actualAmount: 310,
          },
        ],
      },
      jobNotes: {
        create: [
          {
            content: "All common areas complete. Submitted invoice #1042 on 3/6.",
            createdAt: new Date("2026-03-06"),
          },
        ],
      },
    },
  });

  // Job 4: Lead
  await prisma.job.create({
    data: {
      jobNumber: "HK-2026-004",
      title: "Front Yard Desert Xeriscape",
      description: "Replace grass with drought-tolerant xeriscape design. Potential client from HOA referral.",
      status: JobStatus.LEAD,
      siteAddress: "8821 W Cactus Wren Ct, Peoria, AZ 85382",
      clientId: riverdale.id,
    },
  });

  console.log("✓ Created 3 clients");
  console.log("✓ Created 4 jobs (Lead, Estimate, In Progress, Invoiced)");
  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

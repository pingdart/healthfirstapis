import { PrismaClient } from "@prisma/client";

let tableEnsured = false;

export function formatDbPackage(row: any): any {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    price: Number(row.price) || 0,
    originalPrice: Number(row.originalPrice) || 0,
    testsCount: Number(row.testsCount) || 0,
    popular: Boolean(row.popular === 1 || row.popular === true || row.popular === "1"),
    featured: Boolean(row.featured === 1 || row.featured === true || row.featured === "1"),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function ensureHealthPackageTable(prisma: PrismaClient) {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`HealthPackage\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`title\` VARCHAR(191) NOT NULL,
        \`subtitle\` TEXT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`category\` VARCHAR(191) NOT NULL DEFAULT 'Comprehensive',
        \`price\` INT NOT NULL,
        \`originalPrice\` INT NOT NULL,
        \`discount\` VARCHAR(191) NULL,
        \`recommendedFor\` TEXT NULL,
        \`fasting\` VARCHAR(191) NULL DEFAULT '10-12 hours fasting required',
        \`reportTime\` VARCHAR(191) NULL DEFAULT 'Same day delivery (6-8 hours)',
        \`popular\` TINYINT(1) NOT NULL DEFAULT 0,
        \`featured\` TINYINT(1) NOT NULL DEFAULT 0,
        \`status\` VARCHAR(191) NOT NULL DEFAULT 'Active',
        \`testsCount\` INT NOT NULL DEFAULT 0,
        \`testsIncluded\` LONGTEXT NULL,
        \`icon\` VARCHAR(191) NULL DEFAULT 'HeartPulse',
        \`color\` VARCHAR(191) NULL DEFAULT 'emerald',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (err: any) {
    console.warn("Could not auto-create HealthPackage table (might already exist):", err.message);
  }
}

export async function getHealthPackagesRaw(
  prisma: PrismaClient,
  args: { category?: string; status?: string; featured?: boolean }
) {
  await ensureHealthPackageTable(prisma);
  let sql = "SELECT * FROM `HealthPackage` WHERE 1=1";
  const params: any[] = [];

  if (args.category && args.category !== "All") {
    sql += " AND `category` = ?";
    params.push(args.category);
  }
  if (args.status && args.status !== "All") {
    sql += " AND `status` = ?";
    params.push(args.status);
  }
  if (args.featured !== undefined) {
    sql += " AND `featured` = ?";
    params.push(args.featured ? 1 : 0);
  }

  sql += " ORDER BY `featured` DESC, `popular` DESC, `id` ASC";

  const rows: any = await prisma.$queryRawUnsafe(sql, ...params);
  return Array.isArray(rows) ? rows.map(formatDbPackage) : [];
}

export async function getHealthPackageByIdRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

export async function getHealthPackageBySlugRaw(prisma: PrismaClient, slug: string) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `slug` = ? LIMIT 1", slug);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

export async function addHealthPackageRaw(prisma: PrismaClient, args: any) {
  await ensureHealthPackageTable(prisma);

  const slug = args.slug || args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await prisma.$executeRawUnsafe(
    `INSERT INTO \`HealthPackage\` (
      \`title\`, \`subtitle\`, \`slug\`, \`category\`, \`price\`, \`originalPrice\`,
      \`discount\`, \`recommendedFor\`, \`fasting\`, \`reportTime\`, \`popular\`,
      \`featured\`, \`status\`, \`testsCount\`, \`testsIncluded\`, \`icon\`, \`color\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      \`title\` = VALUES(\`title\`),
      \`subtitle\` = VALUES(\`subtitle\`),
      \`price\` = VALUES(\`price\`),
      \`originalPrice\` = VALUES(\`originalPrice\`),
      \`discount\` = VALUES(\`discount\`),
      \`recommendedFor\` = VALUES(\`recommendedFor\`),
      \`fasting\` = VALUES(\`fasting\`),
      \`reportTime\` = VALUES(\`reportTime\`),
      \`popular\` = VALUES(\`popular\`),
      \`featured\` = VALUES(\`featured\`),
      \`status\` = VALUES(\`status\`),
      \`testsCount\` = VALUES(\`testsCount\`),
      \`testsIncluded\` = VALUES(\`testsIncluded\`),
      \`icon\` = VALUES(\`icon\`),
      \`color\` = VALUES(\`color\`)
    `,
    args.title,
    args.subtitle || null,
    slug,
    args.category || "Comprehensive",
    Number(args.price) || 0,
    Number(args.originalPrice) || 0,
    args.discount || null,
    args.recommendedFor || null,
    args.fasting || "10-12 hours fasting required",
    args.reportTime || "Same day delivery (6-8 hours)",
    args.popular ? 1 : 0,
    args.featured ? 1 : 0,
    args.status || "Active",
    Number(args.testsCount) || 0,
    typeof args.testsIncluded === "string" ? args.testsIncluded : JSON.stringify(args.testsIncluded || []),
    args.icon || "HeartPulse",
    args.color || "emerald"
  );

  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `slug` = ? LIMIT 1", slug);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

export async function updateHealthPackageRaw(prisma: PrismaClient, id: number, data: any) {
  await ensureHealthPackageTable(prisma);

  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = [
    "title", "subtitle", "slug", "category", "price", "originalPrice",
    "discount", "recommendedFor", "fasting", "reportTime", "popular",
    "featured", "status", "testsCount", "testsIncluded", "icon", "color"
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`\`${field}\` = ?`);
      if (field === "popular" || field === "featured") {
        params.push(data[field] ? 1 : 0);
      } else if (field === "price" || field === "originalPrice" || field === "testsCount") {
        params.push(Number(data[field]) || 0);
      } else if (field === "testsIncluded" && typeof data[field] !== "string") {
        params.push(JSON.stringify(data[field]));
      } else {
        params.push(data[field]);
      }
    }
  }

  if (updates.length > 0) {
    params.push(id);
    const sql = `UPDATE \`HealthPackage\` SET ${updates.join(", ")} WHERE \`id\` = ?`;
    await prisma.$executeRawUnsafe(sql, ...params);
  }

  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

export async function deleteHealthPackageRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  await prisma.$executeRawUnsafe("DELETE FROM `HealthPackage` WHERE `id` = ?", id);
  return true;
}

export async function togglePackageFeaturedRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  await prisma.$executeRawUnsafe("UPDATE `HealthPackage` SET `featured` = NOT `featured` WHERE `id` = ?", id);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

export async function togglePackageStatusRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  if (!Array.isArray(rows) || !rows[0]) throw new Error("Package not found");
  const nextStatus = rows[0].status === "Active" ? "Inactive" : "Active";
  await prisma.$executeRawUnsafe("UPDATE `HealthPackage` SET `status` = ? WHERE `id` = ?", nextStatus, id);
  rows[0].status = nextStatus;
  return formatDbPackage(rows[0]);
}


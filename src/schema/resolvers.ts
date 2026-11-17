import { MyContext } from '../context';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import {
  sendAppointmentBookedEmail,
  sendAppointmentApprovedEmail,
  sendInquiryReceivedEmail,
  sendInquiryReplyEmail,
} from '../utils/mailer';

// ==========================================
// Inlined Standalone HealthPackage MySQL Helpers
// (100% self-contained so resolvers.js requires no extra files)
// ==========================================
let packageTableEnsured = false;

function formatDbPackage(row: any): any {
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

async function ensureHealthPackageTable(prisma: PrismaClient) {
  if (packageTableEnsured) return;
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
    packageTableEnsured = true;
  } catch (err: any) {
    console.warn("Could not auto-create HealthPackage table (might already exist):", err.message);
  }
}

async function getHealthPackagesRaw(
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

async function getHealthPackageByIdRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

async function getHealthPackageBySlugRaw(prisma: PrismaClient, slug: string) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `slug` = ? LIMIT 1", slug);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

async function addHealthPackageRaw(prisma: PrismaClient, args: any) {
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

async function updateHealthPackageRaw(prisma: PrismaClient, id: number, data: any) {
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

async function deleteHealthPackageRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  await prisma.$executeRawUnsafe("DELETE FROM `HealthPackage` WHERE `id` = ?", id);
  return true;
}

async function togglePackageFeaturedRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  await prisma.$executeRawUnsafe("UPDATE \`HealthPackage\` SET \`featured\` = NOT \`featured\` WHERE \`id\` = ?", id);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  return Array.isArray(rows) && rows[0] ? formatDbPackage(rows[0]) : null;
}

async function togglePackageStatusRaw(prisma: PrismaClient, id: number) {
  await ensureHealthPackageTable(prisma);
  const rows: any = await prisma.$queryRawUnsafe("SELECT * FROM `HealthPackage` WHERE `id` = ? LIMIT 1", id);
  if (!Array.isArray(rows) || !rows[0]) throw new Error("Package not found");
  const nextStatus = rows[0].status === "Active" ? "Inactive" : "Active";
  await prisma.$executeRawUnsafe("UPDATE \`HealthPackage\` SET \`status\` = ? WHERE \`id\` = ?", nextStatus, id);
  rows[0].status = nextStatus;
  return formatDbPackage(rows[0]);
}

let promoTableEnsured = false;

function formatDbOffer(row: any): any {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    priority: Number(row.priority) || 1,
    autoCloseDelay: row.autoCloseDelay !== undefined && row.autoCloseDelay !== null ? Number(row.autoCloseDelay) : 15,
    isActive: Boolean(row.isActive === 1 || row.isActive === true || row.isActive === "1"),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
  };
}

async function ensurePromoOfferTableBackend(prisma: PrismaClient) {
  if (promoTableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`PromoOffer\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`title\` VARCHAR(255) NOT NULL,
        \`subtitle\` TEXT NULL,
        \`description\` TEXT NULL,
        \`badgeText\` VARCHAR(100) NULL,
        \`couponCode\` VARCHAR(100) NULL,
        \`imageUrl\` TEXT NULL,
        \`buttonText\` VARCHAR(100) NOT NULL DEFAULT 'Book Appointment',
        \`buttonLink\` VARCHAR(500) NOT NULL DEFAULT '/book-appointment',
        \`startDate\` VARCHAR(100) NOT NULL,
        \`endDate\` VARCHAR(100) NOT NULL,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        \`priority\` INT NOT NULL DEFAULT 1,
        \`autoCloseDelay\` INT NOT NULL DEFAULT 15,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    promoTableEnsured = true;
  } catch (err: any) {
    console.warn("Could not auto-create PromoOffer table:", err.message);
  }
}

function validatePhone(phone: any): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('A valid phone number is required');
  }
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10) {
    throw new Error('Phone number must contain at least 10 digits');
  }
  if (digits.length > 15) {
    throw new Error('Phone number cannot exceed 15 digits. Credit/Debit card numbers are strictly prohibited.');
  }
  return trimmed;
}

function validateName(name: any, fieldName = 'Name'): string {
  if (!name || typeof name !== 'string') {
    throw new Error(`${fieldName} is required`);
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new Error(`${fieldName} must be at least 2 characters long`);
  }
  if (/^[^a-zA-Z]+$/.test(trimmed)) {
    throw new Error(`${fieldName} must contain valid alphabetical characters`);
  }
  return trimmed;
}

function validateEmail(email?: any): string | null {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim();
  if (!trimmed) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email address format');
  }
  return trimmed;
}

function matchDoctorToService(doctorSpecialtyRaw: string, serviceTitle: string, serviceCategory?: string): boolean {
  if (!doctorSpecialtyRaw) return false;
  const raw = doctorSpecialtyRaw.trim().toLowerCase();
  const title = (serviceTitle || "").trim().toLowerCase();
  const cat = (serviceCategory || "").trim().toLowerCase();

  const cleanCat = cat.replace(/\[showcase:\d+\]/gi, "").replace(/\[featured(:\d+)?\]/gi, "").trim();
  const targets = [title, cleanCat].filter(Boolean);
  const doctorSpecs = raw.split(",").map(s => s.trim().toLowerCase());

  for (const t of targets) {
    if (!t) continue;

    // 1. Ortho & Spine / Spine
    const isTargetSpine = t.includes("spine");
    if (isTargetSpine) {
      if (doctorSpecs.some(spec => spec.includes("spine"))) {
        return true;
      }
      continue;
    }

    // 2. Orthopedics (general orthopedics includes both Ortho and Ortho-Spine)
    const isTargetOrtho = t.includes("ortho") || t.includes("bone") || t.includes("joint");
    if (isTargetOrtho) {
      if (doctorSpecs.some(spec => spec.includes("ortho") || spec.includes("bone") || spec.includes("joint") || spec.includes("spine"))) {
        return true;
      }
      continue;
    }

    // 3. General Physician / General Medicine
    const isTargetGeneral = t.includes("general") || t.includes("medicine") || t.includes("physician") || t.includes("family");
    if (isTargetGeneral) {
      if (doctorSpecs.some(spec => spec.includes("general") || spec.includes("physician") || spec.includes("medicine") || spec.includes("family"))) {
        return true;
      }
      continue;
    }

    // 4. Gynecology / Gynaecology
    const isTargetGyn = t.includes("gyn") || t.includes("obste") || t.includes("women");
    if (isTargetGyn) {
      if (doctorSpecs.some(spec => spec.includes("gyn") || spec.includes("obste") || spec.includes("women"))) {
        return true;
      }
      continue;
    }

    // 5. Pediatrics
    const isTargetPed = t.includes("ped") || t.includes("paed") || t.includes("child") || t.includes("baby");
    if (isTargetPed) {
      if (doctorSpecs.some(spec => spec.includes("ped") || spec.includes("paed") || spec.includes("child") || spec.includes("baby"))) {
        return true;
      }
      continue;
    }

    // 6. Dermatology
    const isTargetDerm = t.includes("derm") || t.includes("skin") || t.includes("dvl") || t.includes("cosmet");
    if (isTargetDerm) {
      if (doctorSpecs.some(spec => spec.includes("derm") || spec.includes("skin") || spec.includes("dvl") || spec.includes("cosmet"))) {
        return true;
      }
      continue;
    }

    // 7. Endocrinology
    const isTargetEndo = t.includes("endo") || t.includes("diabet") || t.includes("thyroid");
    if (isTargetEndo) {
      if (doctorSpecs.some(spec => spec.includes("endo") || spec.includes("diabet") || spec.includes("thyroid"))) {
        return true;
      }
      continue;
    }

    // 8. Pulmonology
    const isTargetPulm = t.includes("pulmon") || t.includes("chest") || t.includes("lung") || t.includes("respir");
    if (isTargetPulm) {
      if (doctorSpecs.some(spec => spec.includes("pulmon") || spec.includes("chest") || spec.includes("lung") || spec.includes("respir"))) {
        return true;
      }
      continue;
    }

    // 9. Oncology
    const isTargetOnco = t.includes("onco") || t.includes("cancer") || t.includes("tumor");
    if (isTargetOnco) {
      if (doctorSpecs.some(spec => spec.includes("onco") || spec.includes("cancer") || spec.includes("tumor"))) {
        return true;
      }
      continue;
    }

    // 10. Psychiatry
    const isTargetPsych = t.includes("psych") || t.includes("mental") || t.includes("behavior");
    if (isTargetPsych) {
      if (doctorSpecs.some(spec => spec.includes("psych") || spec.includes("mental") || spec.includes("behavior"))) {
        return true;
      }
      continue;
    }

    if (doctorSpecs.some(spec => spec.includes(t) || t.includes(spec))) {
      return true;
    }
  }

  return false;
}

export const resolvers = {
  Query: {
    getDoctors: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.doctor.findMany();
    },
    getDoctorById: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      return context.prisma.doctor.findUnique({ where: { id } });
    },
    getServices: async (_parent: any, _args: any, context: MyContext) => {
      try {
        return await context.prisma.service.findMany();
      } catch (error) {
        console.error("Failed to fetch services from database, returning empty list:", error);
        return [];
      }
    },
    getServiceById: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      return context.prisma.service.findUnique({ where: { id } });
    },
    getBlogs: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.blog.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getBlogById: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      return context.prisma.blog.findUnique({ where: { id } });
    },
    getGalleryImages: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.galleryImage.findMany();
    },
    getPatients: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.patient.findMany({
        where: { isDeleted: false }
      });
    },
    getAppointments: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getInquiries: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getSettings: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.systemSettings.findFirst();
    },
    getFAQs: async (_parent: any, _args: any, context: MyContext) => {
      try {
        return await (context.prisma as any).fAQ.findMany();
      } catch (error) {
        console.error("Failed to fetch FAQs from database, returning empty list:", error);
        return [];
      }
    },
    getTestimonials: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getDoctorTestimonials: async (_parent: any, { doctorId }: { doctorId: number }, context: MyContext) => {
      return context.prisma.testimonial.findMany({
        where: { doctorId, status: "Approved" },
        orderBy: { createdAt: 'desc' }
      });
    },
    getAdmins: async (_parent: any, _args: any, context: MyContext) => {
      return context.prisma.admin.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getHealthPackages: async (_parent: any, args: { category?: string; status?: string; featured?: boolean }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          const where: any = {};
          if (args.category && args.category !== "All") {
            where.category = args.category;
          }
          if (args.status && args.status !== "All") {
            where.status = args.status;
          }
          if (args.featured !== undefined) {
            where.featured = args.featured;
          }
          const packages = await (context.prisma as any).healthPackage.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { popular: 'desc' }, { id: 'asc' }]
          });
          return packages.map(formatDbPackage);
        } catch (error) {
          console.warn("Fallback to getHealthPackagesRaw:", error);
          return getHealthPackagesRaw(context.prisma, args);
        }
      }
      return getHealthPackagesRaw(context.prisma, args);
    },
    getHealthPackageById: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          const pkg = await (context.prisma as any).healthPackage.findUnique({ where: { id } });
          return pkg ? formatDbPackage(pkg) : null;
        } catch (error) {
          return getHealthPackageByIdRaw(context.prisma, id);
        }
      }
      return getHealthPackageByIdRaw(context.prisma, id);
    },
    getHealthPackageBySlug: async (_parent: any, { slug }: { slug: string }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          const pkg = await (context.prisma as any).healthPackage.findUnique({ where: { slug } });
          return pkg ? formatDbPackage(pkg) : null;
        } catch (error) {
          return getHealthPackageBySlugRaw(context.prisma, slug);
        }
      }
      return getHealthPackageBySlugRaw(context.prisma, slug);
    },
    getPromoOffers: async (_parent: any, { status }: { status?: string }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` ORDER BY `priority` DESC, `id` DESC");
      const list = Array.isArray(rows) ? rows.map(formatDbOffer) : [];
      if (!status || status === "All") return list;
      const now = new Date();
      if (status.toLowerCase() === "active") {
        return list.filter((o: any) => {
          if (!o.isActive) return false;
          const start = o.startDate ? new Date(o.startDate).getTime() : 0;
          const end = o.endDate ? new Date(o.endDate).getTime() : Infinity;
          return now.getTime() >= start && now.getTime() <= end;
        });
      }
      if (status.toLowerCase() === "expired") {
        return list.filter((o: any) => {
          const end = o.endDate ? new Date(o.endDate).getTime() : Infinity;
          return now.getTime() > end;
        });
      }
      if (status.toLowerCase() === "scheduled") {
        return list.filter((o: any) => {
          const start = o.startDate ? new Date(o.startDate).getTime() : 0;
          return now.getTime() < start;
        });
      }
      if (status.toLowerCase() === "inactive") {
        return list.filter((o: any) => !o.isActive);
      }
      return list;
    },
    getActivePromoOffer: async (_parent: any, _args: any, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` WHERE `isActive` = 1 ORDER BY `priority` DESC, `id` DESC");
      const list = Array.isArray(rows) ? rows.map(formatDbOffer) : [];
      const now = new Date();
      const active = list.find((o: any) => {
        const start = o.startDate ? new Date(o.startDate).getTime() : 0;
        const end = o.endDate ? new Date(o.endDate).getTime() : Infinity;
        return now.getTime() >= start && now.getTime() <= end;
      });
      return active || null;
    },
    getPromoOfferById: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` WHERE `id` = ? LIMIT 1", id);
      return Array.isArray(rows) && rows[0] ? formatDbOffer(rows[0]) : null;
    },
  },
  Mutation: {
    loginAdmin: async (_parent: any, { email, password }: any, context: MyContext) => {
      const admin = await context.prisma.admin.findUnique({ where: { email } });
      if (!admin) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) throw new Error('Invalid credentials');

      const token = jwt.sign(
        { adminId: admin.id },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
      );

      return {
        token,
        admin: { 
          id: admin.id, 
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions
        },
      };
    },
    addAdmin: async (_parent: any, args: any, context: MyContext) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      return context.prisma.admin.create({ 
        data: {
          ...args,
          password: hashedPassword
        } 
      });
    },
    updateAdmin: async (_parent: any, { id, password, ...data }: any, context: MyContext) => {
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }
      return context.prisma.admin.update({
        where: { id },
        data,
      });
    },
    deleteAdmin: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.admin.delete({ where: { id } });
      return true;
    },
    addDoctor: async (_parent: any, args: any, context: MyContext) => {
      return context.prisma.doctor.create({ data: args });
    },
    updateDoctor: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      return context.prisma.doctor.update({
        where: { id },
        data,
      });
    },
    deleteDoctor: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.doctor.delete({ where: { id } });
      return true;
    },
    addService: async (_parent: any, args: any, context: MyContext) => {
      if (args.treatments) {
        args.treatments = JSON.stringify(args.treatments);
      }
      if (args.faqs) {
        args.faqs = JSON.stringify(args.faqs);
      }
      return context.prisma.service.create({ data: args });
    },
    updateService: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      if (data.treatments) {
        data.treatments = JSON.stringify(data.treatments);
      }
      if (data.faqs) {
        data.faqs = JSON.stringify(data.faqs);
      }
      return context.prisma.service.update({
        where: { id },
        data,
      });
    },
    deleteService: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.service.delete({ where: { id } });
      return true;
    },
    addHealthPackage: async (_parent: any, args: any, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          if (!args.slug) {
            args.slug = args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          }
          const created = await (context.prisma as any).healthPackage.create({ data: args });
          return formatDbPackage(created);
        } catch (error) {
          console.warn("Fallback to addHealthPackageRaw:", error);
          return addHealthPackageRaw(context.prisma, args);
        }
      }
      return addHealthPackageRaw(context.prisma, args);
    },
    updateHealthPackage: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          if (data.title && !data.slug) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          }
          const updated = await (context.prisma as any).healthPackage.update({
            where: { id },
            data,
          });
          return formatDbPackage(updated);
        } catch (error) {
          console.warn("Fallback to updateHealthPackageRaw:", error);
          return updateHealthPackageRaw(context.prisma, id, data);
        }
      }
      return updateHealthPackageRaw(context.prisma, id, data);
    },
    deleteHealthPackage: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          await (context.prisma as any).healthPackage.delete({ where: { id } });
          return true;
        } catch (error) {
          return deleteHealthPackageRaw(context.prisma, id);
        }
      }
      return deleteHealthPackageRaw(context.prisma, id);
    },
    togglePackageFeatured: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          const existing = await (context.prisma as any).healthPackage.findUnique({ where: { id } });
          if (existing) {
            const updated = await (context.prisma as any).healthPackage.update({
              where: { id },
              data: { featured: !existing.featured }
            });
            return formatDbPackage(updated);
          }
        } catch (error) {
          return togglePackageFeaturedRaw(context.prisma, id);
        }
      }
      return togglePackageFeaturedRaw(context.prisma, id);
    },
    togglePackageStatus: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      if ((context.prisma as any).healthPackage) {
        try {
          const existing = await (context.prisma as any).healthPackage.findUnique({ where: { id } });
          if (existing) {
            const nextStatus = existing.status === "Active" ? "Inactive" : "Active";
            const updated = await (context.prisma as any).healthPackage.update({
              where: { id },
              data: { status: nextStatus }
            });
            return formatDbPackage(updated);
          }
        } catch (error) {
          return togglePackageStatusRaw(context.prisma, id);
        }
      }
      return togglePackageStatusRaw(context.prisma, id);
    },
    createPromoOffer: async (_parent: any, { input }: { input: any }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      await context.prisma.$executeRawUnsafe(
        "INSERT INTO `PromoOffer` (`title`, `subtitle`, `description`, `badgeText`, `couponCode`, `imageUrl`, `buttonText`, `buttonLink`, `startDate`, `endDate`, `isActive`, `priority`, `autoCloseDelay`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        input.title || "Special Promotion",
        input.subtitle || null,
        input.description || null,
        input.badgeText || "SPECIAL OFFER",
        input.couponCode || null,
        input.imageUrl || "/images/49992c23-c335-45e0-a2a3-6f973dfeab14.png",
        input.buttonText || "Book Appointment",
        input.buttonLink || "/book-appointment",
        input.startDate,
        input.endDate,
        input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1,
        Number(input.priority || 1),
        Number(input.autoCloseDelay !== undefined ? input.autoCloseDelay : 15)
      );
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` ORDER BY `id` DESC LIMIT 1");
      return Array.isArray(rows) && rows[0] ? formatDbOffer(rows[0]) : null;
    },
    updatePromoOffer: async (_parent: any, { id, input }: { id: number; input: any }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      const updates: string[] = [];
      const params: any[] = [];
      const fields = ["title", "subtitle", "description", "badgeText", "couponCode", "imageUrl", "buttonText", "buttonLink", "startDate", "endDate", "isActive", "priority", "autoCloseDelay"];
      for (const f of fields) {
        if (input[f] !== undefined) {
          updates.push(`\`${f}\` = ?`);
          if (f === "isActive") {
            params.push(input[f] ? 1 : 0);
          } else if (f === "priority" || f === "autoCloseDelay") {
            params.push(Number(input[f]));
          } else {
            params.push(input[f]);
          }
        }
      }
      if (updates.length > 0) {
        params.push(id);
        await context.prisma.$executeRawUnsafe(`UPDATE \`PromoOffer\` SET ${updates.join(", ")} WHERE \`id\` = ?`, ...params);
      }
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` WHERE `id` = ? LIMIT 1", id);
      return Array.isArray(rows) && rows[0] ? formatDbOffer(rows[0]) : null;
    },
    deletePromoOffer: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      await context.prisma.$executeRawUnsafe("DELETE FROM `PromoOffer` WHERE `id` = ?", id);
      return true;
    },
    togglePromoOfferStatus: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await ensurePromoOfferTableBackend(context.prisma);
      await context.prisma.$executeRawUnsafe("UPDATE \`PromoOffer\` SET \`isActive\` = NOT \`isActive\` WHERE \`id\` = ?", id);
      const rows: any = await context.prisma.$queryRawUnsafe("SELECT * FROM `PromoOffer` WHERE `id` = ? LIMIT 1", id);
      return Array.isArray(rows) && rows[0] ? formatDbOffer(rows[0]) : null;
    },
    addBlog: async (_parent: any, args: any, context: MyContext) => {
      return context.prisma.blog.create({ data: args });
    },
    updateBlog: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      return context.prisma.blog.update({
        where: { id },
        data,
      });
    },
    deleteBlog: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.blog.delete({ where: { id } });
      return true;
    },
    incrementBlogViews: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      return context.prisma.blog.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        }
      });
    },
    addGalleryImage: async (_parent: any, args: any, context: MyContext) => {
      try {
        return await context.prisma.galleryImage.create({ data: args });
      } catch (err: any) {
        console.error("Error in addGalleryImage:", err);
        throw new Error(err.message || "Failed to add gallery item");
      }
    },
    updateGalleryImage: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      try {
        return await context.prisma.galleryImage.update({
          where: { id },
          data,
        });
      } catch (err: any) {
        console.error("Error in updateGalleryImage:", err);
        throw new Error(err.message || "Failed to update gallery item");
      }
    },
    deleteGalleryImage: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.galleryImage.delete({ where: { id } });
      return true;
    },
    addPatient: async (_parent: any, args: any, context: MyContext) => {
      const name = validateName(args.name, 'Patient name');
      const phone = validatePhone(args.phone);
      const email = validateEmail(args.email);
      return context.prisma.patient.create({
        data: { ...args, name, phone, email }
      });
    },
    updatePatient: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      if (data.name) data.name = validateName(data.name, 'Patient name');
      if (data.phone) data.phone = validatePhone(data.phone);
      if (data.email !== undefined) data.email = validateEmail(data.email);
      return context.prisma.patient.update({
        where: { id },
        data,
      });
    },
    deletePatient: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.patient.update({
        where: { id },
        data: { isDeleted: true },
      });
      return true;
    },
    addAppointment: async (_parent: any, args: any, context: MyContext) => {
      const patientName = validateName(args.patientName, 'Patient name');
      const phone = validatePhone(args.phone);
      const email = validateEmail(args.email);

      const doctorId = Number(args.doctorId);
      if (!doctorId || isNaN(doctorId)) {
        throw new Error('A valid doctor ID is required');
      }

      const doctor = await context.prisma.doctor.findUnique({
        where: { id: doctorId }
      });
      if (!doctor) {
        throw new Error(`Doctor with ID ${doctorId} does not exist`);
      }

      if (!args.date || typeof args.date !== 'string' || !args.date.trim()) {
        throw new Error('Appointment date is required');
      }
      const trimmedDate = args.date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        throw new Error('Appointment date must be in YYYY-MM-DD format');
      }

      if (!args.timeSlot || typeof args.timeSlot !== 'string' || !args.timeSlot.trim()) {
        throw new Error('Appointment time slot is required');
      }

      const sanitizedArgs = {
        ...args,
        patientName,
        phone,
        email,
        doctorId,
        date: trimmedDate,
        timeSlot: args.timeSlot.trim(),
        department: args.department?.trim() || doctor.specialization || 'General',
      };

      const appointment = await context.prisma.appointment.create({ data: sanitizedArgs });

      // Send confirmation emails asynchronously
      sendAppointmentBookedEmail({
        appointment,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization || sanitizedArgs.department,
      }).catch((err) => console.error("Error sending appointment booked email:", err));

      return appointment;
    },
    updateAppointmentStatus: async (_parent: any, { id, status, paymentStatus, paymentType }: any, context: MyContext) => {
      const data: any = {};
      if (status) data.status = status;
      if (paymentStatus) data.paymentStatus = paymentStatus;
      if (paymentType) data.paymentType = paymentType;

      const previous = await context.prisma.appointment.findUnique({
        where: { id },
        include: { doctor: true },
      });

      const updated = await context.prisma.appointment.update({ where: { id }, data });

      // If status transitioned to Approved or Confirmed, notify patient
      if (
        status &&
        (status.toLowerCase() === 'approved' || status.toLowerCase() === 'confirmed') &&
        previous?.status?.toLowerCase() !== status.toLowerCase()
      ) {
        sendAppointmentApprovedEmail({
          appointment: updated,
          doctorName: previous?.doctor?.name || "Consultant Specialist",
          doctorSpecialization: previous?.doctor?.specialization || updated.department,
        }).catch((err) => console.error("Error sending appointment approved email:", err));
      }

      return updated;
    },
    rescheduleAppointment: async (_parent: any, { id, date, timeSlot }: any, context: MyContext) => {
      if (!date || typeof date !== 'string' || !date.trim()) {
        throw new Error('Appointment date is required');
      }
      const trimmedDate = date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        throw new Error('Appointment date must be in YYYY-MM-DD format');
      }
      if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.trim()) {
        throw new Error('Appointment time slot is required');
      }
      return context.prisma.appointment.update({
        where: { id },
        data: { date: trimmedDate, timeSlot: timeSlot.trim(), status: "Confirmed" }
      });
    },
    uploadAppointmentReport: async (_parent: any, { id, reportNote, reportUrl }: any, context: MyContext) => {
      const data: any = {};
      if (reportNote !== undefined) data.reportNote = reportNote;
      if (reportUrl !== undefined) data.reportUrl = reportUrl;
      return context.prisma.appointment.update({ where: { id }, data });
    },
    updateSettings: async (_parent: any, args: any, context: MyContext) => {
      if (args.features) {
        args.features = JSON.stringify(args.features);
      }
      if (args.aboutValues) {
        args.aboutValues = JSON.stringify(args.aboutValues);
      }
      if (args.footerQuickLinks) {
        args.footerQuickLinks = JSON.stringify(args.footerQuickLinks);
      }

      const existing = await context.prisma.systemSettings.findFirst();
      if (existing) {
        return context.prisma.systemSettings.update({
          where: { id: existing.id },
          data: args,
        });
      } else {
        return context.prisma.systemSettings.create({
          data: args,
        });
      }
    },
    addInquiry: async (_parent: any, args: any, context: MyContext) => {
      const { name = "", email = "", phone = "", message = "" } = args;

      // Anti-Spam Bot Protection
      const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^0/, "").replace(/^\+?91/, "");
      const isInvalidPhone = /^\d{10}$/.test(cleanPhone) && !/^[6-9]/.test(cleanPhone);
      const localPart = (email.split("@")[0] || "");
      const excessiveDots = (localPart.match(/\./g) || []).length >= 4;
      const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(name);
      const strippedMsg = message.replace(/^\[Subject:[^\]]+\]\s*/i, "").trim();
      const isBotHash =
        !strippedMsg.includes(" ") &&
        strippedMsg.length >= 10 &&
        /[A-Z]/.test(strippedMsg) &&
        /[a-z]/.test(strippedMsg);

      if (isInvalidPhone || excessiveDots || consonantCluster || isBotHash) {
        console.warn(`[AntiSpam Bot Filter] Blocked bot contact inquiry: Name="${name}", Email="${email}", Phone="${phone}"`);
        // Return simulated success to deceive automated bots, but DO NOT save to DB and DO NOT send email
        return {
          id: 0,
          name,
          email,
          phone,
          message,
          status: "Spam",
          createdAt: Date.now().toString(),
        };
      }

      const inquiry = await context.prisma.contactInquiry.create({ data: args });

      // Send inquiry emails asynchronously
      sendInquiryReceivedEmail({
        inquiry,
      }).catch((err) => console.error("Error sending inquiry received email:", err));

      return inquiry;
    },
    updateInquiryStatus: async (_parent: any, { id, status }: { id: number, status: string }, context: MyContext) => {
      return context.prisma.contactInquiry.update({
        where: { id },
        data: { status }
      });
    },
    replyToInquiry: async (
      _parent: any,
      { id, replyMessage }: { id: number; replyMessage: string },
      context: MyContext
    ) => {
      const inq = await context.prisma.contactInquiry.findUnique({ where: { id } });
      if (!inq) {
        throw new Error(`Inquiry with ID ${id} not found`);
      }
      if (!replyMessage || !replyMessage.trim()) {
        throw new Error('Reply message cannot be empty');
      }

      const updated = await context.prisma.contactInquiry.update({
        where: { id },
        data: { status: 'Replied' },
      });

      await sendInquiryReplyEmail({
        inquiry: inq,
        replyMessage: replyMessage.trim(),
      });

      return updated;
    },
    deleteInquiry: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.contactInquiry.delete({ where: { id } });
      return true;
    },
    addFAQ: async (_parent: any, args: any, context: MyContext) => {
      try {
        return await (context.prisma as any).fAQ.create({ data: args });
      } catch (error) {
        console.error("Failed to add FAQ to database:", error);
        throw new Error("Database connection error");
      }
    },
    updateFAQ: async (_parent: any, { id, ...data }: any, context: MyContext) => {
      try {
        return await (context.prisma as any).fAQ.update({
          where: { id },
          data,
        });
      } catch (error) {
        console.error("Failed to update FAQ in database:", error);
        throw new Error("Database connection error");
      }
    },
    deleteFAQ: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      try {
        await (context.prisma as any).fAQ.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error("Failed to delete FAQ from database:", error);
        throw new Error("Database connection error");
      }
    },
    addTestimonial: async (_parent: any, args: any, context: MyContext) => {
      const name = validateName(args.name, 'Name');
      if (!args.text || typeof args.text !== 'string' || args.text.trim().length < 5) {
        throw new Error('Testimonial text must be at least 5 characters long');
      }
      return context.prisma.testimonial.create({
        data: {
          ...args,
          name,
          text: args.text.trim(),
          status: "Pending" // Require admin approval before displaying publicly
        }
      });
    },
    updateTestimonialStatus: async (_parent: any, { id, status }: { id: number, status: string }, context: MyContext) => {
      return context.prisma.testimonial.update({
        where: { id },
        data: { status }
      });
    },
    deleteTestimonial: async (_parent: any, { id }: { id: number }, context: MyContext) => {
      await context.prisma.testimonial.delete({ where: { id } });
      return true;
    },
    createRazorpayOrder: async (_parent: any, { amount }: { amount: number }, context: MyContext) => {
      const settings = await context.prisma.systemSettings.findFirst();
      if (!settings?.paymentRazorpayEnabled || !settings?.paymentRazorpayKeyId || !settings?.paymentRazorpayKeySecret) {
        throw new Error("Razorpay is not configured or enabled");
      }
      const razorpay = new Razorpay({
        key_id: settings.paymentRazorpayKeyId,
        key_secret: settings.paymentRazorpayKeySecret,
      });

      const options = {
        amount: amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      };
    },
  },
  SystemSettings: {
    features: (parent: any) => {
      if (!parent.features) return [];
      try {
        return JSON.parse(parent.features);
      } catch (e) {
        return [];
      }
    },
    aboutValues: (parent: any) => {
      if (!parent.aboutValues) return [];
      try {
        return JSON.parse(parent.aboutValues);
      } catch (e) {
        return [];
      }
    },
    footerQuickLinks: (parent: any) => {
      if (!parent.footerQuickLinks) return [];
      try {
        return JSON.parse(parent.footerQuickLinks);
      } catch (e) {
        return [];
      }
    }
  },
  Appointment: {
    doctor: async (parent: any, _args: any, context: MyContext) => {
      return context.prisma.doctor.findUnique({ where: { id: parent.doctorId } });
    }
  },

  Service: {
    doctorsCount: async (parent: any, _args: any, context: MyContext) => {
      try {
        const allDocs = await context.prisma.doctor.findMany({
          select: { specialization: true }
        });
        return allDocs.filter((doc: any) =>
          matchDoctorToService(doc.specialization, parent.title, parent.category)
        ).length;
      } catch (e) {
        return 0;
      }
    },
    features: (parent: any) => {
      if (!parent.features) return [];
      try {
        return JSON.parse(parent.features);
      } catch (e) {
        return [];
      }
    },
    treatments: (parent: any) => {
      if (!parent.treatments) return [];
      try {
        return JSON.parse(parent.treatments);
      } catch (e) {
        return [];
      }
    },
    conditions: (parent: any) => {
      if (!parent.conditions) return [];
      try {
        return JSON.parse(parent.conditions);
      } catch (e) {
        return [];
      }
    },
    faqs: (parent: any) => {
      if (!parent.faqs) return [];
      try {
        return JSON.parse(parent.faqs);
      } catch (e) {
        return [];
      }
    }
  },
  Testimonial: {
    doctor: async (parent: any, _args: any, context: MyContext) => {
      if (!parent.doctorId) return null;
      return context.prisma.doctor.findUnique({ where: { id: parent.doctorId } });
    }
  },
  Doctor: {
    testimonials: async (parent: any, _args: any, context: MyContext) => {
      return context.prisma.testimonial.findMany({
        where: { doctorId: parent.id, status: "Approved" }
      });
    }
  },
  HealthPackage: {
    createdAt: (parent: any) => parent.createdAt ? new Date(parent.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: (parent: any) => parent.updatedAt ? new Date(parent.updatedAt).toISOString() : new Date().toISOString(),
  }
};

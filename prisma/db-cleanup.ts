import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runFixes() {
  console.log("=== STARTING DATABASE CLEANUP & NORMALIZATION ===");

  // 1. Remove invalid / sensitive appointment records
  console.log("\n1. Cleaning invalid appointment records...");
  const invalidAppointmentIds = [17, 18, 19];
  const deletedAppointments = await prisma.appointment.deleteMany({
    where: {
      id: { in: invalidAppointmentIds }
    }
  });
  console.log(`Deleted ${deletedAppointments.count} invalid/sensitive appointment records (IDs: ${invalidAppointmentIds.join(", ")}).`);

  // Also clean any appointments with blank patient names or phone numbers
  const blankAppointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { patientName: { equals: "" } },
        { phone: { equals: "" } }
      ]
    }
  });
  for (const app of blankAppointments) {
    if (!app.patientName.trim() || !app.phone.trim()) {
      await prisma.appointment.delete({ where: { id: app.id } });
      console.log(`Deleted whitespace-only appointment #${app.id}`);
    }
  }

  // 2. Normalize URLs in SystemSettings
  console.log("\n2. Normalizing SystemSettings URLs...");
  const settings = await prisma.systemSettings.findFirst();
  if (settings) {
    const cleanUrl = (u: string | null) => {
      if (!u) return u;
      return u.replace(/^https?:\/\/[^\/]+\/uploads\//, "/uploads/");
    };

    const updatedSettings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        logoUrl: cleanUrl(settings.logoUrl),
        heroImageUrl: cleanUrl(settings.heroImageUrl),
        footerLogoUrl: cleanUrl(settings.footerLogoUrl),
        homeAboutImageUrl: cleanUrl(settings.homeAboutImageUrl),
        aboutHeroImageUrl: cleanUrl(settings.aboutHeroImageUrl),
        address: "Shop 2, H.No: 11-13-57, Rd Number 1, Ramakrishnapuram, Kothapet, Hyderabad, Telangana – 500035",
        phone: "+91 92818 62664",
        email: "contact@healthfirstclinics.com",
      }
    });
    console.log("SystemSettings normalized:", {
      logoUrl: updatedSettings.logoUrl,
      heroImageUrl: updatedSettings.heroImageUrl,
      footerLogoUrl: updatedSettings.footerLogoUrl,
      homeAboutImageUrl: updatedSettings.homeAboutImageUrl,
      aboutHeroImageUrl: updatedSettings.aboutHeroImageUrl,
      address: updatedSettings.address,
      phone: updatedSettings.phone,
    });
  }

  // 3. Normalize Doctor image URLs
  console.log("\n3. Normalizing Doctor image URLs...");
  const doctors = await prisma.doctor.findMany();
  let docCount = 0;
  for (const doc of doctors) {
    if (doc.image && /^https?:\/\/[^\/]+\/uploads\//.test(doc.image)) {
      const normalized = doc.image.replace(/^https?:\/\/[^\/]+\/uploads\//, "/uploads/");
      await prisma.doctor.update({
        where: { id: doc.id },
        data: { image: normalized }
      });
      docCount++;
      console.log(`Doctor #${doc.id} (${doc.name}): ${doc.image} -> ${normalized}`);
    }
  }
  console.log(`Updated ${docCount} doctor images to relative /uploads/ paths.`);

  // 4. Normalize Gallery image URLs
  console.log("\n4. Normalizing Gallery image URLs...");
  const gallery = await prisma.galleryImage.findMany();
  let galleryCount = 0;
  for (const g of gallery) {
    if (g.url && /^https?:\/\/[^\/]+\/uploads\//.test(g.url)) {
      const normalized = g.url.replace(/^https?:\/\/[^\/]+\/uploads\//, "/uploads/");
      await prisma.galleryImage.update({
        where: { id: g.id },
        data: { url: normalized }
      });
      galleryCount++;
      console.log(`Gallery #${g.id}: ${g.url} -> ${normalized}`);
    }
  }
  console.log(`Updated ${galleryCount} gallery images to relative /uploads/ paths.`);

  // 5. Normalize Blog image URLs & clean content
  console.log("\n5. Normalizing Blog image URLs and cleaning content...");
  const blogs = await prisma.blog.findMany();
  let blogCount = 0;
  for (const b of blogs) {
    const dataToUpdate: any = {};
    if (b.imageUrl && /^https?:\/\/[^\/]+\/uploads\//.test(b.imageUrl)) {
      dataToUpdate.imageUrl = b.imageUrl.replace(/^https?:\/\/[^\/]+\/uploads\//, "/uploads/");
    }

    // Clean content if it has <style> tags or YOUR_IMAGE_URL
    let content = b.content;
    let modifiedContent = false;

    if (content.includes("<style>")) {
      content = content.replace(/<style>[\s\S]*?<\/style>/gi, "").trim();
      modifiedContent = true;
      console.log(`Blog #${b.id}: Removed <style> block from content.`);
    }

    if (content.includes("YOUR_IMAGE_URL")) {
      // Replace placeholder with blog's actual image or remove the image element
      const cleanImg = dataToUpdate.imageUrl || b.imageUrl?.replace(/^https?:\/\/[^\/]+\/uploads\//, "/uploads/");
      if (cleanImg) {
        content = content.replace(/src="YOUR_IMAGE_URL"/g, `src="${cleanImg}"`);
      } else {
        content = content.replace(/<div class="article-image-wrapper">[\s\S]*?<\/div>/g, "");
      }
      modifiedContent = true;
      console.log(`Blog #${b.id}: Replaced/removed YOUR_IMAGE_URL placeholder.`);
    }

    if (modifiedContent) {
      dataToUpdate.content = content;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.blog.update({
        where: { id: b.id },
        data: dataToUpdate
      });
      blogCount++;
      console.log(`Blog #${b.id} updated.`);
    }
  }
  console.log(`Updated ${blogCount} blogs.`);

  // 6. Fix duplicate pediatric nutrition blog
  console.log("\n6. Handling duplicate pediatric nutrition blog...");
  const b2 = await prisma.blog.findUnique({ where: { id: 2 } });
  if (b2 && b2.status === "Published") {
    await prisma.blog.update({
      where: { id: 2 },
      data: { status: "Draft" } // Demote older duplicate to Draft so Blog 11 is canonical
    });
    console.log("Demoted duplicate Blog #2 to Draft (canonical is Blog #11).");
  }

  console.log("\n=== ALL DATABASE CLEANUP TASKS COMPLETED SUCCESSFULLY ===");
  await prisma.$disconnect();
}

runFixes().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});

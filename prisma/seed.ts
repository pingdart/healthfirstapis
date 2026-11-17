import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const doctorsData = [
  {
    name: "Dr. Deepika J Sanbal",
    qualification: "MBBS, MD (DVL)",
    specialization: "Dermatology",
    experience: "12+ Years",
    image: "/images/female_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 500,
    gender: "Female",
    bio: "Dr. Deepika J Sanbal is a highly qualified Consultant Dermatologist with expertise in Clinical Dermatology, Cosmetic Dermatology, Dermatosurgery, Hair & Scalp Disorders (Trichology), Paediatric Dermatology, Laser Therapy, and Pigmentation Treatment.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.deepika@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Pavani Chinnapaka",
    qualification: "MBBS, DGO, MD General Medicine (OSM)",
    specialization: "General Physician",
    experience: "15+ Years",
    image: "/images/female_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 500,
    gender: "Female",
    bio: "Dr. Pavani Chinnapaka is an Assistant Civil Surgeon and a multi-talented healthcare professional practicing as a General Physician, Diabetologist, Gynecologist, and Infertility Specialist.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.pavani@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. C. Muralidhar",
    qualification: "MBBS, MD, FCGP, FCD",
    specialization: "General Physician",
    experience: "20+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 500,
    gender: "Male",
    bio: "Dr. C. Muralidhar is a veteran General Physician practitioner and Associate Professor specializing in Family Medicine and Diabetic Care.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.muralidhar@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Srirangam Vamshi",
    qualification: "MBBS, MD (General Medicine), DM Endocrinology, MRCP SCE",
    specialization: "Endocrinology",
    experience: "10+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 600,
    gender: "Male",
    bio: "Dr. Srirangam Vamshi is a distinguished Endocrinologist and Consultant specializing in treating Diabetes, Thyroid Disorders, and Pituitary Disorders.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.vamshi@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Uday Bhaskar",
    qualification: "MBBS, MS (Orthopedics)",
    specialization: "Orthopedics",
    experience: "20+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 500,
    gender: "Male",
    bio: "Dr. Uday Bhaskar is a senior Orthopedic surgeon with 20+ years of clinical experience specializing in bone, joint, fracture care, and sports injuries.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.uday@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. V. Nagaraju",
    qualification: "DNB (Ortho), FNB (Spine Surgery), MNAMS",
    specialization: "Spine & Ortho",
    experience: "14+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 600,
    gender: "Male",
    bio: "Dr. V. Nagaraju is a Consultant Ortho-Spine Surgeon with specialized qualifications in DNB (Ortho), FNB (Spine Surgery), and MNAMS, dedicated to treating complex spinal disorders and back pain.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.nagaraju@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Sravan Kumar Chinthala",
    qualification: "MD (General Medicine), DM (Medical Oncology)",
    specialization: "Oncology",
    experience: "12+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 800,
    gender: "Male",
    bio: "Dr. Sravan Kumar Chinthala is a Senior Consultant Medical Oncologist & Hemato Oncologist specializing in cancer diagnosis and blood disorders.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.sravankumar@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Telkapalli Pradeep Sharma",
    qualification: "BSc, MBBS (OMC), MD Psychiatry, DEM (SEMI), DA (Gandhi)",
    specialization: "Psychiatry",
    experience: "16+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 8:30 PM)",
    consultationFee: 2000,
    gender: "Male",
    bio: "Dr. Telkapalli Pradeep Sharma is a renowned Consultant Psychiatrist specializing in clinical psychiatry, mental health counseling, and evaluations.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.pradeep@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Sarath Chandra",
    qualification: "MBBS, MD (Pulmonology)",
    specialization: "Pulmonology",
    experience: "12+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (5:00 PM – 7:00 PM)",
    consultationFee: 600,
    gender: "Male",
    bio: "Dr. Sarath Chandra is an expert Pulmonologist specializing in chest medicine, asthma, COPD, allergy management, sleep apnea, and respiratory care.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.sarath@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Meghana Pendam",
    qualification: "MBBS, DNB",
    specialization: "Dermatology",
    experience: "8+ Years",
    image: "/images/female_default.png",
    availability: "Sat (5:00 PM – 7:00 PM), Sun (10:00 AM – 12:00 PM)",
    timings: "Sat (5:00 PM – 7:00 PM), Sun (10:00 AM – 12:00 PM)",
    consultationFee: 500,
    gender: "Female",
    bio: "Dr. Meghana Pendam is a dedicated Consultant Dermatologist providing comprehensive outpatient consultations, skin treatments, and clinical dermatology care.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.meghana@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Duty Medical Officer (DMO)",
    qualification: "MBBS",
    specialization: "General Physician",
    experience: "10+ Years",
    image: "/images/male_default.png",
    availability: "Mon - Sat (8:00 AM – 9:00 PM)",
    consultationFee: 300,
    gender: "Male",
    bio: "Our Duty Medical Officer (DMO) is available throughout clinic working hours for walk-in consultations, primary triage, and urgent care.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dmo@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  },
  {
    name: "Dr. Mounika",
    qualification: "MBBS, DNB",
    specialization: "General Physician",
    experience: "6+ Years",
    image: "/images/female_default.png",
    availability: "Sun (10:00 AM – 12:00 PM)",
    consultationFee: 500,
    gender: "Female",
    bio: "Dr. Mounika is a dedicated Consultant Physician providing Sunday outpatient care, health evaluations, and primary consultations.",
    location: "HealthFirst Clinics, Alkapuri, Kothapet, Hyderabad",
    phone: "+91 92818 62664",
    email: "dr.mounika@healthfirstclinics.com",
    languages: "English, Telugu, Hindi"
  }
];

const servicesData = [
  {
    title: "General Physician",
    description: "Primary care serving as your first line of defense for overall health and wellness.",
    category: "General Practice",
    status: "Active",
    features: JSON.stringify(["Annual Physicals", "Chronic Disease Management", "Preventive Care", "Urgent Care Services", "Health Screenings", "Lifestyle Counseling"]),
    treatments: JSON.stringify(["Outpatient Consultation", "Diabetic Screening", "Hypertension Management", "Fever & Infection Care"])
  },
  {
    title: "Dermatology",
    description: "Medical and cosmetic treatments for healthy, glowing skin, hair, and nails.",
    category: "Specialty Care",
    status: "Active",
    features: JSON.stringify(["Skin Cancer Screening", "Acne & Rosacea Treatment", "Cosmetic Procedures", "Eczema & Psoriasis Care", "Laser Therapy", "Hair Loss Treatment"]),
    treatments: JSON.stringify(["Chemical Peels", "Laser Resurfacing", "Dermatopathology", "Alopecia Treatment"])
  },
  {
    title: "Orthopedics",
    description: "Advanced care for bones, joints, ligaments, tendons, and muscles.",
    category: "Surgical Care",
    status: "Active",
    features: JSON.stringify(["Joint Replacement Surgery", "Sports Medicine", "Fracture Care", "Physical Therapy", "Joint Pain Relief", "Arthritis Management"]),
    treatments: JSON.stringify(["Arthroscopy", "Fracture Fixation", "Joint Injections", "Rehabilitation"])
  },
  {
    title: "Spine & Ortho",
    description: "Specialized Ortho-Spine consultations, back pain management, slip disc treatments, and spinal correction.",
    category: "Super Specialty",
    status: "Active",
    features: JSON.stringify(["Spine Surgery Consultations", "Slip Disc Treatment", "Scoliosis & Kyphosis Care", "Chronic Back Pain Relief", "Spinal Decompression", "Minimally Invasive Procedures"]),
    treatments: JSON.stringify(["Spinal Microdiscectomy", "Epidural Injections", "Posture Alignment", "Laminectomy"])
  },
  {
    title: "Pulmonology",
    description: "Comprehensive chest and respiratory care for asthma, COPD, allergies, and lung health.",
    category: "Super Specialty",
    status: "Active",
    features: JSON.stringify(["Asthma & Allergy Care", "COPD Management", "Sleep Apnea Evaluation", "Pulmonary Function Tests", "Bronchitis Treatment", "Respiratory Care"]),
    treatments: JSON.stringify(["Spirometry Test", "Inhalation Therapy", "Allergy Immunotherapy", "Sleep Study Triage"])
  },
  {
    title: "Endocrinology",
    description: "Comprehensive diagnosis and treatment for hormone-related conditions.",
    category: "Specialty Care",
    status: "Active",
    features: JSON.stringify(["Diabetes Management", "Thyroid Disorder Treatment", "Hormone Replacement Therapy", "Pituitary Disorder Care", "Adrenal Gland Management", "Metabolic Health Programs"]),
    treatments: JSON.stringify(["Thyroid Biopsy", "Continuous Glucose Monitoring", "Hormone Profile Evaluation", "Insulin Titration"])
  },
  {
    title: "Oncology",
    description: "Advanced, patient-centered care for cancer diagnosis and comprehensive treatment plans.",
    category: "Super Specialty",
    status: "Active",
    features: JSON.stringify(["Chemotherapy", "Targeted Cancer Therapy", "Immunotherapy", "Cancer Screenings & Staging", "Palliative & Supportive Care", "Hematology Consultations"]),
    treatments: JSON.stringify(["Chemotherapy Infusion", "Tumor Markers", "Biopsy Evaluation", "Cancer Counseling"])
  },
  {
    title: "Psychiatry",
    description: "Compassionate and professional care for mental health, clinical evaluations, and therapy.",
    category: "Mental Health",
    status: "Active",
    features: JSON.stringify(["Mental Health Assessment", "Cognitive Behavioral Support", "Stress & Anxiety Management", "Depression Therapy", "Mood Disorder Treatment", "Psychopharmacology"]),
    treatments: JSON.stringify(["Psychological Evaluation", "Counseling Sessions", "Anxiety Therapy", "Sleep Disorder Care"])
  }
];

const healthPackagesData = [
  {
    title: "Master Health Checkup",
    subtitle: "Our most comprehensive full-body preventive health assessment for adults.",
    slug: "master-health-checkup",
    category: "Full Body",
    price: 1999,
    originalPrice: 4500,
    discount: "55% OFF",
    recommendedFor: "Men & women (25+ years) looking for an annual total-body preventative evaluation.",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day (6-8 Hours)",
    popular: true,
    featured: true,
    status: "Active",
    testsCount: 65,
    testsIncluded: JSON.stringify([
      "Complete Hemogram (CBC - 24 parameters)",
      "Complete Lipid Profile (Heart Risk - 8 tests)",
      "Liver Function Test (LFT - 11 parameters)",
      "Kidney Function Test (KFT / Creatinine - 6 parameters)",
      "Fasting Blood Sugar & HbA1c (3-Month Sugar)",
      "Thyroid Profile (TSH)",
      "ECG (Resting Heart Activity)",
      "Free Senior Physician Consultation"
    ]),
    icon: "HeartPulse",
    color: "emerald"
  },
  {
    title: "Executive Full Body Checkup",
    subtitle: "Premium advanced health assessment for executives, professionals, and senior citizens.",
    slug: "executive-full-body-checkup",
    category: "Full Body",
    price: 3499,
    originalPrice: 7500,
    discount: "53% OFF",
    recommendedFor: "Corporate executives, individuals over 35, and anyone with a busy lifestyle or family disease history.",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day (6-8 Hours)",
    popular: false,
    featured: true,
    status: "Active",
    testsCount: 88,
    testsIncluded: JSON.stringify([
      "Complete Hemogram (CBC Profile)",
      "Comprehensive Lipid Panel & Atherogenic Index",
      "Liver Function Extended (12 parameters)",
      "Renal / Kidney Panel & Electrolytes",
      "Vitamin D3 & Vitamin B12 Levels",
      "Thyroid Function Panel (T3, T4, TSH)",
      "HbA1c & Fasting Glucose",
      "Chest X-Ray & ECG Screening",
      "Consultation with Senior Consultant Physician"
    ]),
    icon: "ShieldPlus",
    color: "blue"
  },
  {
    title: "Basic Health Checkup",
    subtitle: "Essential baseline vital screen covering blood count, glucose, and key organs.",
    slug: "basic-health-checkup",
    category: "Essential",
    price: 799,
    originalPrice: 1600,
    discount: "50% OFF",
    recommendedFor: "Young adults, students, and first-time preventative checkup seekers.",
    fasting: "8-10 hours fasting required",
    reportTime: "Same Day",
    popular: false,
    featured: true,
    status: "Active",
    testsCount: 32,
    testsIncluded: JSON.stringify([
      "Complete Blood Count (CBC - 24)",
      "Fasting Blood Glucose",
      "Serum Creatinine (Kidney Screen)",
      "Total Cholesterol & Triglycerides",
      "Urine Routine & Microscopic Screen",
      "Medical Practitioner Report Review"
    ]),
    icon: "Activity",
    color: "cyan"
  },
  {
    title: "Diabetes & Heart Care Package",
    subtitle: "Targeted evaluation for blood sugar control, lipid levels, and cardiovascular health.",
    slug: "diabetes-heart-care-package",
    category: "Specialized",
    price: 1499,
    originalPrice: 3200,
    discount: "53% OFF",
    recommendedFor: "Diabetic / pre-diabetic patients, hypertension patients, and anyone monitoring cardio-metabolic markers.",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day",
    popular: true,
    featured: true,
    status: "Active",
    testsCount: 45,
    testsIncluded: JSON.stringify([
      "HbA1c (Glycosylated Hemoglobin)",
      "Fasting & Post-Prandial Blood Sugar",
      "Extended Lipid Profile (LDL, HDL, VLDL, Triglycerides)",
      "Urine Microalbumin / Creatinine Ratio (Early Kidney Guard)",
      "ECG (Resting 12-Lead)",
      "Diabetologist / Physician Consultation"
    ]),
    icon: "Heart",
    color: "rose"
  },
  {
    title: "Women's Wellness & Hormonal Care",
    subtitle: "Tailored health package addressing hormonal balance, bone density, thyroid, and reproductive wellness.",
    slug: "womens-wellness-care",
    category: "Women",
    price: 2299,
    originalPrice: 4800,
    discount: "52% OFF",
    recommendedFor: "Women of all ages (PCOS, thyroid issues, fertility check, post-menopause care).",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day",
    popular: false,
    featured: true,
    status: "Active",
    testsCount: 55,
    testsIncluded: JSON.stringify([
      "Complete Hemogram with Iron Profile & Ferritin",
      "Thyroid Function Panel (T3, T4, TSH)",
      "Calcium & Vitamin D3 Bone Health",
      "Blood Sugar & Kidney Profile",
      "Lipid Screen for Cardiovascular Risk",
      "Pelvic Ultrasound Referral Option",
      "Consultation with Consultant Gynecologist"
    ]),
    icon: "Sparkles",
    color: "purple"
  },
  {
    title: "Senior Citizen Comprehensive Package",
    subtitle: "Designed specifically for adults aged 60+ to track mobility, cardiac health, kidneys, and vitals.",
    slug: "senior-citizen-health-package",
    category: "Senior",
    price: 2499,
    originalPrice: 5200,
    discount: "52% OFF",
    recommendedFor: "Elders aged 55+ for biannual or annual health surveillance.",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day",
    popular: false,
    featured: true,
    status: "Active",
    testsCount: 72,
    testsIncluded: JSON.stringify([
      "Complete Hemogram & ESR (Infection / Inflammation)",
      "Extended Renal Panel & Serum Electrolytes (Na, K, Cl)",
      "Liver Function Panel",
      "Comprehensive Lipid Panel",
      "Uric Acid (Joint pain & Gout assessment)",
      "Vitamin D3 & Calcium (Bone health)",
      "Fasting Glucose & HbA1c",
      "12-Lead ECG",
      "Consultation with Senior Geriatric / General Physician"
    ]),
    icon: "UserCheck",
    color: "amber"
  },
  {
    title: "Cardiac Risk & Heart Care Screen",
    subtitle: "Advanced cardiovascular screening to detect plaque risk, cholesterol abnormalities, and rhythm changes.",
    slug: "cardiac-heart-risk-screen",
    category: "Specialized",
    price: 1699,
    originalPrice: 3500,
    discount: "51% OFF",
    recommendedFor: "Individuals with hypertension, family history of heart disease, smoking history, or chest discomfort.",
    fasting: "10-12 hours fasting required",
    reportTime: "Same Day",
    popular: false,
    featured: false,
    status: "Active",
    testsCount: 40,
    testsIncluded: JSON.stringify([
      "Comprehensive Lipid Profile (Cholesterol, HDL, LDL, VLDL, Non-HDL)",
      "High Sensitivity C-Reactive Protein (hs-CRP marker)",
      "Fasting Blood Glucose",
      "Serum Homocysteine (Cardiovascular risk)",
      "Serum Electrolytes (Sodium, Potassium)",
      "ECG (Resting 12-Lead)",
      "Cardiologist / Senior Physician Review"
    ]),
    icon: "HeartPulse",
    color: "red"
  },
  {
    title: "Thyroid & Metabolic Health Screen",
    subtitle: "Evaluates thyroid gland function, metabolic rate, weight issues, and energy levels.",
    slug: "thyroid-metabolic-screen",
    category: "Specialized",
    price: 1199,
    originalPrice: 2400,
    discount: "50% OFF",
    recommendedFor: "Anyone experiencing unexplained weight gain/loss, hair loss, fatigue, cold intolerance, or mood changes.",
    fasting: "8-10 hours fasting required",
    reportTime: "Same Day",
    popular: false,
    featured: false,
    status: "Active",
    testsCount: 35,
    testsIncluded: JSON.stringify([
      "Complete Thyroid Profile (T3, T4, TSH Ultrasensitive)",
      "Complete Blood Count (CBC - 24 parameters)",
      "Fasting Blood Sugar",
      "Lipid Screen (Total Cholesterol & Triglycerides)",
      "Serum Calcium",
      "Consultation for Thyroid & Weight Management"
    ]),
    icon: "Activity",
    color: "emerald"
  }
];

async function main() {
  console.log("Seeding / Updating Live Database...");

  // Rename any legacy "General Medicine" service to "General Physician"
  const legacyService = await prisma.service.findFirst({
    where: { title: "General Medicine" }
  });
  if (legacyService) {
    await prisma.service.update({
      where: { id: legacyService.id },
      data: { title: "General Physician" }
    });
    console.log("Renamed legacy service 'General Medicine' to 'General Physician'");
  }

  // 1. Update SystemSettings
  const existingSettings = await prisma.systemSettings.findFirst();
  const settingsPayload = {
    hospitalName: "HealthFirst",
    heroTitle: "Better Health & Better Life",
    address: "Shop 2, H.No: 11-13-57, Rd Number 1, Alkapuri, Ramakrishnapuram, Kothapet, Hyderabad, Telangana – 500035",
    phone: "+91 92818 62664",
    email: "contact@healthfirstclinics.com",
    footerDescription: "HealthFirst Clinics | Pharmacy | Diagnostics is a trusted multispeciality polyclinic in Alkapuri, Kothapet, Hyderabad, offering clinical consultations, in-house diagnostics, and pharmacy services.",
    workingDays: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
    openingTime: "08:00",
    closingTime: "21:00",
    sundayOpeningTime: "08:00",
    sundayClosingTime: "13:00"
  };

  if (existingSettings) {
    await prisma.systemSettings.update({
      where: { id: existingSettings.id },
      data: settingsPayload
    });
    console.log("SystemSettings updated successfully.");
  } else {
    await prisma.systemSettings.create({
      data: settingsPayload
    });
    console.log("SystemSettings created successfully.");
  }

  // 2. Upsert Doctors
  for (const doc of doctorsData) {
    const existing = await prisma.doctor.findFirst({
      where: { name: doc.name }
    });

    if (existing) {
      await prisma.doctor.update({
        where: { id: existing.id },
        data: doc
      });
      console.log(`Updated doctor: ${doc.name}`);
    } else {
      await prisma.doctor.create({
        data: doc
      });
      console.log(`Created doctor: ${doc.name}`);
    }
  }

  // 3. Upsert Services
  for (const srv of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { title: srv.title }
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: srv
      });
      console.log(`Updated service: ${srv.title}`);
    } else {
      await prisma.service.create({
        data: srv
      });
      console.log(`Created service: ${srv.title}`);
    }
  }

  // 4. Upsert Health Packages
  if ((prisma as any).healthPackage) {
    for (const pkg of healthPackagesData) {
      const existing = await (prisma as any).healthPackage.findFirst({
        where: { slug: pkg.slug }
      });

      if (existing) {
        await (prisma as any).healthPackage.update({
          where: { id: existing.id },
          data: pkg
        });
        console.log(`Updated package: ${pkg.title}`);
      } else {
        await (prisma as any).healthPackage.create({
          data: pkg
        });
        console.log(`Created package: ${pkg.title}`);
      }
    }
  }

  console.log("Database update completed successfully!");
}

main()
  .catch((e) => {
    console.error("Database seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

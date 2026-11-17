-- ==============================================================================
-- HEALTHFIRST CLINICS: LIVE DATABASE MIGRATION & 6 PACKAGES SEED
-- Database: api.healthfirstclinics.com (Run directly in cPanel phpMyAdmin)
-- ==============================================================================

-- 1. Create HealthPackage Table if not exists
CREATE TABLE IF NOT EXISTS `HealthPackage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` TEXT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `category` VARCHAR(191) NOT NULL DEFAULT 'Comprehensive',
  `price` INT NOT NULL,
  `originalPrice` INT NOT NULL,
  `discount` VARCHAR(191) NULL,
  `recommendedFor` TEXT NULL,
  `fasting` VARCHAR(191) NULL DEFAULT '10-12 hours fasting required',
  `reportTime` VARCHAR(191) NULL DEFAULT 'Same day delivery (6-8 hours)',
  `popular` TINYINT(1) NOT NULL DEFAULT 0,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `testsCount` INT NOT NULL DEFAULT 0,
  `testsIncluded` LONGTEXT NULL,
  `icon` VARCHAR(191) NULL DEFAULT 'HeartPulse',
  `color` VARCHAR(191) NULL DEFAULT 'emerald',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insert or Update 6 Essential Packages (with 4 Featured on Home Page)
INSERT INTO `HealthPackage` 
  (`id`, `title`, `subtitle`, `slug`, `category`, `price`, `originalPrice`, `discount`, `recommendedFor`, `fasting`, `reportTime`, `popular`, `featured`, `status`, `testsCount`, `testsIncluded`, `icon`, `color`)
VALUES
-- Package 1: Most Popular Full Body Checkup (FEATURED ON HOME)
(
  1,
  'Comprehensive Full Body Checkup',
  'Our most popular comprehensive panel covering heart, liver, kidneys, thyroid, and blood health.',
  'comprehensive-full-body-checkup',
  'Full Body',
  999,
  2800,
  '64% OFF',
  'Adults aged 25+ wanting an all-inclusive annual preventive wellness assessment.',
  '10-12 hours fasting required',
  'Same Day (within 8 hours)',
  1,
  1,
  'Active',
  65,
  '["Complete Blood Picture (CBC / Hemogram - 24 parameters)","Complete Liver Function Test (LFT - 11 tests)","Complete Kidney Function Test (KFT / RFT - 8 tests)","Complete Lipid Profile (Cholesterol, Triglycerides, HDL, LDL, VLDL)","Thyroid Screening (TSH Ultrasensitive)","Fasting Blood Glucose & Average Sugar Screening","Urine Examination (Routine & Microscopic)","Blood Pressure & Body Mass Index Check","Free In-person Doctor Consultation & Report Review"]',
  'ShieldCheck',
  'emerald'
),

-- Package 2: Master Executive Checkup (FEATURED ON HOME)
(
  2,
  'Master Executive Health Checkup',
  'Advanced full body package including heart ECG, critical vitamins, bone markers, and organ profiles.',
  'master-executive-health-checkup',
  'Executive',
  1999,
  4500,
  '55% OFF',
  'Working professionals, executives, and individuals with stressful lifestyles.',
  '10-12 hours fasting required',
  'Same Day (within 8 hours)',
  0,
  1,
  'Active',
  85,
  '["All 65 tests in Comprehensive Checkup","Vitamin D3 (25-Hydroxy) - Bone & Immunity marker","Vitamin B12 (Cyanocobalamin) - Nerve & Energy marker","Glycated Hemoglobin (HbA1c - 3 months sugar average)","12-Lead Resting Electrocardiogram (ECG)","Serum Electrolytes (Sodium, Potassium, Chloride)","Comprehensive Consultation with Senior Physician"]',
  'Zap',
  'purple'
),

-- Package 3: Women\'s Wellness (FEATURED ON HOME)
(
  3,
  'Women\'s Wellness & Hormonal Profile',
  'Specially formulated for women to monitor anemia, bone density, thyroid, reproductive health, and hormones.',
  'womens-wellness-hormonal-profile',
  'Women\'s Health',
  1499,
  3200,
  '53% OFF',
  'Women of all age groups, especially for PCOS, hormonal imbalance, fertility, or menopausal evaluation.',
  '10-12 hours fasting required',
  'Same Day',
  0,
  1,
  'Active',
  58,
  '["CBC with ESR & Platelet Indices (Anemia screening)","Serum Ferritin & Iron Studies","Thyroid Profile Total (T3, T4, TSH)","Serum Calcium & Phosphorus (Bone health)","Complete Urine Analysis","Kidney & Liver Screening","Gynecologist Consultation & Dietary Counseling"]',
  'Sparkles',
  'rose'
),

-- Package 4: Senior Citizens Panel (FEATURED ON HOME)
(
  4,
  'Senior Citizens Active Life Panel',
  'Gentle, comprehensive geriatric checkup designed to ensure healthy and active aging.',
  'senior-citizens-active-life-panel',
  'Senior Citizen',
  1899,
  4000,
  '52% OFF',
  'Elders aged 55+ for biannual or annual health surveillance.',
  '10-12 hours fasting required',
  'Same Day',
  0,
  1,
  'Active',
  72,
  '["Complete Hemogram & ESR (Infection / Inflammation)","Extended Renal Panel & Serum Electrolytes (Na, K, Cl)","Liver Function Panel","Comprehensive Lipid Panel","Uric Acid (Joint pain & Gout assessment)","Vitamin D3 & Calcium (Bone health)","Fasting Glucose & HbA1c","12-Lead ECG","Consultation with Senior Geriatric / General Physician"]',
  'UserCheck',
  'amber'
),

-- Package 5: Diabetic Care Screen (SPECIALIZED)
(
  5,
  'Diabetic Care & Wellness Screen',
  'Specialized monitoring protocol for diabetic, pre-diabetic patients and early complication detection.',
  'diabetic-care-wellness-screen',
  'Specialized',
  799,
  1800,
  '55% OFF',
  'Diabetic individuals, pre-diabetics, or those with family history of type-2 diabetes.',
  '10-12 hours fasting required',
  'Same Day',
  0,
  0,
  'Active',
  42,
  '["Fasting Blood Glucose (FBS)","Post-Prandial Blood Sugar (PPBS)","HbA1c (Glycosylated Hemoglobin 3-Month Average)","Urine Microalbumin / Creatinine Ratio (Early Kidney damage screen)","Serum Creatinine & Blood Urea Nitrogen","Lipid Profile (Diabetic Dyslipidemia Screen)","Consultation with Diabetologist / Physician"]',
  'HeartPulse',
  'amber'
),

-- Package 6: Cardiac Risk & Heart Care (SPECIALIZED)
(
  6,
  'Cardiac Risk & Heart Care Screen',
  'Advanced cardiovascular screening to detect plaque risk, cholesterol abnormalities, and rhythm changes.',
  'cardiac-heart-risk-screen',
  'Specialized',
  1699,
  3500,
  '51% OFF',
  'Individuals with hypertension, family history of heart disease, smoking history, or chest discomfort.',
  '10-12 hours fasting required',
  'Same Day',
  0,
  0,
  'Active',
  40,
  '["Comprehensive Lipid Profile (Cholesterol, HDL, LDL, VLDL, Non-HDL)","High Sensitivity C-Reactive Protein (hs-CRP marker)","Fasting Blood Glucose","Serum Homocysteine (Cardiovascular risk)","Serum Electrolytes (Sodium, Potassium)","ECG (Resting 12-Lead)","Cardiologist / Senior Physician Review"]',
  'HeartPulse',
  'red'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `price` = VALUES(`price`),
  `originalPrice` = VALUES(`originalPrice`),
  `discount` = VALUES(`discount`),
  `recommendedFor` = VALUES(`recommendedFor`),
  `fasting` = VALUES(`fasting`),
  `reportTime` = VALUES(`reportTime`),
  `popular` = VALUES(`popular`),
  `featured` = VALUES(`featured`),
  `status` = VALUES(`status`),
  `testsCount` = VALUES(`testsCount`),
  `testsIncluded` = VALUES(`testsIncluded`),
  `icon` = VALUES(`icon`),
  `color` = VALUES(`color`);

-- 3. Verify packages in database
SELECT `id`, `title`, `category`, `price`, `discount`, `featured`, `popular`, `status` FROM `HealthPackage`;

export const typeDefs = `#graphql
  type Doctor {
    id: Int!
    name: String!
    qualification: String!
    specialization: String!
    experience: String!
    email: String
    phone: String
    location: String
    availability: String
    languages: String
    image: String
    timings: String
    bio: String
    gender: String
    consultationFee: Int
    createdAt: String!
    updatedAt: String!
    testimonials: [Testimonial!]!
  }

  type ServiceFAQ {
    q: String!
    a: String!
  }

  input ServiceFAQInput {
    q: String!
    a: String!
  }

  type Service {
    id: Int!
    title: String!
    description: String!
    category: String
    status: String!
    doctorsCount: Int!
    image: String
    details: String
    features: [String!]
    treatments: [String!]
    conditions: [String!]
    faqs: [ServiceFAQ!]
    createdAt: String!
    updatedAt: String!
  }

  type Blog {
    id: Int!
    title: String!
    content: String!
    category: String
    author: String
    status: String!
    views: Int!
    imageUrl: String
    tags: String
    createdAt: String!
    updatedAt: String!
  }

  type GalleryImage {
    id: Int!
    url: String!
    title: String
    category: String!
    createdAt: String!
    updatedAt: String!
  }

  type Patient {
    id: Int!
    name: String!
    phone: String!
    email: String
    dob: String
    gender: String
    lastVisit: String
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Appointment {
    id: Int!
    patientName: String!
    email: String
    phone: String!
    doctorId: Int!
    doctor: Doctor!
    department: String!
    date: String!
    timeSlot: String!
    status: String!
    paymentStatus: String!
    paymentType: String
    reportNote: String
    reportUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type RazorpayOrder {
    id: String!
    amount: Int!
    currency: String!
  }

  type ContactInquiry {
    id: Int!
    name: String!
    email: String!
    phone: String
    message: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type FAQ {
    id: Int!
    question: String!
    answer: String!
    createdAt: String!
    updatedAt: String!
  }

  type Testimonial {
    id: Int!
    name: String!
    role: String
    text: String!
    rating: Int!
    status: String!
    doctorId: Int
    doctor: Doctor
    createdAt: String!
    updatedAt: String!
  }

  type Feature {
    title: String!
    description: String!
    icon: String!
  }

  input FeatureInput {
    title: String!
    description: String!
    icon: String!
  }

  type AboutValue {
    title: String!
    description: String!
  }

  input AboutValueInput {
    title: String!
    description: String!
  }

  type QuickLink {
    label: String!
    url: String!
  }

  input QuickLinkInput {
    label: String!
    url: String!
  }

  type SystemSettings {
    id: Int!
    hospitalName: String!
    logoUrl: String
    footerLogoUrl: String
    address: String
    phone: String
    email: String
    website: String
    heroTitle: String
    heroSubtitle: String
    heroImageUrl: String
    heroBadge1Title: String
    heroBadge1Sub: String
    heroBadge2Title: String
    heroBadge2Sub: String
    heroStat1: String
    heroStat2: String
    features: [Feature]
    homeAboutImageUrl: String
    homeAboutYearsValue: String
    homeAboutHeading: String
    homeAboutDescription: String
    homeAboutFeatures: String
    aboutHeroTitle: String
    aboutHeroSubtitle: String
    aboutHeroImageUrl: String
    aboutMissionHeading: String
    aboutMission1: String
    aboutMission2: String
    aboutStat1Value: String
    aboutStat1Label: String
    aboutStat2Value: String
    aboutStat2Label: String
    aboutYearsValue: String
    aboutValues: [AboutValue]
    aboutCtaHeading: String
    aboutCtaSubtext: String
    footerDescription: String
    footerFacebook: String
    footerTwitter: String
    footerInstagram: String
    footerLinkedin: String
    footerYoutube: String
    footerPinterest: String
    footerQuickLinks: [QuickLink]
    siteMetaTitle: String
    siteMetaDescription: String
    siteMetaKeywords: String
    blogsMetaTitle: String
    blogsMetaDescription: String
    contactMetaTitle: String
    contactMetaDescription: String
    siteOgImageUrl: String
    googleAnalyticsId: String
    maintenanceMode: Boolean
    maintenanceMessage: String
    printPaperSize: String
    printShowLogo: Boolean
    printHeaderStyle: String
    printTerms: String
    printPrescriptionDisclaimer: String
    printInvoicePrefix: String
    workingDays: String
    openingTime: String
    closingTime: String
    sundayOpeningTime: String
    sundayClosingTime: String
    slotDuration: Int
    emergencyPhone: String
    paymentPayAtClinic: Boolean
    paymentRazorpayEnabled: Boolean
    paymentRazorpayKeyId: String
    paymentRazorpayKeySecret: String
    paymentPaystackEnabled: Boolean
    paymentPaystackPublicKey: String
    paymentPaystackSecretKey: String
    termsAndConditions: String
    privacyPolicy: String
    canonicalUrl: String
    allowIndexing: Boolean
    allowFollowing: Boolean
    googleSearchConsoleCode: String
    gtmContainerId: String
    clinicCity: String
    clinicState: String
    clinicCountry: String
    clinicPostalCode: String
    schemaMedicalClinic: Boolean
    schemaPhysician: Boolean
    schemaFAQ: Boolean
    schemaBreadcrumb: Boolean
    schemaLocalBusiness: Boolean
    sitemapUrl: String
    enableSitemapGeneration: Boolean
    robotsTxtContent: String
  }

  type Query {
    getDoctors: [Doctor!]!
    getDoctorById(id: Int!): Doctor
    getServices: [Service!]!
    getServiceById(id: Int!): Service
    getBlogs: [Blog!]!
    getBlogById(id: Int!): Blog
    getGalleryImages: [GalleryImage!]!
    getPatients: [Patient!]!
    getAppointments: [Appointment!]!
    getInquiries: [ContactInquiry!]!
    getSettings: SystemSettings
    getFAQs: [FAQ!]!
    getTestimonials: [Testimonial!]!
    getDoctorTestimonials(doctorId: Int!): [Testimonial!]!
    getAdmins: [Admin!]!
    getHealthPackages(category: String, status: String, featured: Boolean): [HealthPackage!]!
    getHealthPackageById(id: Int!): HealthPackage
    getHealthPackageBySlug(slug: String!): HealthPackage
    getPromoOffers(status: String): [PromoOffer!]!
    getActivePromoOffer: PromoOffer
    getPromoOfferById(id: Int!): PromoOffer
  }

  type HealthPackage {
    id: Int!
    title: String!
    subtitle: String
    slug: String!
    category: String!
    price: Int!
    originalPrice: Int!
    discount: String
    recommendedFor: String
    fasting: String
    reportTime: String
    popular: Boolean!
    featured: Boolean!
    status: String!
    testsCount: Int!
    testsIncluded: String
    icon: String
    color: String
    createdAt: String!
    updatedAt: String!
  }

  type PromoOffer {
    id: Int!
    title: String!
    subtitle: String
    description: String
    badgeText: String
    couponCode: String
    imageUrl: String
    buttonText: String!
    buttonLink: String!
    startDate: String!
    endDate: String!
    isActive: Boolean!
    priority: Int!
    autoCloseDelay: Int
    createdAt: String!
    updatedAt: String!
  }

  input PromoOfferInput {
    title: String!
    subtitle: String
    description: String
    badgeText: String
    couponCode: String
    imageUrl: String
    buttonText: String
    buttonLink: String
    startDate: String!
    endDate: String!
    isActive: Boolean
    priority: Int
    autoCloseDelay: Int
  }

  type AuthPayload {
    token: String!
    admin: Admin!
  }

  type Admin {
    id: Int!
    email: String!
    name: String
    role: String!
    permissions: String
  }

  type Mutation {
    loginAdmin(email: String!, password: String!): AuthPayload!
    
    addAdmin(name: String, email: String!, password: String!, role: String, permissions: String): Admin!
    updateAdmin(id: Int!, name: String, email: String, password: String, role: String, permissions: String): Admin!
    deleteAdmin(id: Int!): Boolean!

    addDoctor(name: String!, qualification: String!, specialization: String!, experience: String!, email: String, phone: String, location: String, availability: String, languages: String, image: String, timings: String, bio: String, gender: String, consultationFee: Int): Doctor!
    updateDoctor(id: Int!, name: String, qualification: String, specialization: String, experience: String, email: String, phone: String, location: String, availability: String, languages: String, image: String, timings: String, bio: String, gender: String, consultationFee: Int): Doctor!
    deleteDoctor(id: Int!): Boolean!

    addService(title: String!, description: String!, category: String, status: String, image: String, treatments: [String!], faqs: [ServiceFAQInput!]): Service!
    updateService(id: Int!, title: String, description: String, category: String, status: String, image: String, treatments: [String!], faqs: [ServiceFAQInput!]): Service!
    deleteService(id: Int!): Boolean!

    addHealthPackage(
      title: String!
      subtitle: String
      slug: String
      category: String
      price: Int!
      originalPrice: Int!
      discount: String
      recommendedFor: String
      fasting: String
      reportTime: String
      popular: Boolean
      featured: Boolean
      status: String
      testsCount: Int
      testsIncluded: String
      icon: String
      color: String
    ): HealthPackage!
    updateHealthPackage(
      id: Int!
      title: String
      subtitle: String
      slug: String
      category: String
      price: Int
      originalPrice: Int
      discount: String
      recommendedFor: String
      fasting: String
      reportTime: String
      popular: Boolean
      featured: Boolean
      status: String
      testsCount: Int
      testsIncluded: String
      icon: String
      color: String
    ): HealthPackage!
    deleteHealthPackage(id: Int!): Boolean!
    togglePackageFeatured(id: Int!): HealthPackage!
    togglePackageStatus(id: Int!): HealthPackage!

    createPromoOffer(input: PromoOfferInput!): PromoOffer!
    updatePromoOffer(id: Int!, input: PromoOfferInput!): PromoOffer!
    deletePromoOffer(id: Int!): Boolean!
    togglePromoOfferStatus(id: Int!): PromoOffer!

    addBlog(title: String!, content: String!, category: String, author: String, status: String, imageUrl: String, tags: String): Blog!
    updateBlog(id: Int!, title: String, content: String, category: String, author: String, status: String, imageUrl: String, tags: String): Blog!
    deleteBlog(id: Int!): Boolean!
    incrementBlogViews(id: Int!): Blog!

    addGalleryImage(url: String!, title: String, category: String!): GalleryImage!
    updateGalleryImage(id: Int!, url: String, title: String, category: String): GalleryImage!
    deleteGalleryImage(id: Int!): Boolean!

    addPatient(name: String!, phone: String!, email: String, dob: String, gender: String, lastVisit: String): Patient!
    updatePatient(id: Int!, name: String, phone: String, email: String, dob: String, gender: String, lastVisit: String): Patient!
    deletePatient(id: Int!): Boolean!

    addAppointment(patientName: String!, email: String, phone: String!, doctorId: Int!, department: String!, date: String!, timeSlot: String!, paymentType: String, paymentStatus: String): Appointment!
    updateAppointmentStatus(id: Int!, status: String, paymentStatus: String, paymentType: String): Appointment!
    rescheduleAppointment(id: Int!, date: String!, timeSlot: String!): Appointment!
    uploadAppointmentReport(id: Int!, reportNote: String, reportUrl: String): Appointment!

    addInquiry(name: String!, email: String!, phone: String, message: String!): ContactInquiry!
    updateInquiryStatus(id: Int!, status: String!): ContactInquiry!
    deleteInquiry(id: Int!): Boolean!
    replyToInquiry(id: Int!, replyMessage: String!): ContactInquiry!

    addFAQ(question: String!, answer: String!): FAQ!
    updateFAQ(id: Int!, question: String, answer: String): FAQ!
    deleteFAQ(id: Int!): Boolean!

    addTestimonial(name: String!, role: String, text: String!, rating: Int!, doctorId: Int): Testimonial!
    updateTestimonialStatus(id: Int!, status: String!): Testimonial!
    deleteTestimonial(id: Int!): Boolean!

    createRazorpayOrder(amount: Int!): RazorpayOrder!

    updateSettings(
      hospitalName: String!
      logoUrl: String
      footerLogoUrl: String
      address: String
      phone: String
      email: String
      website: String
      heroTitle: String
      heroSubtitle: String
      heroImageUrl: String
      heroBadge1Title: String
      heroBadge1Sub: String
      heroBadge2Title: String
      heroBadge2Sub: String
      heroStat1: String
      heroStat2: String
      features: [FeatureInput]
      homeAboutImageUrl: String
      homeAboutYearsValue: String
      homeAboutHeading: String
      homeAboutDescription: String
      homeAboutFeatures: String
      aboutHeroTitle: String
      aboutHeroSubtitle: String
      aboutHeroImageUrl: String
      aboutMissionHeading: String
      aboutMission1: String
      aboutMission2: String
      aboutStat1Value: String
      aboutStat1Label: String
      aboutStat2Value: String
      aboutStat2Label: String
      aboutYearsValue: String
      aboutValues: [AboutValueInput]
      aboutCtaHeading: String
      aboutCtaSubtext: String
      footerDescription: String
      footerFacebook: String
      footerTwitter: String
      footerInstagram: String
      footerLinkedin: String
      footerYoutube: String
      footerPinterest: String
      footerQuickLinks: [QuickLinkInput]
      siteMetaTitle: String
      siteMetaDescription: String
      siteMetaKeywords: String
      blogsMetaTitle: String
      blogsMetaDescription: String
      contactMetaTitle: String
      contactMetaDescription: String
      siteOgImageUrl: String
      googleAnalyticsId: String
      maintenanceMode: Boolean
      maintenanceMessage: String
      printPaperSize: String
      printShowLogo: Boolean
      printHeaderStyle: String
      printTerms: String
      printPrescriptionDisclaimer: String
      printInvoicePrefix: String
      workingDays: String
      openingTime: String
      closingTime: String
      sundayOpeningTime: String
      sundayClosingTime: String
      slotDuration: Int
      emergencyPhone: String
      paymentPayAtClinic: Boolean
      paymentRazorpayEnabled: Boolean
      paymentRazorpayKeyId: String
      paymentRazorpayKeySecret: String
      paymentPaystackEnabled: Boolean
      paymentPaystackPublicKey: String
      paymentPaystackSecretKey: String
      termsAndConditions: String
      privacyPolicy: String
      canonicalUrl: String
      allowIndexing: Boolean
      allowFollowing: Boolean
      googleSearchConsoleCode: String
      gtmContainerId: String
      clinicCity: String
      clinicState: String
      clinicCountry: String
      clinicPostalCode: String
      schemaMedicalClinic: Boolean
      schemaPhysician: Boolean
      schemaFAQ: Boolean
      schemaBreadcrumb: Boolean
      schemaLocalBusiness: Boolean
      sitemapUrl: String
      enableSitemapGeneration: Boolean
      robotsTxtContent: String
    ): SystemSettings!
  }
`;

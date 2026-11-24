import { JobOpening } from "../types/jobTypes"

interface RawSeedJob extends Omit<JobOpening, "postedAt" | "postedDate"> {
  minutesAgo: number
}

// Helper to format dynamic human-readable relative time
function formatPostedAt(minutesAgo: number): string {
  if (minutesAgo < 60) return `${Math.max(5, minutesAgo)}m ago`
  const hours = Math.floor(minutesAgo / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

const RAW_JOBS: RawSeedJob[] = [
  // ==========================================
  // 1. FAST-GROWING TECH STARTUPS (INDIA)
  // ==========================================
  {
    id: "in-zepto-sde1-blr",
    title: "SDE - 1 (Quick Commerce Dispatch Engine)",
    company: "Zepto",
    companyLogo: "https://images.seeklogo.com/logo-png/43/1/zepto-logo-png_seeklogo-437508.png",
    companyWebsite: "https://www.zeptonow.com",
    applyUrl: "https://www.linkedin.com/company/zeptonow/jobs/",
    location: "Bangalore, Karnataka (HSR Layout)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹24,00,000 LPA + ESOPs",
    minutesAgo: 18,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 78,
    tags: ["Go", "Node.js", "PostgreSQL", "Kafka", "Microservices", "Redis"],
    description: "Zepto is revolutionizing 10-minute grocery delivery across India. You will build high-throughput dispatch algorithms and routing engines handling 100,000+ real-time concurrent orders.",
    responsibilities: [
      "Build low-latency microservices in Go and Node.js for batching and driver dispatch.",
      "Design fault-tolerant event streams with Apache Kafka and Redis cluster.",
      "Optimize SQL query plans and caching layers for sub-20ms p99 response times."
    ],
    requirements: [
      "B.Tech/B.E. in Computer Science or equivalent practical background.",
      "0-2 years of solid backend development experience with Go, Node.js, or Java.",
      "Solid understanding of concurrency, data structures, and relational databases."
    ],
    niceToHave: ["Familiarity with geospatial indexing (PostGIS/H3) and Docker/K8s."],
    benefits: ["Competitive startup salary + generous ESOP grants", "Comprehensive health coverage", "Free daily catered lunches and snacks at HSR office"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Startup"
  },
  {
    id: "in-zepto-intern-blr",
    title: "Full Stack Engineering Intern (Summer 2026)",
    company: "Zepto",
    companyLogo: "https://images.seeklogo.com/logo-png/43/1/zepto-logo-png_seeklogo-437508.png",
    companyWebsite: "https://www.zeptonow.com",
    applyUrl: "https://internshala.com/internships/matching-zepto-jobs",
    location: "Bangalore, Karnataka (HSR Layout)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Full Stack",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹45,000 - ₹60,000 / month + Pre-Placement Offer (PPO)",
    minutesAgo: 45,
    deadline: "2026 Batch Eligible",
    applicantsCount: 165,
    tags: ["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL", "Tailwind CSS"],
    description: "Join Zepto's engineering core as a technical intern. You will work on real customer-facing web apps, rider portals, and store inventory dashboards with senior mentors.",
    responsibilities: [
      "Develop responsive web interfaces in Next.js and Tailwind CSS.",
      "Create clean RESTful and WebSocket APIs in Node.js / Express.",
      "Write unit and integration tests ensuring 90%+ code coverage."
    ],
    requirements: [
      "Pursuing B.Tech / BE in CSE, ISE, ECE graduating in 2026 or 2027.",
      "Strong coding skills in JavaScript/TypeScript, React, and basic backend concepts.",
      "GitHub portfolio demonstrating real deployed projects."
    ],
    niceToHave: ["Prior startup internship or open source contributions."],
    benefits: ["Industry-leading intern stipend", "Direct conversion to full-time SDE-1 upon graduation", "Daily snacks, wellness allowance, and modern Mac workstation"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Startup"
  },
  {
    id: "in-cred-backend-blr",
    title: "Backend Engineer, Financial Ledger Platform",
    company: "CRED",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/CRED_Logo.png",
    companyWebsite: "https://cred.club",
    applyUrl: "https://www.linkedin.com/company/credclub/jobs/",
    location: "Bangalore, Karnataka (Indiranagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹30,00,000 - ₹50,00,000 LPA + CRED ESOPs",
    minutesAgo: 75,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 220,
    tags: ["Java", "Spring Boot", "Distributed Systems", "MySQL", "AWS", "Kafka"],
    description: "CRED processes billions in monthly credit card and UPI transactions. You will architect bank-grade double-entry ledger engines and high-concurrency reward pipelines.",
    responsibilities: [
      "Architect zero-loss financial ledgers and idempotent payment state machines.",
      "Build high-throughput Kafka streaming pipelines processing 50M+ events daily.",
      "Optimize distributed locks, database isolation levels, and caching strategies."
    ],
    requirements: [
      "2-5 years experience designing distributed backend systems in Java/Kotlin or Go.",
      "Deep understanding of transactional consistency, ACID properties, and event sourcing.",
      "Bachelor's in Computer Science or equivalent field."
    ],
    niceToHave: ["Experience in FinTech, UPI, or banking payment gateway protocols."],
    benefits: ["Top-tier market compensation + lucrative equity", "Zero-deductible premium family health insurance", "Iconic Indiranagar clubhouse with gourmet dining and gym"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Startup"
  },
  {
    id: "in-cred-intern-blr",
    title: "Product Engineering Intern (Backend / Full Stack)",
    company: "CRED",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/CRED_Logo.png",
    companyWebsite: "https://cred.club",
    applyUrl: "https://wellfound.com/company/cred-3/jobs",
    location: "Bangalore, Karnataka (Indiranagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹75,000 / month + Housing Allowance",
    minutesAgo: 110,
    deadline: "2026 Batch Eligible",
    applicantsCount: 195,
    tags: ["Java", "Kotlin", "React", "TypeScript", "SQL", "Data Structures"],
    description: "Work alongside some of India's most accomplished engineering leaders building products used by millions of creditworthy individuals daily.",
    responsibilities: [
      "Implement core product features under the guidance of a senior engineering mentor.",
      "Write high-quality unit tests and participate in technical design reviews.",
      "Refactor legacy endpoints to improve API latency and maintainability."
    ],
    requirements: [
      "Final or pre-final year engineering student (2026 Batch).",
      "Proficient in Java, Kotlin, Python, or TypeScript with strong algorithmic foundations.",
      "Exceptional problem-solving abilities on LeetCode/HackerRank."
    ],
    niceToHave: ["Experience with cloud providers (AWS/GCP) or microservice patterns."],
    benefits: ["₹75,000/month stipend + corporate housing support", "Direct PPO pathway for Full-Time SWE L1", "Free gourmet breakfast, lunch, and dinner"],
    featured: true,
    urgentHiring: false,
    sourcePlatform: "Wellfound",
    companyType: "Startup"
  },
  {
    id: "in-meesho-frontend-blr",
    title: "Software Engineer - Frontend (React / Web Platform)",
    company: "Meesho",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Meesho_Logo_Full.png",
    companyWebsite: "https://www.meesho.com",
    applyUrl: "https://www.naukri.com/meesho-jobs-in-bangalore",
    location: "Bangalore, Karnataka (Outer Ring Road)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Remote",
    category: "Frontend & Web",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹16,00,000 - ₹22,00,000 LPA + Performance Bonus",
    minutesAgo: 90,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 140,
    tags: ["React", "JavaScript", "TypeScript", "Redux", "Webpack", "Performance Tuning"],
    description: "Meesho is democratizing internet commerce for Bharat. You will build lightning-fast web and mobile-web experiences optimized for 2G/3G low-bandwidth networks.",
    responsibilities: [
      "Develop ultra-responsive user interfaces in React.js and modern Web Standards.",
      "Optimize bundle size, First Contentful Paint (FCP), and Time to Interactive (TTI).",
      "Collaborate closely with product designers and user researchers to build for Tier 2/3 users."
    ],
    requirements: [
      "B.Tech in Computer Science, IT, or related degree (0-2 years experience).",
      "Strong JavaScript fundamentals (ES6+), DOM manipulation, and React lifecycle.",
      "Experience with state management (Redux/Zustand) and responsive mobile web design."
    ],
    niceToHave: ["Familiarity with Progressive Web Apps (PWAs) and web performance metrics."],
    benefits: ["100% Remote / Work from anywhere in India option", "Home office setup reimbursement up to ₹40,000", "Annual learning and wellness budget"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "Startup"
  },
  {
    id: "in-swiggy-sde2-blr",
    title: "SDE - II, Delivery & Drone Telematics",
    company: "Swiggy",
    companyLogo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    companyWebsite: "https://careers.swiggy.com",
    applyUrl: "https://www.linkedin.com/company/swiggy-in/jobs/",
    location: "Bangalore, Karnataka (Koramangala)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹26,00,000 - ₹42,00,000 LPA + Stocks",
    minutesAgo: 130,
    deadline: "Actively Hiring",
    applicantsCount: 180,
    tags: ["Java", "Go", "AWS", "Kafka", "PostgreSQL", "Redis", "Distributed Systems"],
    description: "Join Swiggy's core delivery logistics group. You will engineer low-latency real-time tracking, rider assignment algorithms, and automated delivery cluster optimization.",
    responsibilities: [
      "Build real-time tracking services handling millions of concurrent GPS location pings.",
      "Design and maintain scalable microservices in Java and Go on AWS EKS.",
      "Reduce system p99 latency during hyper-peak lunch and dinner demand windows."
    ],
    requirements: [
      "2-4 years of experience building distributed web services in Java or Go.",
      "Hands-on experience with Kafka, Redis, and high-availability database replication.",
      "B.E./B.Tech in Computer Science or related engineering discipline."
    ],
    niceToHave: ["Prior experience with location-based services or GIS data."],
    benefits: ["Top-tier compensation + wealth creation via stock options", "Comprehensive health coverage including parents", "Swiggy One corporate privileges and discount vouchers"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Startup"
  },
  {
    id: "in-zomato-intern-delhi-blr",
    title: "Software Engineering Intern (Backend / Mobile)",
    company: "Zomato",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    companyWebsite: "https://www.zomato.com/careers",
    applyUrl: "https://internshala.com/internships/matching-zomato-jobs",
    location: "Bangalore, Karnataka / Gurgaon",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹50,000 / month + Daily Meals",
    minutesAgo: 60,
    deadline: "2026 Batch Eligible",
    applicantsCount: 280,
    tags: ["Python", "Golang", "Node.js", "MySQL", "Algorithms", "React Native"],
    description: "Work on mission-critical features across Zomato and Blinkit. Tackle massive flash sale traffic spikes, automated order verification, and real-time merchant dashboards.",
    responsibilities: [
      "Write clean, modular code in Go, Python, or React Native.",
      "Help build internal observability tools and automated regression test suites.",
      "Collaborate directly with senior engineering architects on live production releases."
    ],
    requirements: [
      "Enrolled in Computer Science or related degree graduating in 2026.",
      "Strong grasp of CS fundamentals: algorithms, OOP, databases, and computer networks.",
      "Demonstrated coding proficiency with personal projects on GitHub."
    ],
    niceToHave: ["Familiarity with Redis and AWS services."],
    benefits: ["₹50,000 monthly stipend", "Free meals and unlimited snacks at Zomato office", "High conversion rate to full-time SDE role"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Startup"
  },
  {
    id: "in-zerodha-sde-blr",
    title: "Python / Go Systems Developer (Kite Platform)",
    company: "Zerodha",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Zerodha_logo.svg",
    companyWebsite: "https://zerodha.com",
    applyUrl: "https://www.linkedin.com/company/zerodha/jobs/",
    location: "Bangalore, Karnataka (JP Nagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹28,00,000 LPA + Annual Profit Share",
    minutesAgo: 150,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 310,
    tags: ["Go", "Python", "PostgreSQL", "WebSockets", "Linux", "Open Source"],
    description: "Zerodha powers over 15% of all Indian stock market retail volumes without venture capital. Work on ultra-clean, minimalistic open-source software and low-latency trading infrastructure.",
    responsibilities: [
      "Develop low-latency market data processing engines in Go and Python.",
      "Maintain high-concurrency WebSocket connections serving 10M+ simultaneous traders.",
      "Contribute to and maintain internal and public open-source libraries."
    ],
    requirements: [
      "Strong practical experience in Go and Python on Linux environments (0-3 years).",
      "Deep understanding of network sockets, concurrency, memory allocation, and database indexes.",
      "Appreciation for minimalistic architecture with minimal third-party dependencies."
    ],
    niceToHave: ["Active contributions to open-source software on GitHub."],
    benefits: ["No-crunch engineering culture with 35-hour work weeks", "Generous annual profit-sharing bonus", "Ergonomic hardware and complete wellness coverage"],
    featured: true,
    urgentHiring: false,
    sourcePlatform: "LinkedIn",
    companyType: "Startup"
  },
  {
    id: "in-groww-frontend-blr",
    title: "Frontend Engineer (Investments & Stocks UI)",
    company: "Groww",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Groww_app_logo.png",
    companyWebsite: "https://groww.in",
    applyUrl: "https://www.naukri.com/groww-jobs-in-bangalore",
    location: "Bangalore, Karnataka (Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Frontend & Web",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹16,00,000 - ₹25,00,000 LPA + ESOPs",
    minutesAgo: 40,
    deadline: "Actively Hiring",
    applicantsCount: 115,
    tags: ["React", "TypeScript", "Next.js", "TradingView", "Canvas / WebGL", "Tailwind CSS"],
    description: "Groww is India's largest retail stock broking platform. You will build interactive charting engines, stock screener tables, and lightning-fast mutual fund checkout workflows.",
    responsibilities: [
      "Build real-time charting interfaces with TradingView libraries and WebSockets.",
      "Create modular, accessible UI design system components in React and TypeScript.",
      "Ensure frictionless responsive performance across desktop and mobile browsers."
    ],
    requirements: [
      "B.Tech in Computer Science or related degree (0-2 years experience).",
      "Strong proficiency with React, TypeScript, HTML5/CSS3, and modern bundle tools (Vite/Next.js).",
      "Demonstrated ability to write clean, reusable, testable code."
    ],
    niceToHave: ["Personal interest in financial markets, mutual funds, and trading."],
    benefits: ["High-growth fintech equity options", "Comprehensive OPD and hospitalization insurance", "Bangalore campus with gym and free barista coffee"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "Startup"
  },
  {
    id: "in-razorpay-sde1-blr",
    title: "SDE - 1 (Payments Platform & Gateway)",
    company: "Razorpay",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    companyWebsite: "https://razorpay.com",
    applyUrl: "https://www.linkedin.com/company/razorpay/jobs/",
    location: "Bangalore, Karnataka (Koramangala)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹26,00,000 LPA + RZOPs",
    minutesAgo: 25,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 190,
    tags: ["Go", "PHP", "Node.js", "MySQL", "Kafka", "AWS", "Payments"],
    description: "Razorpay powers digital payments for millions of businesses in India. You will build scalable API services with 99.999% availability handling billions in monthly gross merchandise value.",
    responsibilities: [
      "Build robust, idempotent payment processing APIs in Go and modern frameworks.",
      "Integrate directly with national banking rails (NPCI, UPI, Visa, Mastercard).",
      "Implement real-time fraud mitigation checks and reconciliation algorithms."
    ],
    requirements: [
      "B.E./B.Tech/M.Tech in CS or relevant discipline (0-2 years experience).",
      "Strong fundamentals in object-oriented programming, data structures, and databases.",
      "Experience writing high-throughput RESTful services and SQL optimization."
    ],
    niceToHave: ["Knowledge of payment lifecycle, webhooks, and distributed transaction patterns."],
    benefits: ["Competitive CTC + lucrative RZOPs equity", "Comprehensive medical insurance covering family + parents", "Annual educational stipend and hackathon bonuses"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Startup"
  },
  {
    id: "in-razorpay-intern-blr",
    title: "Software Engineering Intern (Summer / Winter 2026)",
    company: "Razorpay",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    companyWebsite: "https://razorpay.com",
    applyUrl: "https://internshala.com/internships/matching-razorpay-jobs",
    location: "Bangalore, Karnataka",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹45,000 / month + PPO Pathway",
    minutesAgo: 105,
    deadline: "2026 Batch Eligible",
    applicantsCount: 240,
    tags: ["Go", "Python", "JavaScript", "SQL", "Data Structures", "Algorithms"],
    description: "Razorpay's internship gives you the opportunity to work directly on high-scale financial software alongside top industry architects in Koramangala.",
    responsibilities: [
      "Build APIs and developer tooling used by thousands of Indian businesses.",
      "Write unit tests and automate integration pipelines in CI/CD.",
      "Work with senior mentors to design modular, secure software."
    ],
    requirements: [
      "Currently pursuing B.Tech in Computer Science graduating in 2026.",
      "Strong coding skills in C++, Java, Go, or Python.",
      "Sound understanding of data structures, algorithms, and SQL."
    ],
    niceToHave: ["Prior project building full-stack web applications."],
    benefits: ["₹45,000 monthly stipend", "Direct conversion to full-time SDE-1 upon graduation", "Daily meals and modern Mac developer machine"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Startup"
  },
  {
    id: "in-ather-embedded-blr",
    title: "Embedded IoT Software Engineer (Electric Vehicles)",
    company: "Ather Energy",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Ather_Energy_Logo.svg",
    companyWebsite: "https://www.atherenergy.com",
    applyUrl: "https://in.indeed.com/jobs?q=Ather+Energy&l=Bangalore",
    location: "Bangalore, Karnataka (IBC Knowledge Park, Bannerghatta Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Research & Hardware",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹14,00,000 - ₹24,00,000 LPA",
    minutesAgo: 190,
    deadline: "Actively Hiring",
    applicantsCount: 88,
    tags: ["Embedded C", "C++", "RTOS", "CAN Bus", "IoT", "Linux", "ESP32", "ARM"],
    description: "Ather is India's leading intelligent electric scooter manufacturer. You will write firmware and vehicle dashboard software running on Ather's custom vehicle control units and digital touchscreens.",
    responsibilities: [
      "Develop embedded C/C++ firmware for Vehicle Control Units (VCU) and battery management.",
      "Implement robust CAN protocol stacks and sensor telemetry ingestion.",
      "Optimize boot time and power management for Linux/Android vehicle displays."
    ],
    requirements: [
      "B.Tech in ECE, EEE, CSE, or Mechatronics with 1-4 years embedded experience.",
      "Strong proficiency in Embedded C/C++, FreeRTOS, and microcontrollers (ARM Cortex).",
      "Hands-on experience with hardware communication protocols: CAN, SPI, I2C, UART."
    ],
    niceToHave: ["Automotive standards familiarity (MISRA C, ISO 26262 functional safety)."],
    benefits: ["Competitive salary + ESOPs", "Discounts on Ather 450X electric smart scooters", "Comprehensive family insurance and on-site testing tracks"],
    featured: false,
    urgentHiring: false,
    sourcePlatform: "Indeed",
    companyType: "Startup"
  },
  {
    id: "in-ather-intern-blr",
    title: "IoT & Telematics Software Intern",
    company: "Ather Energy",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Ather_Energy_Logo.svg",
    companyWebsite: "https://www.atherenergy.com",
    applyUrl: "https://internshala.com/internships/matching-ather-jobs",
    location: "Bangalore, Karnataka (Bannerghatta Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Research & Hardware",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹30,000 - ₹40,000 / month",
    minutesAgo: 70,
    deadline: "2026 Batch Eligible",
    applicantsCount: 110,
    tags: ["Embedded C", "Python", "MQTT", "IoT", "ESP32", "Sensors"],
    description: "Get hands-on hardware and firmware development experience building IoT cloud connectors and battery diagnostic tools for intelligent EVs.",
    responsibilities: [
      "Prototype sensor monitoring routines using microcontrollers (ESP32/STM32).",
      "Write Python telemetry parsing scripts communicating via MQTT and WebSockets.",
      "Assist hardware validation engineers during bench testing and stress analysis."
    ],
    requirements: [
      "Students in ECE, EEE, CSE, or Instrumentation graduating in 2026/2027.",
      "Hands-on experience with microcontroller programming in C/C++ and Python.",
      "Familiarity with basic lab equipment (oscilloscopes, multimeters, logic analyzers)."
    ],
    niceToHave: ["Prior college projects in IoT, robotics, or automotive telemetry."],
    benefits: ["Stipend up to ₹40,000/month", "Experience working with production electric vehicle hardware", "Opportunity for full-time conversion"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Startup"
  },

  // ==========================================
  // 2. AI, GENAI & DEEPTECH STARTUPS (INDIA)
  // ==========================================
  {
    id: "in-sarvam-ai-sde-blr",
    title: "Generative AI Research & Systems Engineer",
    company: "Sarvam AI",
    companyLogo: "https://images.seeklogo.com/logo-png/52/1/sarvam-ai-logo-png_seeklogo-526487.png",
    companyWebsite: "https://www.sarvam.ai",
    applyUrl: "https://www.linkedin.com/company/sarvam-ai/jobs/",
    location: "Bangalore, Karnataka (Indiranagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "AI & Machine Learning",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹24,00,000 - ₹40,00,000 LPA + Early Equity",
    minutesAgo: 12,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 175,
    tags: ["PyTorch", "Python", "CUDA", "LLMs", "vLLM", "Hugging Face", "Generative AI"],
    description: "Sarvam AI is building foundational artificial intelligence models and high-performance speech/language architectures tailored for Indian languages.",
    responsibilities: [
      "Train, fine-tune, and optimize frontier Indic LLMs and voice-to-voice transformer models.",
      "Build high-throughput, low-latency inference pipelines with vLLM, TensorRT-LLM, and Triton.",
      "Optimize CUDA kernels and distributed multi-GPU training clusters (DeepSpeed / Megatron-LM)."
    ],
    requirements: [
      "Bachelor's or Master's in CS, Mathematics, or AI from a recognized institute (0-3 years experience).",
      "Strong programming proficiency in Python and deep understanding of PyTorch.",
      "Proven understanding of Transformer architectures, attention mechanisms, and tokenization."
    ],
    niceToHave: ["Published papers in NeurIPS, ICML, ACL, EMNLP, or top GitHub open-source AI repos."],
    benefits: ["Top-of-market compensation with high-upside equity in India's leading AI lab", "Access to massive GPU compute clusters (H100/A100)", "Collaborate directly with top AI scientists"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "AI Startup"
  },
  {
    id: "in-sarvam-ai-intern-blr",
    title: "AI Research & LLM Engineering Intern",
    company: "Sarvam AI",
    companyLogo: "https://images.seeklogo.com/logo-png/52/1/sarvam-ai-logo-png_seeklogo-526487.png",
    companyWebsite: "https://www.sarvam.ai",
    applyUrl: "https://wellfound.com/company/sarvam-ai/jobs",
    location: "Bangalore, Karnataka (Indiranagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "AI & Machine Learning",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹60,000 - ₹80,000 / month",
    minutesAgo: 50,
    deadline: "2026 Batch Eligible",
    applicantsCount: 230,
    tags: ["Python", "PyTorch", "NLP", "LLMs", "Transformers", "Data Engineering"],
    description: "Contribute to breakthrough research in Indic voice intelligence, multi-modal LLM reasoning, and real-time translation.",
    responsibilities: [
      "Assist in training, evaluating, and benchmarking multilingual language models.",
      "Curate, clean, and process massive synthetic and open-domain Indic language corpora.",
      "Run evaluation benchmarks analyzing perplexity, hallucination rates, and inference speed."
    ],
    requirements: [
      "B.Tech / M.Tech / MS students in CS or Data Science graduating in 2026.",
      "Strong Python coding ability and solid familiarity with PyTorch or JAX.",
      "Understanding of modern generative AI techniques and prompt engineering."
    ],
    niceToHave: ["Familiarity with Hugging Face transformers and datasets."],
    benefits: ["₹60,000 - ₹80,000 monthly stipend", "Direct exposure to state-of-the-art GPU clusters", "Full-time PPO opportunity"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Wellfound",
    companyType: "AI Startup"
  },
  {
    id: "in-krutrim-ai-infra-blr",
    title: "AI Cloud Infrastructure Engineer",
    company: "Krutrim (Ola AI)",
    companyLogo: "https://images.seeklogo.com/logo-png/52/2/krutrim-logo-png_seeklogo-526702.png",
    companyWebsite: "https://www.krutrim.com",
    applyUrl: "https://www.naukri.com/krutrim-ai-jobs",
    location: "Bangalore, Karnataka (Koramangala)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Cloud & DevOps",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹28,00,000 LPA",
    minutesAgo: 85,
    deadline: "Actively Hiring",
    applicantsCount: 95,
    tags: ["Kubernetes", "Linux", "Docker", "Python", "GPU Clusters", "Terraform", "Cloud Infra"],
    description: "Krutrim is building India's sovereign AI cloud and silicon. You will manage large-scale GPU orchestration, automated failover pipelines, and inference server scaling.",
    responsibilities: [
      "Deploy and manage Kubernetes clusters tuned for multi-node GPU training.",
      "Monitor cluster telemetry, network bottlenecks, and GPU utilization metrics.",
      "Automate infrastructure provisioning using Terraform and Ansible."
    ],
    requirements: [
      "0-2 years experience with Linux systems administration, Docker, and Kubernetes.",
      "Proficient in Python or Go for infrastructure automation scripting.",
      "B.E./B.Tech in Computer Science or related degree."
    ],
    niceToHave: ["Familiarity with NVIDIA GPU drivers, NCCL, and Slurm workload manager."],
    benefits: ["Competitive compensation + equity in Krutrim", "Comprehensive family insurance", "Opportunity to work on India's sovereign AI cloud"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "AI Startup"
  },
  {
    id: "in-yellow-ai-python-blr",
    title: "Conversational AI Platform Engineer (Python / FastAPI)",
    company: "Yellow.ai",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Yellow.ai_Logo.png",
    companyWebsite: "https://yellow.ai",
    applyUrl: "https://www.linkedin.com/company/yellowdotai/jobs/",
    location: "Bangalore, Karnataka (Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹15,00,000 - ₹22,00,000 LPA",
    minutesAgo: 140,
    deadline: "Actively Hiring",
    applicantsCount: 130,
    tags: ["Python", "FastAPI", "LangChain", "OpenAI / Gemini APIs", "MongoDB", "Redis"],
    description: "Yellow.ai powers automated AI customer interactions for leading global enterprises. Build generative AI agent orchestration engines, multi-turn dialog handlers, and enterprise RAG pipelines.",
    responsibilities: [
      "Develop low-latency REST and WebSocket services using Python and FastAPI.",
      "Implement Retrieval-Augmented Generation (RAG) pipelines using vector databases.",
      "Integrate enterprise CRM systems (Salesforce, Zendesk) with conversational bots."
    ],
    requirements: [
      "0-2 years professional or strong project experience with Python and web frameworks.",
      "Familiarity with LLMs, prompt engineering, and vector databases (Pinecone / Chroma / Milvus).",
      "Strong debugging and API design skills."
    ],
    niceToHave: ["Experience deploying services with Docker and AWS."],
    benefits: ["Flexible hybrid schedule (2 days office)", "Health insurance with mental wellness support", "Annual tech gadget allowance"],
    featured: false,
    urgentHiring: false,
    sourcePlatform: "LinkedIn",
    companyType: "AI Startup"
  },

  // ==========================================
  // 3. SAAS & MID-SIZE PRODUCT COMPANIES (INDIA)
  // ==========================================
  {
    id: "in-zoho-dev-chennai-blr",
    title: "Software Developer (Core Web / Cloud Applications)",
    company: "Zoho Corporation",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Zoho_Corporation_logo.svg",
    companyWebsite: "https://www.zoho.com",
    applyUrl: "https://www.naukri.com/zoho-jobs-in-chennai-bangalore",
    location: "Chennai / Bangalore / Tenkasi / Salem",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹8,50,000 - ₹14,00,000 LPA + Performance Bonus",
    minutesAgo: 22,
    deadline: "Actively Hiring (Freshers & 0-2 Years)",
    applicantsCount: 420,
    tags: ["Java", "JavaScript", "C++", "Data Structures", "Algorithms", "Web Technologies"],
    description: "Zoho is India's iconic bootstrapped SaaS multinational serving over 100M users. You will engineer software from scratch without external dependencies, with strong emphasis on algorithmic craftsmanship.",
    responsibilities: [
      "Develop robust enterprise features for Zoho CRM, Zoho Desk, or Zoho Creator.",
      "Write high-efficiency server-side code in Java or C++.",
      "Optimize client-side web interactions with native JavaScript and HTML5."
    ],
    requirements: [
      "B.E./B.Tech/BCA/MCA (2024, 2025, or 2026 Batch). No strict CGPA cutoffs.",
      "Solid problem-solving ability in C, C++, or Java.",
      "Deep understanding of data structures, sorting, searching, and memory management."
    ],
    niceToHave: ["Enthusiasm for building software from scratch without excessive frameworks."],
    benefits: ["Zero-debt, employee-centric work culture with no micro-management", "Free healthy campus meals and state-of-the-art sports facilities", "Annual company bonus and complete healthcare"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "Product Scaleup"
  },
  {
    id: "in-freshworks-sde-blr",
    title: "SDE - 1 (Customer Engagement Platform)",
    company: "Freshworks",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Freshworks_Logo.png",
    companyWebsite: "https://www.freshworks.com",
    applyUrl: "https://www.linkedin.com/company/freshworks-inc/jobs/",
    location: "Bangalore, Karnataka / Chennai",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Full Stack",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹14,00,000 - ₹20,00,000 LPA + RSUs",
    minutesAgo: 95,
    deadline: "Actively Hiring",
    applicantsCount: 160,
    tags: ["Ruby on Rails", "Java", "React", "TypeScript", "AWS", "MySQL"],
    description: "Freshworks makes intuitive software that teams love. You will build user-delighting features on Freshdesk and Freshchat, serving 65,000+ businesses globally.",
    responsibilities: [
      "Write modular backend services in Ruby on Rails or Java.",
      "Create responsive frontend interfaces in React and Ember.js.",
      "Collaborate in cross-functional agile sprints with global product teams."
    ],
    requirements: [
      "B.Tech/B.E. in Computer Science or related degree (0-2 years experience).",
      "Proficient in at least one modern language: Java, Ruby, Python, or TypeScript.",
      "Good foundation in relational databases, HTTP protocols, and REST APIs."
    ],
    niceToHave: ["Familiarity with cloud platforms (AWS) and serverless functions."],
    benefits: ["NASDAQ-listed company stock units (RSUs)", "Comprehensive healthcare plan for employee and family", "Modern office spaces with gaming and relaxation hubs"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Product Scaleup"
  },
  {
    id: "in-freshworks-intern-blr",
    title: "Product Development Intern (2026 Batch)",
    company: "Freshworks",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Freshworks_Logo.png",
    companyWebsite: "https://www.freshworks.com",
    applyUrl: "https://internshala.com/internships/matching-freshworks-jobs",
    location: "Bangalore, Karnataka / Chennai",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹35,000 - ₹45,000 / month",
    minutesAgo: 65,
    deadline: "2026 Batch Eligible",
    applicantsCount: 290,
    tags: ["Java", "Python", "JavaScript", "React", "SQL", "Data Structures"],
    description: "Freshworks' student internship offers structured mentoring, live code shipping, and a proven track record of converting interns to full-time SDEs.",
    responsibilities: [
      "Develop and test modular software components under a dedicated engineering mentor.",
      "Participate in daily agile stand-ups, code reviews, and technical demos.",
      "Solve algorithmic performance bottlenecks in internal tools."
    ],
    requirements: [
      "B.Tech / B.E. student graduating in 2026.",
      "Strong foundation in OOP, data structures, and algorithms.",
      "Eager to learn modern web and cloud technologies."
    ],
    niceToHave: ["Previous hackathon participation or campus technical club projects."],
    benefits: ["Competitive monthly stipend", "Direct PPO conversion opportunity", "Free office meals and campus transport"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Product Scaleup"
  },
  {
    id: "in-browserstack-sde-blr",
    title: "Software Engineer, Distributed Cloud Grid",
    company: "BrowserStack",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/1/18/BrowserStack_Logo.svg",
    companyWebsite: "https://www.browserstack.com",
    applyUrl: "https://in.indeed.com/jobs?q=BrowserStack&l=Bangalore",
    location: "Bangalore, Karnataka / Mumbai / Remote",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Remote",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹28,00,000 LPA + Bonuses",
    minutesAgo: 160,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 145,
    tags: ["Node.js", "Ruby", "C++", "Linux", "Docker", "Distributed Systems"],
    description: "BrowserStack operates the world's largest cloud testing platform with 2M+ daily tests across real devices and browsers. You will build high-concurrency virtualized execution grids.",
    responsibilities: [
      "Architect device virtualization and real-time remote browser streaming infrastructure.",
      "Optimize low-latency video streaming algorithms and device control WebSockets.",
      "Ensure 99.99% availability across global data centers in US, EU, and Asia."
    ],
    requirements: [
      "B.E./B.Tech in Computer Science or related degree (0-3 years experience).",
      "Strong understanding of operating systems, networking, multithreading, and sockets.",
      "Proficient in Node.js, C++, Python, or Ruby."
    ],
    niceToHave: ["Familiarity with WebRTC, video encoders, or mobile virtualization (Android/iOS)."],
    benefits: ["100% Remote-first work culture across India", "Annual tech & home workstation stipend", "Premium wellness and comprehensive medical coverage"],
    featured: true,
    urgentHiring: false,
    sourcePlatform: "Indeed",
    companyType: "Product Scaleup"
  },
  {
    id: "in-postman-api-blr",
    title: "Software Engineer - API Platform & Network",
    company: "Postman",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Postman_%28software%29_logo.png",
    companyWebsite: "https://www.postman.com",
    applyUrl: "https://www.linkedin.com/company/postman-platform/jobs/",
    location: "Bangalore, Karnataka (Indiranagar) / Remote",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹24,00,000 - ₹38,00,000 LPA + Stock Options",
    minutesAgo: 115,
    deadline: "Actively Hiring",
    applicantsCount: 170,
    tags: ["Node.js", "React", "TypeScript", "HTTP/REST", "GraphQL", "WebSockets", "Electron"],
    description: "Over 35 million developers worldwide rely on Postman to design, test, and document APIs. Build foundational developer tools and collaborative workspace features.",
    responsibilities: [
      "Build developer-friendly API testing and mocking engines.",
      "Develop real-time collaborative features in Postman's desktop app (Electron) and web client.",
      "Optimize network request execution engines supporting HTTP/2, HTTP/3, and gRPC."
    ],
    requirements: [
      "2-4 years of software development experience with JavaScript, TypeScript, and Node.js.",
      "Deep understanding of web standards, HTTP specifications, and RESTful paradigms.",
      "Passionate about developer experience and productivity tooling."
    ],
    niceToHave: ["Experience building open source libraries or developer tools."],
    benefits: ["High-impact equity in world's leading API platform", "Generous remote workspace and education allowance", "Unlimited PTO and inclusive global culture"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Product Scaleup"
  },

  // ==========================================
  // 4. PREMIER IT & TECH SERVICES (OFF-CAMPUS / FRESHERS)
  // ==========================================
  {
    id: "in-tcs-digital-blr",
    title: "Full Stack Engineer (TCS Digital / Innovator Cadre)",
    company: "Tata Consultancy Services (TCS)",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    companyWebsite: "https://www.tcs.com",
    applyUrl: "https://www.naukri.com/tcs-digital-jobs-in-bangalore",
    location: "Bangalore, Karnataka (Whitefield / Electronic City)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹7,20,000 - ₹9,50,000 LPA + Joining Incentive",
    minutesAgo: 30,
    deadline: "Actively Hiring (2024, 2025, 2026 Batches)",
    applicantsCount: 540,
    tags: ["Java", "Spring Boot", "React", "Python", "Cloud (AWS/Azure)", "SQL"],
    description: "TCS Digital is the premier technology cadre within TCS, focusing on cutting-edge digital transformation, cloud migrations, and full-stack systems for global Fortune 500 clients.",
    responsibilities: [
      "Design and implement responsive web applications and REST APIs.",
      "Work on enterprise cloud modernization projects using Spring Boot and React.",
      "Collaborate with agile delivery teams and participate in automated testing."
    ],
    requirements: [
      "B.E./B.Tech/M.E./M.Tech/MCA in any engineering discipline (60%+ throughout academics).",
      "Proficient in Java, Python, or C++ with strong algorithmic thinking.",
      "Knowledge of database basics and modern web concepts."
    ],
    niceToHave: ["Cloud certifications (AWS Certified Cloud Practitioner, Azure Fundamentals)."],
    benefits: ["Accelerated career progression in Digital/Innovator track", "Global project deployment opportunities", "TCS corporate healthcare and pension fund"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "Tech Services"
  },
  {
    id: "in-infosys-specialist-blr",
    title: "Specialist Programmer (Digital Specialist Engineer)",
    company: "Infosys",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    companyWebsite: "https://www.infosys.com",
    applyUrl: "https://in.indeed.com/jobs?q=Infosys+Specialist+Programmer&l=Bangalore",
    location: "Bangalore, Karnataka (Electronic City Campus)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹9,50,000 - ₹12,00,000 LPA",
    minutesAgo: 55,
    deadline: "Actively Hiring (2025 & 2026 Batches)",
    applicantsCount: 380,
    tags: ["Python", "Java", "Data Structures", "Algorithms", "AI", "Cloud"],
    description: "The Specialist Programmer (SP) role is Infosys's elite technical band for high-caliber coders. Work directly on deep technical problems, generative AI pilots, and complex cloud architectures.",
    responsibilities: [
      "Solve advanced algorithmic and architectural challenges in mission-critical applications.",
      "Build prototypes leveraging generative AI, computer vision, or cloud-native frameworks.",
      "Lead technical design reviews and guide junior associates."
    ],
    requirements: [
      "B.Tech / M.Tech in CS, IT, or related technical branches (Freshers & 0-2 years).",
      "Demonstrated excellence in competitive programming (LeetCode, CodeChef, HackerRank).",
      "Deep expertise in data structures, dynamic programming, and algorithm design."
    ],
    niceToHave: ["Certifications in Deep Learning, AWS, or Google Cloud."],
    benefits: ["Elite compensation band (nearly 3x standard fresher packages)", "World-renowned Infosys Electronic City green campus with sports arena", "Corporate transport across Bangalore and family health insurance"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Indeed",
    companyType: "Tech Services"
  },
  {
    id: "in-wipro-turbo-blr",
    title: "Turbo Software Developer (Full Stack & Cloud)",
    company: "Wipro",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    companyWebsite: "https://www.wipro.com",
    applyUrl: "https://www.foundit.in/srp/results?query=Wipro+Turbo+Developer",
    location: "Bangalore, Karnataka (Sarjapur Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹6,50,000 - ₹8,50,000 LPA",
    minutesAgo: 145,
    deadline: "Actively Hiring (Freshers)",
    applicantsCount: 290,
    tags: ["Java", "Spring", "Angular / React", "Microservices", "PostgreSQL"],
    description: "Wipro Turbo hires the top percentile of campus engineers for accelerated technical roles across Cloud, Full Stack, and Cybersecurity domains.",
    responsibilities: [
      "Develop enterprise Java/Spring microservices and modular UI components.",
      "Participate in sprint planning, code review sessions, and automated build pipelines.",
      "Troubleshoot performance bottlenecks and write integration tests."
    ],
    requirements: [
      "B.Tech / B.E. (CSE, ISE, ECE) graduating in 2024, 2025, or 2026.",
      "Strong fundamentals in Java, C++, or Python with object-oriented software design.",
      "Minimum 60% academic criteria throughout 10th, 12th, and graduation."
    ],
    niceToHave: ["Hands-on knowledge of Docker, Git, and REST APIs."],
    benefits: ["Accelerated appraisal cycles for Turbo tier performers", "Comprehensive medical insurance and tuition assistance", "Sarjapur Rd campus with fitness center and dining courts"],
    featured: false,
    urgentHiring: false,
    sourcePlatform: "Monster/Foundit",
    companyType: "Tech Services"
  },
  {
    id: "in-accenture-advanced-blr",
    title: "Advanced Application Engineering Analyst",
    company: "Accenture India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
    companyWebsite: "https://www.accenture.com",
    applyUrl: "https://www.naukri.com/accenture-advanced-application-engineering-jobs",
    location: "Bangalore, Karnataka (Whitefield / Bannerghatta)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹6,50,000 - ₹9,90,000 LPA + Joining Bonus",
    minutesAgo: 48,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 310,
    tags: ["Java", "Python", "React", "Spring Boot", "Cloud Native", "DevOps"],
    description: "Work in Accenture Advanced Technology Centers in India (ATCI). You will design, develop, and deploy enterprise applications for Fortune 500 leaders worldwide.",
    responsibilities: [
      "Build full stack web applications using Java, Spring Boot, and modern JavaScript.",
      "Implement automated CI/CD deployment pipelines on Azure/AWS.",
      "Collaborate with international client teams and resolve production issues."
    ],
    requirements: [
      "B.E./B.Tech in all engineering branches (Freshers to 2 years experience).",
      "Good communication skills and problem-solving mindset.",
      "Knowledge of at least one programming language and database basics."
    ],
    niceToHave: ["Familiarity with Agile methodologies and Git version control."],
    benefits: ["Structured onboarding and technical training bootcamps", "Annual performance incentives and comprehensive health insurance", "Flexible working model with transport support"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Naukri",
    companyType: "Tech Services"
  },

  // ==========================================
  // 5. GLOBAL TECH LEADERS & MNC R&D CENTERS
  // ==========================================
  {
    id: "in-google-swe-blr",
    title: "Software Engineer, Core Infrastructure (L3/L4)",
    company: "Google India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    companyWebsite: "https://careers.google.com",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/?location=Bangalore%2C%20Karnataka%2C%20India",
    location: "Bangalore, Karnataka (RMZ Infinity, Old Madras Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹28,00,000 - ₹46,00,000 LPA + GSUs",
    minutesAgo: 35,
    deadline: "Actively Hiring",
    applicantsCount: 210,
    tags: ["C++", "Java", "Python", "Distributed Systems", "Algorithms", "GCP"],
    description: "Google's Bangalore Engineering Center is one of Google's largest development hubs globally. Design, develop, test, and deploy planetary-scale software solutions.",
    responsibilities: [
      "Architect and scale distributed systems serving hundreds of millions of users daily.",
      "Design fault-tolerant APIs and optimize backend service latency (< 50ms).",
      "Collaborate with international engineering teams across Mountain View, Zurich, and Bangalore."
    ],
    requirements: [
      "Bachelor's degree in Computer Science or equivalent practical experience.",
      "2-5 years of professional software development experience in C++, Java, or Python.",
      "Deep understanding of algorithms, data structures, and multi-threaded systems."
    ],
    niceToHave: ["Experience with large-scale distributed storage and RPC frameworks."],
    benefits: ["Top-tier compensation + Google Stock Units (GSUs)", "Comprehensive family health insurance", "Free gourmet meals, campus gym, and transport shuttles"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-google-intern-blr",
    title: "Software Engineering Intern (Summer / Winter 2026)",
    company: "Google India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    companyWebsite: "https://careers.google.com",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineering%20Intern&location=India",
    location: "Bangalore, Karnataka / Hyderabad",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹1,10,000 / month + Housing & Meals",
    minutesAgo: 5,
    deadline: "2026 Internship Cohort (Actively Reviewing)",
    applicantsCount: 420,
    tags: ["C++", "Python", "Java", "Data Structures", "Algorithms"],
    description: "Join Google India's 12-to-14 week technical internship program. Work on real engineering projects under the guidance of a dedicated Google mentor.",
    responsibilities: [
      "Build and test software components that directly ship to Google's global products.",
      "Write clean, well-tested code in C++, Java, or Python.",
      "Participate in design brainstorms, code reviews, and intern tech showcases."
    ],
    requirements: [
      "Enrolled in a Bachelor's or Master's program in Computer Science graduating in 2026 or 2027.",
      "Proficiency in C++, Java, or Python.",
      "Solid knowledge of foundational computer science: data structures, algorithm analysis."
    ],
    niceToHave: ["Top percentile in competitive programming (LeetCode, Codeforces)."],
    benefits: ["Highest-tier intern stipend in India (₹1,10,000/month)", "Fully subsidized corporate accommodation in Bangalore", "Direct pathway for return Pre-Placement Offers (PPOs)"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-microsoft-sde-blr",
    title: "Software Engineer - Azure Cloud Core & Storage",
    company: "Microsoft India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    companyWebsite: "https://careers.microsoft.com",
    applyUrl: "https://careers.microsoft.com/us/en/search-results?q=Software%20Engineer&location=Bengaluru%2C%20Karnataka%2C%20India",
    location: "Bangalore, Karnataka (Outer Ring Road, Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Cloud & DevOps",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹24,00,000 - ₹38,00,000 LPA + MSFT Stock",
    minutesAgo: 60,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 230,
    tags: ["C#", "C++", "Azure", "Distributed Systems", "Cloud Storage", "Kubernetes"],
    description: "Microsoft's India Development Center (IDC) Bangalore builds core components of Microsoft Azure. You will engineer hyper-scale storage and virtualization fabrics.",
    responsibilities: [
      "Build distributed storage and virtualization primitives in C++ and C#.",
      "Diagnose latency regressions and implement automated resiliency checks.",
      "Collaborate with Redmond and Bangalore engineering leads on cloud architecture."
    ],
    requirements: [
      "B.Tech/M.Tech in Computer Science or related degree (0-2 years experience).",
      "Strong programming skills in C++, C#, or Java.",
      "Understanding of multithreading, network programming, and distributed systems."
    ],
    niceToHave: ["Experience with cloud virtualization (Hyper-V/KVM) or Linux kernel."],
    benefits: ["Top compensation + Microsoft Stock Awards", "World-class Bellandur campus with cricket pitch and gym", "Comprehensive family healthcare and wellness reimbursements"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-microsoft-intern-blr",
    title: "Software Engineering Intern (Summer 2026)",
    company: "Microsoft India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    companyWebsite: "https://careers.microsoft.com",
    applyUrl: "https://careers.microsoft.com/us/en/search-results?q=Intern&location=Bengaluru%2C%20Karnataka%2C%20India",
    location: "Bangalore, Karnataka / Hyderabad",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹1,00,000 / month + Free Housing",
    minutesAgo: 15,
    deadline: "2026 Batch Eligible",
    applicantsCount: 360,
    tags: ["C++", "C#", "Python", "Data Structures", "Algorithms", "Azure"],
    description: "Join Microsoft IDC for an impactful 8-to-12 week summer internship. You will design, build, and test features across Windows, Azure, or Office 365.",
    responsibilities: [
      "Design and implement software components under a designated mentor.",
      "Participate in design discussions and write unit tests.",
      "Showcase your summer project to senior engineering leaders."
    ],
    requirements: [
      "Students graduating in 2026 with B.Tech, M.Tech, or Dual Degree in Computer Science.",
      "Solid foundation in algorithms, data structures, and object-oriented programming.",
      "Proficient in C++, C#, Java, or Python."
    ],
    niceToHave: ["High LeetCode rating or active GitHub project contributions."],
    benefits: ["₹1,00,000 monthly stipend", "Company-provided hotel/apartment accommodation", "PPO consideration for full-time Software Engineer"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-amazon-sde1-blr",
    title: "Software Development Engineer (SDE - 1)",
    company: "Amazon India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    companyWebsite: "https://www.amazon.jobs",
    applyUrl: "https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer&loc_query=Bengaluru%2C+Karnataka%2C+India",
    location: "Bangalore, Karnataka (Brigade Gateway, Rajajinagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹22,00,000 - ₹34,00,000 LPA + Amazon RSUs",
    minutesAgo: 45,
    deadline: "Actively Hiring (Immediate Joiners)",
    applicantsCount: 340,
    tags: ["Java", "C++", "AWS", "DynamoDB", "Distributed Systems", "Object Oriented Design"],
    description: "Amazon India Development Center is hiring SDE-1s across Amazon Web Services (AWS), Retail, and Logistics technology teams.",
    responsibilities: [
      "Design, implement, and maintain service-oriented microservices.",
      "Operate systems in production, monitor service health, and reduce operational load.",
      "Write secure, high-performance code adhering to Amazon leadership principles."
    ],
    requirements: [
      "Bachelor's or Master's degree in CS, Computer Engineering, or related field.",
      "0-2 years software development experience in Java, C++, or Go.",
      "Solid knowledge of CS fundamentals, data structures, and algorithm complexity."
    ],
    niceToHave: ["Hands-on experience with AWS services (EC2, S3, DynamoDB, Lambda)."],
    benefits: ["Competitive compensation + front-loaded signing bonuses + RSUs", "Comprehensive healthcare covering self, spouse, children, and parents", "World Trade Center Bangalore office with state-of-the-art facilities"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-atlassian-sde-blr",
    title: "Software Engineer (Jira Cloud Ecosystem)",
    company: "Atlassian",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian-Logo.svg",
    companyWebsite: "https://www.atlassian.com",
    applyUrl: "https://www.linkedin.com/company/atlassian/jobs/",
    location: "Bangalore, Karnataka / Remote (Work from Anywhere India)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Remote",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹24,00,000 - ₹36,00,000 LPA + RSUs",
    minutesAgo: 80,
    deadline: "Actively Hiring",
    applicantsCount: 190,
    tags: ["Java", "Kotlin", "React", "AWS", "Microservices", "GraphQL"],
    description: "Atlassian builds team collaboration software used by over 300,000 companies. Work in Atlassian's 'Team Anywhere' model on Jira Cloud, Confluence, and Loom.",
    responsibilities: [
      "Build scalable, resilient microservices in Java and Kotlin deployed on AWS.",
      "Participate in full lifecycle software development from inception to monitoring in production.",
      "Advocate for code quality, architectural elegance, and test automation."
    ],
    requirements: [
      "B.Tech in Computer Science or related degree (0-2 years experience).",
      "Proficient in Java, Kotlin, or TypeScript with strong OOP design principles.",
      "Understanding of REST, distributed caching, and relational databases."
    ],
    niceToHave: ["Familiarity with event-driven architectures and GraphQL."],
    benefits: ["Work from Anywhere in India policy", "Generous home office setup and ergonomics budget", "Annual education stipend and wellness allowance"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-uber-sde-blr",
    title: "Software Engineer - Mobility & Rider Marketplace",
    company: "Uber",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    companyWebsite: "https://www.uber.com",
    applyUrl: "https://www.uber.com/in/en/careers/list/",
    location: "Bangalore, Karnataka (Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹26,00,000 - ₹40,00,000 LPA + Uber RSUs",
    minutesAgo: 100,
    deadline: "Actively Hiring",
    applicantsCount: 215,
    tags: ["Go", "Java", "Kafka", "Cassandra", "Microservices", "Distributed Systems"],
    description: "Uber's Bangalore Tech Center builds critical platforms powering global mobility, dynamic pricing, and marketplace dispatch in hundreds of cities worldwide.",
    responsibilities: [
      "Develop high-throughput, low-latency microservices in Go and Java.",
      "Build real-time event processing pipelines on Apache Kafka and Apache Flink.",
      "Architect resilient multi-datacenter data storage on Cassandra and MySQL."
    ],
    requirements: [
      "B.Tech/M.Tech in CS or related degree (0-2 years experience).",
      "Strong foundation in algorithms, data structures, and concurrent programming.",
      "Experience writing performant network services in Go, Java, or C++."
    ],
    niceToHave: ["Experience with large-scale distributed systems and telemetry."],
    benefits: ["Top-tier market compensation + Uber equity", "Free Uber rides credits monthly", "Bangalore campus with barista cafes and wellness amenities"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-adobe-swe-blr",
    title: "Software Engineer (Creative Cloud & GenAI Platform)",
    company: "Adobe India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg",
    companyWebsite: "https://www.adobe.com",
    applyUrl: "https://in.indeed.com/jobs?q=Adobe&l=Bangalore",
    location: "Bangalore, Karnataka / Noida",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹22,00,000 - ₹34,00,000 LPA + Adobe RSUs",
    minutesAgo: 125,
    deadline: "Actively Hiring",
    applicantsCount: 185,
    tags: ["C++", "JavaScript", "Python", "Computer Graphics", "Generative AI", "WebAssembly"],
    description: "Adobe India is home to some of Adobe's most important product engineering initiatives, including Adobe Firefly generative AI, Photoshop on the Web, and Acrobat.",
    responsibilities: [
      "Develop high-performance rendering engines and web tools in C++, WebAssembly, and TypeScript.",
      "Integrate Adobe Firefly generative AI capabilities into flagship desktop and web apps.",
      "Collaborate with research scientists to convert algorithms into production code."
    ],
    requirements: [
      "B.Tech/M.Tech in Computer Science or related degree (0-2 years experience).",
      "Proficient in C++ or modern JavaScript/TypeScript with strong algorithmic foundations.",
      "Good understanding of memory management, OOP, and data structures."
    ],
    niceToHave: ["Familiarity with WebAssembly, WebGL, or computer graphics."],
    benefits: ["Lucrative Adobe RSUs and annual bonus", "Comprehensive medical and wellness coverage", "World-class campus with gymnasium and cafeteria"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "Indeed",
    companyType: "Enterprise"
  },
  {
    id: "in-walmart-sde-blr",
    title: "Software Development Engineer (E-Commerce Platform)",
    company: "Walmart Global Tech India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
    companyWebsite: "https://careers.walmart.com",
    applyUrl: "https://www.linkedin.com/company/walmartglobaltechindia/jobs/",
    location: "Bangalore, Karnataka (EcoWorld, Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹18,00,000 - ₹26,00,000 LPA + Annual Bonus",
    minutesAgo: 170,
    deadline: "Actively Hiring",
    applicantsCount: 220,
    tags: ["Java", "Spring Boot", "Kafka", "Cloud", "Kubernetes", "Cassandra"],
    description: "Walmart Global Tech India designs, develops, and delivers next-generation retail technology for the world's largest omni-channel retailer.",
    responsibilities: [
      "Build high-throughput microservices handling millions of daily retail transactions.",
      "Optimize checkout, inventory forecasting, and real-time order tracking pipelines.",
      "Participate in design reviews and implement automated CI/CD testing."
    ],
    requirements: [
      "B.Tech in CS or relevant discipline (0-2 years experience).",
      "Strong coding abilities in Java with Spring Boot framework.",
      "Solid knowledge of databases (MySQL/Cassandra) and messaging systems (Kafka)."
    ],
    niceToHave: ["Experience with cloud native services on Azure or GCP."],
    benefits: ["Attractive compensation and performance incentives", "Medical insurance covering parents and in-laws", "EcoWorld Bellandur modern campus with state-of-the-art facilities"],
    featured: false,
    urgentHiring: true,
    sourcePlatform: "LinkedIn",
    companyType: "Enterprise"
  },
  {
    id: "in-paypal-intern-blr",
    title: "Software Engineering Intern (Summer 2026)",
    company: "PayPal India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    companyWebsite: "https://careers.pypl.com",
    applyUrl: "https://internshala.com/internships/matching-paypal-jobs",
    location: "Bangalore, Karnataka / Chennai",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹65,000 / month + Housing Allowance",
    minutesAgo: 40,
    deadline: "2026 Batch Eligible",
    applicantsCount: 310,
    tags: ["Java", "Node.js", "Python", "Data Structures", "Security", "Fintech"],
    description: "Join PayPal India's university internship program. Work on mission-critical payments, compliance systems, and developer experience tools.",
    responsibilities: [
      "Develop backend services and unit tests under guidance of senior architects.",
      "Participate in intern hackathons, tech talks, and project presentations.",
      "Contribute to live production features adhering to PCI-DSS standards."
    ],
    requirements: [
      "Students graduating in 2026 with B.Tech/M.Tech in CS or related fields.",
      "Strong skills in Java, Python, or C++ with solid understanding of data structures.",
      "Good communication and collaborative problem-solving skills."
    ],
    niceToHave: ["Familiarity with REST APIs and basic cloud concepts."],
    benefits: ["₹65,000 monthly stipend + housing support", "Direct Pre-Placement Offer (PPO) pathway", "Free corporate transport and gourmet cafeteria"],
    featured: true,
    urgentHiring: true,
    sourcePlatform: "Internshala",
    companyType: "Enterprise"
  }
]

/**
 * Returns all active tech jobs and internships with dynamically computed
 * fresh posting times and valid active deadlines.
 */
export function getAllSeedJobs(): JobOpening[] {
  const now = Date.now()

  return RAW_JOBS.map((raw, index) => {
    // Dynamically calculate postedDate so jobs are always fresh (within last 10m - 48h)
    const minutes = raw.minutesAgo || ((index * 25 + 15) % (48 * 60))
    const postedDate = new Date(now - minutes * 60 * 1000).toISOString()
    const postedAt = formatPostedAt(minutes)

    const { minutesAgo, ...jobProps } = raw

    return {
      ...jobProps,
      postedDate,
      postedAt,
      // Ensure deadline is always active and never expired
      deadline: raw.deadline || (raw.jobType === "Internship" ? "2026 Cohort (Actively Reviewing)" : "Actively Hiring (Rolling Applications)")
    }
  })
}

export default {
  getAllSeedJobs
}

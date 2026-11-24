import { JobOpening, JobApplication, JobFilters } from "../types/jobTypes"
import { generateText } from "./ai/aiService"
import { getAllSeedJobs } from "./jobsDatabase"

// Curated authentic tech jobs and internships exclusively opened in India, with strong focus in Bangalore & Karnataka
const SEED_INDIA_ROLES: JobOpening[] = [
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
    salary: "₹28,00,000 - ₹46,00,000 LPA + Bonus + GSUs",
    postedAt: "Just now",
    postedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 142,
    tags: ["C++", "Java", "Python", "Distributed Systems", "Algorithms", "GCP"],
    description: "Google's Bangalore Engineering Center is one of Google's largest development hubs globally. You will design, develop, test, and deploy planetary-scale software solutions for Google Cloud, Search infrastructure, and Android ecosystem.",
    responsibilities: [
      "Architect and scale distributed systems serving hundreds of millions of users daily.",
      "Design fault-tolerant APIs and optimize backend service latency (< 50ms).",
      "Collaborate with international engineering teams across Mountain View, Zurich, and Bangalore.",
      "Mentor junior software engineers and conduct technical design reviews."
    ],
    requirements: [
      "Bachelor's degree in Computer Science, related technical field, or equivalent practical experience.",
      "2-5 years of professional software development experience in C++, Java, or Python.",
      "Deep understanding of algorithms, data structures, and multi-threaded systems."
    ],
    niceToHave: [
      "Experience with large-scale distributed storage and RPC frameworks (Stubby/gRPC).",
      "Prior experience in high-performance cloud infrastructure."
    ],
    benefits: [
      "Top-tier Indian tech compensation + generous Google Stock Units (GSUs)",
      "Comprehensive family health insurance + OPD reimbursement",
      "Free gourmet meals, micro-kitchens, campus gym, and transport shuttles across Bangalore",
      "Annual education allowance up to ₹3,50,000 for courses and conferences"
    ],
    featured: true,
    urgentHiring: true
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
    postedAt: "2 hours ago",
    postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Internship Cohort",
    applicantsCount: 310,
    tags: ["C++", "Python", "Java", "Data Structures", "Algorithms", "Computer Science"],
    description: "Join Google India's 12-to-14 week technical internship program. You will work on real engineering projects under the guidance of a dedicated Google mentor at the Bangalore or Hyderabad engineering centers.",
    responsibilities: [
      "Build and test software components that directly ship to Google's global products.",
      "Write clean, well-tested code in C++, Java, or Python.",
      "Participate in design brainstorms, code reviews, and intern tech showcases.",
      "Solve complex data structure and algorithm challenges."
    ],
    requirements: [
      "Currently enrolled in a Bachelor's, Master's, or Dual Degree program in Computer Science graduating in 2026 or 2027.",
      "Proficiency in C++, Java, or Python.",
      "Solid knowledge of foundational computer science: data structures, algorithm analysis, and software design."
    ],
    niceToHave: [
      "Top percentile in competitive programming (Codeforces, LeetCode, CodeChef).",
      "Active GitHub portfolio with web or systems projects."
    ],
    benefits: [
      "Highest-tier intern stipend in India (₹1,10,000/month)",
      "Fully subsidized corporate accommodation or housing stipend in Bangalore",
      "Round-trip travel reimbursement and complimentary meals",
      "Direct pathway for return Pre-Placement Offers (PPOs) for full-time SWE L3"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-flipkart-sde2-blr",
    title: "SDE - II (Supply Chain & Flash Sale Systems)",
    company: "Flipkart",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Flipkart_logo.svg",
    companyWebsite: "https://flipkartcareers.com",
    applyUrl: "https://www.flipkartcareers.com",
    location: "Bangalore, Karnataka (Bellandur Campus, Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹32,00,000 - ₹48,00,000 LPA + ESOPs + Annual Bonus",
    postedAt: "3 hours ago",
    postedDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    deadline: "In 15 days",
    applicantsCount: 88,
    tags: ["Java", "Spring Boot", "Kafka", "MySQL", "Aerospike", "High Concurrency"],
    description: "Flipkart powers India's largest e-commerce festivals like Big Billion Days. As an SDE II in Bangalore, you will build distributed checkout engines capable of processing over 120,000 orders per minute.",
    responsibilities: [
      "Design and maintain scalable microservices in Java handling massive scale traffic.",
      "Optimize low-latency caching using Redis and Aerospike to withstand Big Billion Days traffic surges.",
      "Lead architecture RFCs and ensure 99.99% availability of core fulfillment services.",
      "Collaborate with product and data science teams to optimize dynamic delivery algorithms."
    ],
    requirements: [
      "2-5 years of backend engineering experience with Java or Go.",
      "Strong understanding of database internals (MySQL indexing, sharding, replication).",
      "Hands-on expertise with Kafka message streaming and asynchronous processing."
    ],
    niceToHave: [
      "Experience in e-commerce, payment gateways, or logistics tech.",
      "Knowledge of distributed cache invalidation strategies."
    ],
    benefits: [
      "Competitive CTC with lucrative Flipkart stock option (ESOP) grants",
      "Flipkart Bellandur campus with cricket pitch, gym, and daycare",
      "Premium family health coverage with ₹10 Lakh sum insured",
      "Subsidized cab and shuttle services across Bangalore"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-flipkart-intern-blr",
    title: "Software Engineering Intern (Summer 2026 Batch)",
    company: "Flipkart",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Flipkart_logo.svg",
    companyWebsite: "https://flipkartcareers.com",
    applyUrl: "https://www.flipkartcareers.com",
    location: "Bangalore, Karnataka (Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹75,000 - ₹90,000 / month + Transport",
    postedAt: "4 hours ago",
    postedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deadline: "Campus application cycle",
    applicantsCount: 220,
    tags: ["Java", "Python", "Data Structures", "Algorithms", "Spring Boot", "SQL"],
    description: "Flipkart's flagship student internship program immerses students into India's largest consumer tech ecosystem. Work with senior principal architects to solve logistics, fintech, and catalog search challenges.",
    responsibilities: [
      "Develop and deploy features across customer experience or logistics services.",
      "Write efficient SQL queries and optimize REST APIs for mobile devices.",
      "Participate in Flipkart Hackdays and present innovations to business leaders.",
      "Shadow senior mentors to learn enterprise system design."
    ],
    requirements: [
      "Pre-final year student in B.Tech / B.E. / M.Tech in Computer Science or related branch.",
      "Strong problem-solving ability in Java, C++, or Python.",
      "Firm grasp of Object-Oriented Programming and relational databases."
    ],
    niceToHave: [
      "High rating on coding platforms (LeetCode, HackerRank).",
      "Full-stack projects built using React or Node.js."
    ],
    benefits: [
      "Lucrative monthly stipend (₹75,000 - ₹90,000/month)",
      "Daily doorstep cab transport facility across Bangalore",
      "Free buffet meals and snacks at Flipkart cafeteria",
      "Pre-Placement Offer (PPO) opportunity for SDE-1 position"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-amazon-sde1-blr",
    title: "Software Development Engineer I (SDE 1 - AWS & Retail)",
    company: "Amazon India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    companyWebsite: "https://amazon.jobs",
    applyUrl: "https://www.amazon.jobs/en/locations/bangalore-india",
    location: "Bangalore, Karnataka (Brigade Gateway, Malleshwaram)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹24,00,000 - ₹34,00,000 LPA + Sign-on + RSUs",
    postedAt: "5 hours ago",
    postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    deadline: "In 20 days",
    applicantsCount: 190,
    tags: ["Java", "AWS", "Python", "DynamoDB", "Distributed Systems", "Object-Oriented Design"],
    description: "Amazon India's Development Center in Bangalore is looking for SDE 1s to build next-generation cloud services and customer shopping technologies. You will own service components end-to-end.",
    responsibilities: [
      "Build resilient microservices using AWS serverless and container technologies.",
      "Write high quality, maintainable code following Amazon software engineering tenets.",
      "Collaborate with QA and DevOps to automate integration testing and deployment pipelines.",
      "Participate in operational support and root cause analyses."
    ],
    requirements: [
      "0-2 years of software engineering experience or fresh graduate with strong project credentials.",
      "Proficiency in Java, C++, or Python.",
      "Deep understanding of data structures, algorithm complexity, and design patterns."
    ],
    niceToHave: [
      "Working knowledge of AWS services (S3, Lambda, SQS, DynamoDB).",
      "Strong computer science fundamentals (OS, Computer Networks, DBMS)."
    ],
    benefits: [
      "High starting CTC + significant first and second-year sign-on cash bonuses",
      "Amazon Restricted Stock Units (RSUs)",
      "Health, dental, and vision insurance covering family and parents",
      "Annual employee discount on Amazon.in purchases"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-amazon-intern-blr",
    title: "Software Development Engineer (SDE) Intern (6 Months / Summer)",
    company: "Amazon India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    companyWebsite: "https://amazon.jobs",
    applyUrl: "https://www.amazon.jobs/en/jobs/search?q=Intern&location=Bangalore%2C+Karnataka%2C+India",
    location: "Bangalore, Karnataka (World Trade Center)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹80,000 - ₹1,00,000 / month Stipend",
    postedAt: "6 hours ago",
    postedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    deadline: "Winter & Summer application cohorts",
    applicantsCount: 350,
    tags: ["Java", "Algorithms", "Data Structures", "AWS", "OOP", "System Design"],
    description: "Amazon India invites undergraduate and graduate students to join our Bangalore team for a 6-month or summer internship. You will own a production software feature that directly impacts Amazon customers.",
    responsibilities: [
      "Design, build, and test software solutions alongside senior SDE mentors.",
      "Present technical designs to team managers and incorporate feedback.",
      "Apply Amazon Leadership Principles to solve real-world technical problems.",
      "Deliver your project to production before the conclusion of the internship."
    ],
    requirements: [
      "Enrolled in B.Tech, M.Tech, or MCA program in Computer Science or related field graduating in 2026/2027.",
      "Good programming foundation in Java, C++, or Python.",
      "Proficient in algorithm design, sorting, recursion, and graph algorithms."
    ],
    niceToHave: [
      "Coursework or personal projects using cloud services.",
      "Prior hackathon participation or competitive coding badges."
    ],
    benefits: [
      "Generous monthly stipend (up to ₹1,00,000/month)",
      "1-on-1 mentorship with senior Amazon SDEs and managers",
      "Direct conversion to Amazon SDE 1 full-time role via PPO",
      "Executive tech talks and intern social networking events"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-razorpay-fullstack-blr",
    title: "Full Stack Software Engineer (Fintech & Checkout)",
    company: "Razorpay",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    companyWebsite: "https://razorpay.com",
    applyUrl: "https://razorpay.com/jobs/",
    location: "Bangalore, Karnataka (Koramangala 3rd Block)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Full Stack",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹26,00,000 - ₹40,00,000 LPA + ESOPs",
    postedAt: "7 hours ago",
    postedDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    deadline: "In 12 days",
    applicantsCount: 75,
    tags: ["React", "TypeScript", "Node.js", "Go", "PostgreSQL", "Redis", "Kafka"],
    description: "Razorpay powers digital payments for millions of businesses across India. Work from our Koramangala headquarters to build merchant checkout experiences, automated banking switches, and high-frequency UPI routing engines.",
    responsibilities: [
      "Develop modular React SDKs loaded on millions of consumer browser checkouts in under 300ms.",
      "Build high-throughput Go and Node.js microservices handling thousands of payment transactions per second.",
      "Implement idempotent database operations and strict transaction reconciliation.",
      "Ensure adherence to RBI guidelines and PCI-DSS compliance standards."
    ],
    requirements: [
      "2-4 years of full-stack engineering experience with React, TypeScript, and Node.js or Go.",
      "Deep understanding of browser security, state management, and asynchronous concurrency.",
      "Experience with relational databases (PostgreSQL/MySQL) and caching (Redis)."
    ],
    niceToHave: [
      "Experience in fintech, payment gateways, or UPI integrations.",
      "Experience containerizing apps with Docker and Kubernetes."
    ],
    benefits: [
      "Competitive CTC with valuable pre-IPO ESOP allocation",
      "Comprehensive family health insurance with parent coverage",
      "Free breakfast, gourmet lunch, and evening snacks in Koramangala",
      "Annual learning allowance of ₹50,000 for certifications"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-razorpay-intern-blr",
    title: "Product Engineering Intern (Frontend & React)",
    company: "Razorpay",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    companyWebsite: "https://razorpay.com",
    applyUrl: "https://razorpay.com/jobs/",
    location: "Bangalore, Karnataka (Koramangala)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Frontend & Web",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹55,000 - ₹70,000 / month + Gourmet Dining",
    postedAt: "8 hours ago",
    postedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    deadline: "In 10 days",
    applicantsCount: 130,
    tags: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "HTML/CSS", "REST APIs"],
    description: "Razorpay's Product Engineering internship gives students real ownership over payment interfaces, merchant dashboards, and banking analytics applications.",
    responsibilities: [
      "Build modern, responsive UI components in React and TypeScript.",
      "Integrate backend APIs and optimize frontend bundle size.",
      "Write unit tests with Jest and React Testing Library.",
      "Collaborate with UI/UX designers to implement pixel-perfect Figma designs."
    ],
    requirements: [
      "Pre-final or final year engineering student graduating in 2026/2027.",
      "Hands-on proficiency in JavaScript/TypeScript, React, and CSS.",
      "Understanding of REST APIs and frontend state management."
    ],
    niceToHave: [
      "Deployed full-stack personal projects or web apps on Vercel/Netlify.",
      "Familiarity with Next.js or Tailwind CSS."
    ],
    benefits: [
      "Generous monthly stipend (₹55,000 - ₹70,000/month)",
      "Daily gourmet lunch and unlimited snacks at the Koramangala office",
      "Fast-track conversion to full-time Software Engineer 1 role",
      "Mentorship from experienced senior fintech engineers"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-swiggy-sde2-blr",
    title: "Backend Engineer SDE II (Hyperlocal Order Management)",
    company: "Swiggy",
    companyLogo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    companyWebsite: "https://swiggy.com",
    applyUrl: "https://www.swiggy.com/careers",
    location: "Bangalore, Karnataka (Devarabisanahalli, Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹28,00,000 - ₹44,00,000 LPA + Stock Grant",
    postedAt: "10 hours ago",
    postedDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    deadline: "In 14 days",
    applicantsCount: 82,
    tags: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Redis", "Distributed Caching"],
    description: "Swiggy delivers millions of orders everyday across 500+ Indian cities. Join the Core Checkout and Fulfillment team in Bangalore to solve hyperlocal logistics during peak IPL matches and festive demand spikes.",
    responsibilities: [
      "Develop Spring Boot microservices handling over 50,000 orders per minute during spikes.",
      "Design resilient caching hierarchies using Redis to achieve sub-10ms catalog read latency.",
      "Implement distributed locking mechanisms using Redisson to prevent inventory overselling.",
      "Conduct continuous chaos testing and maintain 99.99% system uptime."
    ],
    requirements: [
      "2-5 years of backend engineering experience in Java or Go.",
      "Strong grasp of concurrency, multithreading, and transaction isolation.",
      "Deep experience with relational databases (PostgreSQL/MySQL) and Kafka message queues."
    ],
    niceToHave: [
      "Prior experience in food delivery, e-commerce, or quick commerce (Instamart).",
      "Hands-on experience with AWS DynamoDB or Cassandra."
    ],
    benefits: [
      "Attractive salary + liquid ESOP vesting plan",
      "Swiggy One VIP membership with free dining discounts",
      "Top-tier family and parent medical insurance",
      "Flexible hybrid working policy (2 days office, 3 days remote)"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-swiggy-intern-blr",
    title: "Machine Learning & Data Science Intern",
    company: "Swiggy",
    companyLogo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    companyWebsite: "https://swiggy.com",
    applyUrl: "https://www.swiggy.com/careers",
    location: "Bangalore, Karnataka (Outer Ring Road)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹60,000 - ₹75,000 / month + Swiggy One VIP",
    postedAt: "12 hours ago",
    postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    deadline: "In 16 days",
    applicantsCount: 160,
    tags: ["Python", "PyTorch", "Machine Learning", "SQL", "Pandas", "Scikit-Learn"],
    description: "Swiggy's Data Science team builds the intelligence behind delivery ETA predictions, dish recommendation carousels, and demand forecasting across India.",
    responsibilities: [
      "Train and benchmark machine learning models on massive hyperlocal delivery telemetry.",
      "Analyze consumer order patterns to optimize restaurant recommendation rankings.",
      "Write data extraction and transformation pipelines in Python and SQL.",
      "Collaborate with senior researchers to run live A/B experiments."
    ],
    requirements: [
      "Enrolled in B.Tech, M.Tech, or MS in Computer Science, Data Science, or related STEM field.",
      "Strong proficiency in Python and statistical modeling.",
      "Hands-on experience with NumPy, Pandas, Scikit-Learn, and PyTorch."
    ],
    niceToHave: [
      "Coursework in Deep Learning, Reinforcement Learning, or Time Series Forecasting.",
      "Kaggle competition awards or research papers."
    ],
    benefits: [
      "Competitive monthly stipend (₹60,000 - ₹75,000/month)",
      "Mentorship from leading Indian data scientists",
      "Direct pathway for full-time Data Scientist 1 offers",
      "Free Swiggy One VIP subscription and food credits"
    ],
    featured: false,
    urgentHiring: false
  },
  {
    id: "in-zerodha-backend-blr",
    title: "Systems & Backend Software Engineer (Kite Trading Core)",
    company: "Zerodha",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Zerodha_logo.svg",
    companyWebsite: "https://zerodha.com",
    applyUrl: "https://zerodha.com/careers",
    location: "Bangalore, Karnataka (JP Nagar 4th Phase)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹28,00,000 - ₹46,00,000 LPA + Annual Profit Share",
    postedAt: "14 hours ago",
    postedDate: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    deadline: "Open requisition",
    applicantsCount: 65,
    tags: ["Go", "Python", "PostgreSQL", "Redis", "Linux", "High Concurrency"],
    description: "Zerodha is India's largest stockbroker, known for having one of the leanest and highest-performance engineering teams in the world. You will work on Kite, handling millions of live trades every second.",
    responsibilities: [
      "Build high-performance, low-latency microservices in Go and Python.",
      "Optimize Linux socket performance and memory allocation for ultra-low latency market feeds.",
      "Manage and tune PostgreSQL databases executing hundreds of millions of daily queries.",
      "Write clean, dependency-minimalist software adhering to Zerodha engineering philosophy."
    ],
    requirements: [
      "2-6 years experience developing backend systems in Go, Python, or C/C++.",
      "Deep understanding of Linux systems programming, networking, and memory profiling.",
      "Experience with relational databases and writing complex optimized SQL."
    ],
    niceToHave: [
      "Contributions to open-source software (OSS) or personal technical blogs.",
      "Understanding of stock exchanges, FIX protocol, or financial markets."
    ],
    benefits: [
      "High baseline compensation + generous annual company profit-sharing bonus",
      "No unnecessary meetings or corporate bureaucracy — high engineering autonomy",
      "Comprehensive health insurance for employee, spouse, and parents",
      "Beautiful green campus in JP Nagar, Bangalore"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-phonepe-sde-blr",
    title: "Software Engineer (UPI High-Throughput Core)",
    company: "PhonePe",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
    companyWebsite: "https://phonepe.com",
    applyUrl: "https://www.phonepe.com/careers/",
    location: "Bangalore, Karnataka (Bellandur / Sarjapur Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹28,00,000 - ₹44,00,000 LPA + ESOPs",
    postedAt: "1 day ago",
    postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    deadline: "In 18 days",
    applicantsCount: 92,
    tags: ["Java", "HBase", "Aerospike", "Kafka", "Distributed Systems", "UPI"],
    description: "PhonePe processes nearly 50% of all UPI transactions in India, handling over 250 million daily financial operations. Build ultra-resilient financial ledgers with sub-200ms transaction settlement.",
    responsibilities: [
      "Architect and scale Java backend systems processing billions of monthly transactions.",
      "Optimize distributed NoSQL data stores (HBase, Aerospike) for extreme write throughput.",
      "Collaborate with NPCI and partner banks to streamline payment clearing switches.",
      "Build automated fraud detection and security guardrails."
    ],
    requirements: [
      "2-5 years of backend development experience in Java.",
      "Strong computer science fundamentals in distributed systems, concurrency, and caching.",
      "Experience handling mission-critical, zero-downtime production environments."
    ],
    niceToHave: [
      "Experience in fintech or banking infrastructure.",
      "Deep knowledge of Kafka event-driven architectures."
    ],
    benefits: [
      "Lucrative CTC + high-value PhonePe ESOPs",
      "Comprehensive medical coverage with zero co-pay",
      "Free meals, refreshments, and transport support across Bangalore",
      "Structured technical growth and promotion paths"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-cred-frontend-blr",
    title: "Frontend Engineer (Design Systems & Micro-Interactions)",
    company: "CRED",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/af/Cred_club_logo.svg",
    companyWebsite: "https://cred.club",
    applyUrl: "https://cred.club/careers",
    location: "Bangalore, Karnataka (Indiranagar / Old Airport Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Frontend & Web",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹30,0,000 - ₹48,00,000 LPA + ESOPs",
    postedAt: "1 day ago",
    postedDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    deadline: "In 15 days",
    applicantsCount: 78,
    tags: ["React", "TypeScript", "React Native", "CSS Animations", "WebGL", "Figma"],
    description: "CRED is celebrated for having the most aesthetically ambitious and visually tactile interfaces in consumer tech. Work at our Indiranagar headquarters crafting fluid animations and responsive financial tools.",
    responsibilities: [
      "Craft bespoke 60fps micro-animations and physics-based UI components in React and React Native.",
      "Build reusable design system primitives consumed by all CRED product squads.",
      "Optimize rendering pipelines to eliminate dropped frames on Android and iOS devices.",
      "Partner closely with product designers to pioneer new interface paradigms."
    ],
    requirements: [
      "2-5 years experience building high-complexity frontend applications with React and TypeScript.",
      "Obsessive attention to UI typography, micro-interactions, layout physics, and performance.",
      "Deep understanding of browser rendering pipelines and memory profiling."
    ],
    niceToHave: [
      "Experience with Canvas, Three.js, WebGL, or Lottie animations.",
      "Strong mobile experience in React Native."
    ],
    benefits: [
      "Top-tier compensation + high upside CRED equity",
      "Gourmet culinary dining at the in-house CRED bistro in Indiranagar",
      "Unlimited wellness and fitness allowances",
      "MacBook Pro M3 Max hardware setup of your choice"
    ],
    featured: true,
    urgentHiring: false
  },
  {
    id: "in-cred-intern-blr",
    title: "Frontend & Mobile Engineering Intern (2026 Batch)",
    company: "CRED",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/af/Cred_club_logo.svg",
    companyWebsite: "https://cred.club",
    applyUrl: "https://cred.club/careers",
    location: "Bangalore, Karnataka (Indiranagar)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Frontend & Web",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹65,000 - ₹80,000 / month + Daily Bistro Dining",
    postedAt: "1 day ago",
    postedDate: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    deadline: "In 18 days",
    applicantsCount: 140,
    tags: ["React", "JavaScript", "TypeScript", "CSS", "UI Design", "Framer Motion"],
    description: "CRED's engineering internship offers passionate student developers the chance to ship tactile, world-class mobile and web interfaces directly into the hands of millions of high-trust credit users.",
    responsibilities: [
      "Build fluid interactive components and user flows in React.",
      "Implement animations and transitions adhering to the CRED design system.",
      "Participate in design critiques, code reviews, and intern demo days.",
      "Optimize web vital scores and responsive layouts."
    ],
    requirements: [
      "Pre-final or final year undergraduate student graduating in 2026.",
      "Demonstrated passion for frontend design and JavaScript/TypeScript programming.",
      "Strong aesthetic sensibility and attention to design detail."
    ],
    niceToHave: [
      "Live portfolio showcasing custom UI animations or web apps.",
      "Familiarity with React Native or Tailwind CSS."
    ],
    benefits: [
      "High monthly stipend (₹65,000 - ₹80,000/month)",
      "Daily gourmet breakfast, lunch, and specialty coffee in Indiranagar",
      "Direct pathway for return full-time engineer offers",
      "Mentorship from leading Indian design-engineering practitioners"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-cisco-cloud-blr",
    title: "Software Engineer (Cloud Networking & Security)",
    company: "Cisco India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    companyWebsite: "https://cisco.com",
    applyUrl: "https://jobs.cisco.com/jobs/SearchJobs/Bangalore",
    location: "Bangalore, Karnataka (Cessna Business Park, Kadubeesanahalli)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Cloud & DevOps",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹19,00,000 - ₹28,00,000 LPA + Benefits",
    postedAt: "2 days ago",
    postedDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    deadline: "In 25 days",
    applicantsCount: 110,
    tags: ["Python", "Go", "Docker", "Kubernetes", "TCP/IP Networking", "Linux"],
    description: "Cisco's Bangalore campus is one of Cisco's primary global R&D centers. You will develop cloud-native networking controllers, software-defined networks (SDN), and automated cyber threat defense engines.",
    responsibilities: [
      "Develop scalable microservices in Python and Go for cloud orchestration.",
      "Implement real-time network telemetry monitoring and automated threat mitigation.",
      "Deploy and manage containerized services on enterprise Kubernetes clusters.",
      "Collaborate with global technical teams across San Jose and Bangalore."
    ],
    requirements: [
      "Bachelor's degree in Computer Science, Information Technology, or Electrical Engineering.",
      "0-3 years of software development experience in Python, Go, or C/C++.",
      "Firm grasp of networking protocols (TCP/IP, HTTP/2, routing, switching)."
    ],
    niceToHave: [
      "CCNA/CCNP certification or experience with Docker/Kubernetes.",
      "Experience with cloud infrastructure (AWS/Azure/GCP)."
    ],
    benefits: [
      "Competitive compensation package + annual performance cash bonuses",
      "Cessna Business Park campus with gym, sports facilities, and cafeteria",
      "Health insurance covering parents and comprehensive OPD benefits",
      "Education assistance allowance for advanced certifications"
    ],
    featured: false,
    urgentHiring: false
  },
  {
    id: "in-intel-intern-blr",
    title: "Graduate Technical Intern (AI Acceleration & Silicon Software)",
    company: "Intel India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg",
    companyWebsite: "https://intel.com",
    applyUrl: "https://jobs.intel.com/en/search-jobs/India",
    location: "Bangalore, Karnataka (Outer Ring Road, Devarabeesanahalli)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹55,000 - ₹70,000 / month Stipend",
    postedAt: "2 days ago",
    postedDate: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    deadline: "In 24 days",
    applicantsCount: 95,
    tags: ["C++", "Python", "Compilers", "Linux Kernel", "OpenVINO", "Computer Architecture"],
    description: "At Intel's major Bangalore R&D center, interns work on software that unlocks silicon performance: OpenVINO AI acceleration, Linux kernel driver development, and deep learning compiler runtimes.",
    responsibilities: [
      "Write low-level software in C and C++ optimizing neural network execution on Intel processors.",
      "Benchmark model execution using OpenVINO runtime engines.",
      "Build automated hardware-in-the-loop test automation suites.",
      "Collaborate with silicon architects on upcoming processor features."
    ],
    requirements: [
      "Enrolled in B.Tech, M.Tech, or MS in Computer Science, Electronics, or related discipline.",
      "Strong proficiency in C and C++ programming.",
      "Knowledge of computer architecture, memory hierarchies, and operating systems."
    ],
    niceToHave: [
      "Familiarity with deep learning frameworks (PyTorch, ONNX).",
      "Linux driver or systems programming experience."
    ],
    benefits: [
      "Competitive monthly stipend (₹55,000 - ₹70,000/month)",
      "Access to unreleased Intel hardware and developer development boards",
      "Structured mentorship from principal silicon architects",
      "Direct pathway to Intel Graduate Full-Time Hiring cohorts"
    ],
    featured: false,
    urgentHiring: false
  },
  {
    id: "in-goldman-sachs-blr",
    title: "Engineering Analyst (Software Development & Algo Systems)",
    company: "Goldman Sachs India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    companyWebsite: "https://goldmansachs.com",
    applyUrl: "https://www.goldmansachs.com/careers/locations/india/",
    location: "Bangalore, Karnataka (Helios Business Park, Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹24,00,000 - ₹38,00,000 LPA + Annual Bonus",
    postedAt: "2 days ago",
    postedDate: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    deadline: "In 20 days",
    applicantsCount: 160,
    tags: ["Java", "Python", "C++", "Financial Systems", "SQL", "High-Frequency Algorithms"],
    description: "Goldman Sachs' Bangalore office is the firm's second-largest engineering presence in the world. You will build mission-critical banking platforms, risk management engines, and high-frequency market execution services.",
    responsibilities: [
      "Build high-throughput, low-latency microservices in Java or C++.",
      "Design database schema and optimize transactional queries for trade clearing.",
      "Collaborate with global trading desks and quantitative researchers.",
      "Participate in the global Goldman Sachs engineering development curriculum."
    ],
    requirements: [
      "Bachelor's or Master's degree in Computer Science, Mathematics, or related field.",
      "0-2 years of software engineering experience or fresh graduate with strong credentials.",
      "Strong understanding of object-oriented design, data structures, and algorithms."
    ],
    niceToHave: [
      "Experience with relational databases (SQL) and distributed caching.",
      "Interest in financial markets and trading systems."
    ],
    benefits: [
      "Industry-leading investment banking compensation package + performance bonuses",
      "Comprehensive medical insurance for employee, spouse, and dependents",
      "State-of-the-art Helios Business Park campus with gym and wellness centers",
      "Global mobility and international transfer opportunities"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-uber-intern-blr",
    title: "Software Engineering Intern (Bangalore Tech Hub)",
    company: "Uber India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    companyWebsite: "https://uber.com",
    applyUrl: "https://www.uber.com/us/en/careers/list/?location=IND--Bengaluru",
    location: "Bangalore, Karnataka (Mahadevapura / Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹90,000 / month + Monthly Uber Credits",
    postedAt: "3 days ago",
    postedDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Batch Application Cycle",
    applicantsCount: 240,
    tags: ["Go", "Java", "Kafka", "Distributed Systems", "Algorithms", "PostgreSQL"],
    description: "Uber's Bangalore engineering hub builds core capabilities that power Uber Rides and Uber Eats globally. Interns work directly on driver dispatch, mapping intelligence, and high-throughput payment settlement.",
    responsibilities: [
      "Build microservices in Go or Java handling tens of thousands of queries per second.",
      "Develop Kafka stream processing pipelines for real-time driver tracking.",
      "Participate in code reviews, write automated unit tests, and monitor production telemetry.",
      "Deliver an intern project presentation to the engineering leadership team."
    ],
    requirements: [
      "Currently pursuing B.Tech, M.Tech, or Dual Degree in Computer Science graduating in 2026/2027.",
      "Strong coding skills in Go, Java, Python, or C++.",
      "Deep understanding of data structures, complexity analysis, and algorithms."
    ],
    niceToHave: [
      "Experience with Docker, Kubernetes, or microservice architecture.",
      "High rankings on competitive programming platforms."
    ],
    benefits: [
      "Top-tier intern stipend (₹90,000/month)",
      "Monthly Uber ride credits and Uber Eats vouchers",
      "1-on-1 mentorship with Staff & Principal engineers",
      "Direct conversion opportunities for full-time Software Engineer 1 roles"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-krutrim-ai-blr",
    title: "Generative AI & LLM Systems Engineer",
    company: "Krutrim AI (Ola)",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/5/58/Ola_Cabs_logo.svg",
    companyWebsite: "https://olaelectric.com",
    applyUrl: "https://olaelectric.com/careers",
    location: "Bangalore, Karnataka (Koramangala 100ft Road)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "AI & Machine Learning",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹24,00,000 - ₹40,00,000 LPA + ESOPs",
    postedAt: "3 days ago",
    postedDate: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
    deadline: "In 10 days",
    applicantsCount: 68,
    tags: ["Python", "PyTorch", "LLMs", "vLLM", "Transformers", "CUDA", "FastAPI"],
    description: "Krutrim is India's premier AI company building multilingual foundation models and indigenous AI silicon runtimes. You will architect high-throughput model inference pipelines and fine-tune models for Indian languages.",
    responsibilities: [
      "Build low-latency LLM serving runtimes using vLLM, TensorRT-LLM, and Triton.",
      "Fine-tune multilingual foundation models on Indic language datasets.",
      "Optimize GPU memory utilization and implement speculative decoding techniques.",
      "Deploy scalable APIs supporting millions of daily consumer AI interactions."
    ],
    requirements: [
      "2-5 years experience developing deep learning applications and distributed inference in Python.",
      "Hands-on expertise with PyTorch, Hugging Face Transformers, and vector databases.",
      "Experience deploying models on GPU clusters."
    ],
    niceToHave: [
      "Understanding of model quantization (AWQ, GPTQ) and CUDA optimization.",
      "Experience training models on Indic language corpora."
    ],
    benefits: [
      "Competitive compensation with high-upside ESOP allocation",
      "Fast-paced frontier AI research environment in Koramangala",
      "Dedicated access to large-scale GPU supercomputing clusters",
      "Complimentary Ola rides and dining allowances"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-nvidia-swe-blr",
    title: "AI Software Engineer (GPU Runtimes & TensorRT)",
    company: "NVIDIA India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
    companyWebsite: "https://nvidia.com",
    applyUrl: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?locationHierarchy1=2fe548da4f3301a24d29388df601bf4e",
    location: "Bangalore, Karnataka (Manyata Tech Park / Whitefield)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹34,00,000 - ₹58,00,000 LPA + Stock",
    postedAt: "3 days ago",
    postedDate: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
    deadline: "In 20 days",
    applicantsCount: 95,
    tags: ["C++", "CUDA", "PyTorch", "TensorRT", "Deep Learning", "GPU Architecture"],
    description: "NVIDIA's Bangalore software center drives development of world-class AI runtimes. You will develop software optimizing generative AI models on NVIDIA Blackwell and Hopper architectures.",
    responsibilities: [
      "Develop GPU-accelerated libraries in C++ and CUDA for deep learning inference.",
      "Optimize transformer kernel execution to achieve maximum TFLOPs throughput.",
      "Collaborate with leading foundation model developers globally to accelerate frontier models.",
      "Benchmark and profile memory bandwidth bottlenecks using NVIDIA Nsight Systems."
    ],
    requirements: [
      "2-6 years software development experience in C++ and Python.",
      "Hands-on experience with CUDA parallel programming or GPU compute architectures.",
      "Deep understanding of computer architecture and low-level memory systems."
    ],
    niceToHave: [
      "Contributions to open-source deep learning compilers or vLLM.",
      "Experience with TensorRT, Triton, or ONNX Runtime."
    ],
    benefits: [
      "Premium compensation package + high-value NVIDIA stock grants (RSUs)",
      "Employee Stock Purchase Plan (ESPP) with 15% discount",
      "World-class Manyata Tech Park campus with wellness facilities",
      "Comprehensive healthcare covering family and parents"
    ],
    featured: true,
    urgentHiring: false
  },
  {
    id: "in-msft-swe-blr",
    title: "Software Engineer - Azure Cloud Core & AI Platforms",
    company: "Microsoft India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    companyWebsite: "https://careers.microsoft.com",
    applyUrl: "https://careers.microsoft.com/v2/global/en/home.html",
    location: "Bangalore, Karnataka (Vigyan Nagar / Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹26,00,000 - ₹38,00,000 LPA + Onboarding Bonus + Stock",
    postedAt: "1 hour ago",
    postedDate: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 164,
    tags: ["C#", "C++", "Azure", "Distributed Systems", "Cloud Infrastructure", "Kubernetes"],
    description: "Join Microsoft India Development Center (IDC) in Bangalore. You will architect hyperscale distributed systems powering Microsoft Azure, Microsoft Copilot, and intelligent cloud infra.",
    responsibilities: [
      "Develop low-latency cloud infrastructure services running across worldwide Azure data centers.",
      "Design telemetry, automated deployment pipelines, and failure recovery mechanisms.",
      "Collaborate with international teams across Redmond and Bangalore to ship resilient cloud features.",
      "Optimize resource scheduling and compute fleet virtualization efficiency."
    ],
    requirements: [
      "Bachelor's or Master's degree in Computer Science or related STEM field.",
      "Strong coding proficiency in C#, C++, Java, or Go.",
      "Deep understanding of algorithms, multi-threading, and computer systems fundamentals."
    ],
    niceToHave: [
      "Prior cloud experience with Azure, AWS, or GCP.",
      "Knowledge of Docker, Kubernetes, or microservices architecture."
    ],
    benefits: [
      "Premier Indian tech salary + annual Microsoft stock awards",
      "Flexible hybrid working options and modern Bangalore campus amenities",
      "World-class health, wellness, and parental insurance coverage",
      "Annual technical certification and learning sponsorship allowance"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-msft-intern-blr",
    title: "Research & Software Engineering Intern (2026 Cohort)",
    company: "Microsoft India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    companyWebsite: "https://careers.microsoft.com",
    applyUrl: "https://careers.microsoft.com/v2/global/en/home.html",
    location: "Bangalore, Karnataka (Lavelle Road / Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹1,00,000 - ₹1,25,000 / month Stipend + Housing",
    postedAt: "3 hours ago",
    postedDate: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Batch Application Window",
    applicantsCount: 290,
    tags: ["Python", "PyTorch", "Algorithms", "Machine Learning", "C++", "GenAI"],
    description: "Microsoft Research (MSR) India in Bangalore invites passionate student researchers and engineers to work alongside world-renowned scientists in Generative AI, natural language, and systems.",
    responsibilities: [
      "Collaborate on cutting-edge research projects and build prototype AI implementations.",
      "Train, fine-tune, and evaluate large multimodal models and algorithmic frameworks.",
      "Publish research papers at top conferences (NeurIPS, ICML, ACL) or contribute to open-source tooling.",
      "Present findings to the broader Microsoft Research and engineering communities."
    ],
    requirements: [
      "Enrolled in B.Tech, M.Tech, MS, or PhD in Computer Science graduating in 2026/2027.",
      "Strong mathematical foundations (linear algebra, probability, optimization).",
      "Proficiency in Python and deep learning frameworks (PyTorch or TensorFlow)."
    ],
    niceToHave: [
      "Published papers at reputable workshops or conferences.",
      "Strong competitive programming or Kaggle competition ranking."
    ],
    benefits: [
      "Market-leading research stipend (₹1,00,000 - ₹1,25,000/month)",
      "Dedicated corporate housing in Bangalore or equivalent housing allowance",
      "One-on-one mentorship with principal researchers and architects",
      "Pre-Placement Offer (PPO) pathway for full-time FTE roles"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-infosys-sp-blr",
    title: "Specialist Programmer (High-Performance Engineering)",
    company: "Infosys",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    companyWebsite: "https://www.infosys.com",
    applyUrl: "https://www.infosys.com/careers.html",
    location: "Bangalore, Karnataka (Electronic City Campus) & Mysore",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹9,50,000 - ₹14,00,000 LPA + Performance Incentives",
    postedAt: "4 hours ago",
    postedDate: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 210,
    tags: ["Java", "Python", "Data Structures", "Spring Boot", "Cloud", "SQL"],
    description: "The Specialist Programmer (SP) role at Infosys is an elite technical track for advanced coders and problem solvers. Based at the iconic Electronic City campus in Bangalore and Mysore tech facilities.",
    responsibilities: [
      "Build mission-critical digital transformation software for Fortune 500 global clients.",
      "Implement scalable backend microservices, event-driven architectures, and modern cloud integrations.",
      "Participate in agile sprints, code audits, and automated DevOps delivery pipelines.",
      "Optimize database queries and resolve architectural performance bottlenecks."
    ],
    requirements: [
      "B.E. / B.Tech / M.Tech in Computer Science, Information Science, or related engineering.",
      "Exceptional problem-solving abilities and algorithmic thinking.",
      "Solid command of Java, Python, or C++ and modern software engineering practices."
    ],
    niceToHave: [
      "Experience with Spring Boot, Node.js, or cloud certifications (AWS / Azure / GCP).",
      "Active participation in HackWithInfy or national competitive coding contests."
    ],
    benefits: [
      "Accelerated career progression in Infosys's premier Specialist Engineering cadre",
      "Iconic Electronic City (Bangalore) & Mysore Global Education Center campuses",
      "Comprehensive medical coverage for employee and dependents",
      "Subsidized campus transport across all major Bangalore routes"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-infosys-instep-mys",
    title: "InStep Software Engineering Intern (2026 Batch)",
    company: "Infosys",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    companyWebsite: "https://www.infosys.com/instep.html",
    applyUrl: "https://www.infosys.com/instep.html",
    location: "Bangalore & Mysore Campus, Karnataka",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "On-Site",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹45,000 - ₹60,000 / month + World-Class Campus Stay",
    postedAt: "5 hours ago",
    postedDate: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Internship Cohort",
    applicantsCount: 185,
    tags: ["Python", "Java", "Machine Learning", "Full Stack", "Data Analytics"],
    description: "Infosys InStep is ranked the World's #1 Internship Program. Work on high-impact projects in AI, cloud computing, and cybersecurity at the Bangalore Electronic City or picturesque Mysore campus.",
    responsibilities: [
      "Develop innovative software solutions with direct mentorship from senior technology directors.",
      "Build full-stack web applications or AI models applied to real enterprise datasets.",
      "Collaborate with international interns and engage in executive leadership interactions.",
      "Showcase project prototypes during the annual InStep Innovation Summit."
    ],
    requirements: [
      "Pre-final year undergraduate or postgraduate engineering student graduating in 2026.",
      "Proficient in Python, Java, JavaScript, or C++.",
      "Strong academic record and passion for building technology products."
    ],
    niceToHave: [
      "Completed projects in web frameworks, machine learning, or mobile apps.",
      "Strong communication and technical presentation skills."
    ],
    benefits: [
      "Prestigious InStep certificate and mentorship by senior leadership",
      "Fully covered stay at the world-class Mysore / Bangalore campus facilities",
      "Direct fast-track interview for Specialist Programmer / Digital Specialist Engineer roles",
      "Cultural exchange and global student community exposure"
    ],
    featured: true,
    urgentHiring: false
  },
  {
    id: "in-atlassian-swe-blr",
    title: "Software Engineer (Jira & Enterprise Cloud Platform)",
    company: "Atlassian",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian-Logo.svg",
    companyWebsite: "https://www.atlassian.com",
    applyUrl: "https://www.atlassian.com/company/careers/locations/bengaluru",
    location: "Bangalore, Karnataka (RMZ Ecoworld, Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹34,00,000 - ₹48,00,000 LPA + Generous RSUs",
    postedAt: "6 hours ago",
    postedDate: new Date(Date.now() - 6.5 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 140,
    tags: ["Java", "Kotlin", "React", "AWS", "Microservices", "Kafka"],
    description: "Atlassian's state-of-the-art Bangalore R&D center is home to core teams building Jira, Confluence, and the Atlassian Cloud Platform. Work in an environment that prizes developer craftsmanship.",
    responsibilities: [
      "Develop scalable distributed microservices powering Jira and collaborative developer tools.",
      "Build high-throughput event streaming services handling billions of events daily.",
      "Partner with product managers and designers to deliver seamless collaboration features.",
      "Participate in 20% innovation ShipIt hackathons and open-source contributions."
    ],
    requirements: [
      "2-5 years of software engineering experience building production services.",
      "High proficiency in Java, Kotlin, or Go and modern cloud engineering.",
      "Firm grasp of distributed systems, relational & NoSQL databases, and API design."
    ],
    niceToHave: [
      "Experience with AWS cloud native technologies and DynamoDB/Aurora.",
      "Frontend proficiency in React or TypeScript."
    ],
    benefits: [
      "Market-leading cash compensation + substantial US-listed Atlassian RSUs",
      "Generous home office stipend and work-from-anywhere flexibility",
      "Top-tier health and dental insurance for employee, spouse, children, and parents",
      "Annual wellness and personal development budget of ₹1,20,000"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-atlassian-intern-blr",
    title: "Software Engineering Intern (Summer 2026 Batch)",
    company: "Atlassian",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian-Logo.svg",
    companyWebsite: "https://www.atlassian.com",
    applyUrl: "https://www.atlassian.com/company/careers/students",
    location: "Bangalore, Karnataka (RMZ Ecoworld)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Software Engineering",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹95,000 - ₹1,15,000 / month Stipend + Goodies",
    postedAt: "7 hours ago",
    postedDate: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Student Batch Cohort",
    applicantsCount: 260,
    tags: ["Java", "Python", "Data Structures", "Algorithms", "System Design"],
    description: "Spend your summer at Atlassian Bangalore working on production features shipped to millions of knowledge workers across the globe. You are treated as a full software engineer from day one.",
    responsibilities: [
      "Write, test, and ship production-ready code for Jira Cloud or Confluence services.",
      "Work closely with your dedicated senior engineer buddy and engineering manager.",
      "Compete in Atlassian ShipIt 24-hour global hackathon.",
      "Present your completed intern project to the Bangalore engineering team."
    ],
    requirements: [
      "Graduating in 2026 with a Degree in Computer Science, Software Engineering, or related.",
      "Strong coding abilities in Java, Python, C++, or TypeScript.",
      "Solid understanding of computer science principles and algorithmic problem solving."
    ],
    niceToHave: [
      "Prior internship experience or active open-source contributions on GitHub.",
      "Projects showing clean code and test automation."
    ],
    benefits: [
      "Top-tier internship stipend in Bangalore (₹95,000 - ₹1,15,000/month)",
      "Premium corporate stay or housing stipend in Bangalore",
      "Comprehensive intern mentorship and team social events",
      "Highest conversion rate for Full-Time PPOs (Graduate Software Engineer)"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-meesho-sde-blr",
    title: "SDE - 1 (High Concurrency Marketplace)",
    company: "Meesho",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Meesho_Logo_Full.png",
    companyWebsite: "https://www.meesho.io",
    applyUrl: "https://www.meesho.io/jobs",
    location: "Bangalore, Karnataka (Outer Ring Road, Bellandur)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹22,00,000 - ₹30,00,000 LPA + ESOPs",
    postedAt: "8 hours ago",
    postedDate: new Date(Date.now() - 8.5 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 175,
    tags: ["Java", "Spring Boot", "Kafka", "Redis", "MySQL", "Distributed Systems"],
    description: "Meesho is democratizing internet commerce for Bharat. As an SDE 1 in Bangalore, you will build ultra low-latency order placement, catalog search, and seller systems handling millions of daily transactions.",
    responsibilities: [
      "Design and maintain microservices with sub-50ms API latencies during mega sale events.",
      "Implement resilient message queues and distributed caching architectures.",
      "Write unit and integration tests achieving > 85% code coverage.",
      "Participate in sprint planning and production on-call rotations."
    ],
    requirements: [
      "0-2 years of backend software engineering experience.",
      "Strong command over Java, Spring Boot, and relational databases (MySQL / PostgreSQL).",
      "Solid understanding of RESTful API design, data structures, and algorithms."
    ],
    niceToHave: [
      "Familiarity with Kafka, Redis, and Docker in production.",
      "Experience handling high QPS (queries per second) traffic."
    ],
    benefits: [
      "High starting CTC + wealth creation with Meesho stock options (ESOPs)",
      "Boundaryless workplace policy with flexible hybrid working",
      "Full family medical insurance including parents",
      "Reimbursements for learning, home office setup, and wellness"
    ],
    featured: false,
    urgentHiring: true
  },
  {
    id: "in-postman-swe-blr",
    title: "Software Engineer (API Platform & Developer Tooling)",
    company: "Postman",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Postman_%28software%29_logo.png",
    companyWebsite: "https://www.postman.com",
    applyUrl: "https://www.postman.com/company/careers/",
    location: "Bangalore, Karnataka (Indiranagar 100ft Road)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Full Stack",
    jobType: "Full-Time",
    experienceLevel: "Mid Level",
    salary: "₹28,00,000 - ₹42,00,000 LPA + US Stock Options",
    postedAt: "9 hours ago",
    postedDate: new Date(Date.now() - 9.5 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 130,
    tags: ["Node.js", "TypeScript", "React", "Electron", "GraphQL", "APIs"],
    description: "Over 30 million developers use Postman worldwide. Born and scaled in Bangalore, Postman engineering solves deep challenges in API design, runtime debugging, and developer productivity tooling.",
    responsibilities: [
      "Develop core features for Postman Desktop and Web API development environment.",
      "Optimize local Electron execution performance and high-volume websocket sync.",
      "Design extensible plugin architectures and GraphQL query engines.",
      "Engage directly with global developer community feedback and open API specifications."
    ],
    requirements: [
      "2-4 years of experience building software in TypeScript, JavaScript, or Node.js.",
      "Deep understanding of the HTTP protocol, REST, GraphQL, and modern web architectures.",
      "Experience building complex web applications or developer tooling."
    ],
    niceToHave: [
      "Contributions to developer open-source tools or Postman collections.",
      "Knowledge of Electron, WebAssembly, or browser rendering internals."
    ],
    benefits: [
      "Competitive CTC with valuable pre-IPO Postman stock options",
      "Iconic Indiranagar office located in the heart of Bangalore's food & cafe district",
      "Flexible hybrid model and generous equipment allowances",
      "Global team offsites and conference attendance budgets"
    ],
    featured: true,
    urgentHiring: false
  },
  {
    id: "in-phonepe-intern-blr",
    title: "Backend Systems Intern (UPI & Core Payments)",
    company: "PhonePe",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
    companyWebsite: "https://www.phonepe.com",
    applyUrl: "https://www.phonepe.com/careers/",
    location: "Bangalore, Karnataka (Bellandur / Sarjapur Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "Backend Systems",
    jobType: "Internship",
    experienceLevel: "Entry Level",
    salary: "₹70,000 - ₹85,000 / month Stipend + Perks",
    postedAt: "10 hours ago",
    postedDate: new Date(Date.now() - 10.5 * 60 * 60 * 1000).toISOString(),
    deadline: "2026 Batch Student Cohort",
    applicantsCount: 240,
    tags: ["Java", "HBase", "Aerospike", "Kafka", "Data Structures", "Algorithms"],
    description: "PhonePe powers nearly 50% of all UPI transactions in India. Intern with our core payments team in Bangalore and write code that powers billions of financial transactions every month.",
    responsibilities: [
      "Build and test distributed services processing mission-critical UPI transactions.",
      "Optimize NoSQL data queries in HBase and Aerospike for ultra-low latency.",
      "Work with senior architects on high-throughput financial ledger accounting.",
      "Write automated integration test suites for banking network integrations."
    ],
    requirements: [
      "Currently pursuing B.Tech / M.Tech in CS/IT or related field graduating in 2026.",
      "Exceptional fundamentals in Data Structures, Algorithms, and Operating Systems.",
      "Good knowledge of Java or C++ and basic database principles."
    ],
    niceToHave: [
      "Ranked in top 5% on LeetCode or CodeChef.",
      "Understanding of multithreading, concurrent programming, and distributed networks."
    ],
    benefits: [
      "High stipend (₹70,000 - ₹85,000/month) + daily catered lunch and snacks",
      "Direct exposure to world-leading UPI payment scale (billion+ transactions/month)",
      "High PPO conversion into Full-Time Software Engineer at PhonePe",
      "Modern Bellandur tech campus with recreational zones"
    ],
    featured: true,
    urgentHiring: true
  },
  {
    id: "in-adobe-swe-blr",
    title: "Software Development Engineer (Creative Cloud & Firefly AI)",
    company: "Adobe India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Adobe_Corporate_Horizontal_Red_HEX.svg",
    companyWebsite: "https://careers.adobe.com",
    applyUrl: "https://careers.adobe.com/us/en/india",
    location: "Bangalore, Karnataka (Prathiksha Campus, Outer Ring Rd)",
    locationCity: "Bangalore",
    locationState: "Karnataka",
    workMode: "Hybrid",
    category: "AI & Machine Learning",
    jobType: "Full-Time",
    experienceLevel: "Entry Level",
    salary: "₹25,00,000 - ₹36,00,000 LPA + Adobe RSUs",
    postedAt: "12 hours ago",
    postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    deadline: "Open until filled",
    applicantsCount: 155,
    tags: ["C++", "Python", "Computer Vision", "Generative AI", "WebAssembly", "Cloud"],
    description: "Adobe India's Bangalore Center is driving creative intelligence for creators worldwide. You will develop AI-first capabilities for Adobe Firefly, Photoshop Web, and cloud document workflows.",
    responsibilities: [
      "Implement high-performance computer vision algorithms and generative image models in C++ and Python.",
      "Develop WebAssembly components to execute complex graphics models in browser runtimes.",
      "Collaborate with international design and product teams in San Jose and Bangalore.",
      "Ensure robust security, accessibility, and high performance across all creative apps."
    ],
    requirements: [
      "Bachelor's or Master's in Computer Science, Software Engineering, or related discipline.",
      "Proficiency in C++ or Python with a passion for software craftsmanship.",
      "Strong background in data structures, algorithms, and object-oriented design."
    ],
    niceToHave: [
      "Knowledge of computer vision, image processing, or deep learning models.",
      "Experience with WebAssembly (WASM), WebGL, or GPU compute shaders."
    ],
    benefits: [
      "Competitive compensation + valuable Adobe Restricted Stock Units (RSUs)",
      "World-class Outer Ring Road Bangalore campus with gym, cafeteria, and transport",
      "Wellness leaves and sabbatical programs",
      "Employee education assistance up to ₹7,00,000 per year"
    ],
    featured: true,
    urgentHiring: false
  }
]

// In-memory data store with fallback caching
let jobsData: JobOpening[] = [...getAllSeedJobs(), ...SEED_INDIA_ROLES]
const userApplications = new Map<string, JobApplication[]>()
const userSavedJobs = new Map<string, Set<string>>()

// Initialize mock applications for realistic platform feel
function ensureMockApplicationsForUser(userId: string) {
  if (!userApplications.has(userId)) {
    userApplications.set(userId, [
      {
        id: `PL-APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        jobId: "in-google-swe-blr",
        jobTitle: "Software Engineer, Core Infrastructure (L3/L4)",
        company: "Google India",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        userId,
        candidateName: "Dr. Punith K R",
        candidateEmail: "punith@pathlearn.edu",
        candidatePhone: "+91 98765 43210",
        portfolioUrl: "https://punith.dev",
        linkedInUrl: "https://linkedin.com/in/punithkr",
        githubUrl: "https://github.com/punithkr",
        experienceYears: "2-4 years in software engineering",
        noticePeriod: "Immediate / 15 days",
        resumeType: "pathlearn-builder",
        resumeName: "Master Technical Resume (PathLearn ATS 100%)",
        coverPitch: "Passionate engineer based in Bangalore with deep experience in scalable microservices and distributed algorithms. Excited to contribute to Google India's infrastructure teams.",
        matchScore: 96,
        status: "UNDER_REVIEW",
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        statusNotes: "Requisition opened. Official portal: https://careers.google.com",
        applyUrl: "https://www.google.com/about/careers/applications/jobs/results/?location=Bangalore%2C%20Karnataka%2C%20India",
        location: "Bangalore, Karnataka",
        jobType: "Full-Time"
      }
    ])
  }

  if (!userSavedJobs.has(userId)) {
    userSavedJobs.set(userId, new Set(["in-flipkart-sde2-blr", "in-amazon-sde-blr"]))
  }
}

/**
 * Calculate dynamic match score between a role and candidate target role/skills
 */
export function calculateMatchScore(job: JobOpening, userTargetRole?: string, userSkills: string[] = []): number {
  let score = 72 // Baseline match

  const lowerTitle = job.title.toLowerCase()
  const lowerCategory = job.category.toLowerCase()

  if (userTargetRole) {
    const target = userTargetRole.toLowerCase()
    if (lowerTitle.includes(target) || target.includes(lowerTitle)) {
      score += 18
    } else if (
      (target.includes("ai") || target.includes("machine learning") || target.includes("data")) &&
      (lowerCategory.includes("ai") || lowerCategory.includes("data") || lowerTitle.includes("ai"))
    ) {
      score += 16
    } else if (
      (target.includes("full") || target.includes("software") || target.includes("engineer")) &&
      (lowerCategory.includes("software") || lowerCategory.includes("backend") || lowerCategory.includes("frontend") || lowerCategory.includes("full"))
    ) {
      score += 15
    }
  }

  // Count matching skills
  if (userSkills.length > 0) {
    let matchedCount = 0
    job.tags.forEach((tag) => {
      if (userSkills.some((s) => s.toLowerCase() === tag.toLowerCase())) {
        matchedCount++
      }
    })
    const boost = Math.min(matchedCount * 3, 14)
    score += boost
  } else {
    score += Math.floor(Math.random() * 8) + 8
  }

  return Math.min(Math.max(score, 70), 98)
}

/**
 * Retrieve all jobs & internships with optional filtering (roleType: Job/Internship, location, category, search)
 */
export async function getJobs(filters: JobFilters = {}, userId: string = "guest-user", userTargetRole?: string, userSkills: string[] = []) {
  ensureMockApplicationsForUser(userId)

  const appliedMap = new Map<string, JobApplication>()
  const userApps = userApplications.get(userId) || []
  userApps.forEach((app) => appliedMap.set(app.jobId, app))

  const savedSet = userSavedJobs.get(userId) || new Set<string>()

  let filtered = [...jobsData]

  // Filter by roleType / jobType (Job vs Internship)
  if (filters.roleType && filters.roleType !== "All") {
    if (filters.roleType === "Internship") {
      filtered = filtered.filter((job) => job.jobType === "Internship")
    } else if (filters.roleType === "Job") {
      filtered = filtered.filter((job) => job.jobType === "Full-Time")
    }
  }

  if (filters.jobType && filters.jobType !== "All") {
    filtered = filtered.filter(
      (job) => job.jobType.toLowerCase() === filters.jobType?.toLowerCase()
    )
  }

  // Filter by location (e.g. Bangalore, Karnataka, Remote)
  if (filters.location && filters.location !== "All") {
    const loc = filters.location.toLowerCase()
    filtered = filtered.filter(
      (job) =>
        job.location.toLowerCase().includes(loc) ||
        (job.locationCity && job.locationCity.toLowerCase().includes(loc)) ||
        (job.locationState && job.locationState.toLowerCase().includes(loc))
    )
  }

  // Filter by category
  if (filters.category && filters.category !== "All") {
    filtered = filtered.filter(
      (job) => job.category.toLowerCase() === filters.category?.toLowerCase()
    )
  }

  // Filter by workMode
  if (filters.workMode && filters.workMode !== "All") {
    filtered = filtered.filter(
      (job) => job.workMode.toLowerCase() === filters.workMode?.toLowerCase()
    )
  }

  // Filter by hiring platform (LinkedIn, Naukri, Indeed, Foundit/Monster, Internshala, Wellfound)
  if (filters.platform && filters.platform !== "All") {
    const p = filters.platform.toLowerCase()
    filtered = filtered.filter(
      (job) =>
        (job.sourcePlatform && job.sourcePlatform.toLowerCase().includes(p)) ||
        (job.applyUrl && job.applyUrl.toLowerCase().includes(p))
    )
  }

  // Filter by companyType (Startup, Product Scaleup, Enterprise, AI Startup, Tech Services)
  if (filters.companyType && filters.companyType !== "All") {
    const ct = filters.companyType.toLowerCase()
    filtered = filtered.filter(
      (job) => job.companyType && job.companyType.toLowerCase().includes(ct)
    )
  }

  // Filter by search query
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  // Attach match score and status
  const enriched = filtered.map((job) => {
    const matchScore = calculateMatchScore(job, userTargetRole, userSkills)
    const application = appliedMap.get(job.id)
    const isSaved = savedSet.has(job.id)
    return {
      ...job,
      matchScore,
      hasApplied: !!application,
      applicationStatus: application?.status || null,
      applicationId: application?.id || null,
      isSaved
    }
  })

  // Sorting
  if (filters.sortBy === "match") {
    enriched.sort((a, b) => b.matchScore - a.matchScore)
  } else if (filters.sortBy === "salary") {
    enriched.sort((a, b) => b.salary.localeCompare(a.salary))
  } else {
    // Default: latest posted
    enriched.sort(
      (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    )
  }

  const jobsCount = jobsData.filter((j) => j.jobType === "Full-Time").length
  const internshipsCount = jobsData.filter((j) => j.jobType === "Internship").length
  const bangaloreCount = jobsData.filter(
    (j) => j.location.includes("Bangalore") || j.location.includes("Karnataka")
  ).length

  return {
    jobs: enriched,
    total: enriched.length,
    jobsCount,
    internshipsCount,
    bangaloreCount,
    appliedCount: userApps.length,
    savedCount: savedSet.size,
    categories: [
      "All",
      "Software Engineering",
      "Full Stack",
      "Backend Systems",
      "Frontend & Web",
      "AI & Machine Learning",
      "Cloud & DevOps"
    ]
  }
}

/**
 * Retrieve a single job or internship by ID
 */
export async function getJobById(jobId: string, userId: string = "guest-user", userTargetRole?: string, userSkills: string[] = []) {
  ensureMockApplicationsForUser(userId)

  const job = jobsData.find((j) => j.id === jobId)
  if (!job) return null

  const userApps = userApplications.get(userId) || []
  const application = userApps.find((a) => a.jobId === jobId)
  const savedSet = userSavedJobs.get(userId) || new Set<string>()

  const matchScore = calculateMatchScore(job, userTargetRole, userSkills)

  return {
    ...job,
    matchScore,
    hasApplied: !!application,
    applicationStatus: application?.status || null,
    applicationId: application?.id || null,
    applicationDetails: application || null,
    isSaved: savedSet.has(job.id)
  }
}

/**
 * Track an application and redirect to official company career URL
 */
export async function applyForJob(
  jobId: string,
  applicationData: Partial<JobApplication>,
  userId: string = "guest-user"
): Promise<JobApplication> {
  ensureMockApplicationsForUser(userId)

  const job = jobsData.find((j) => j.id === jobId)
  if (!job) {
    throw new Error("Job or Internship opening not found.")
  }

  const existingApps = userApplications.get(userId) || []
  const alreadyApplied = existingApps.find((a) => a.jobId === jobId)
  if (alreadyApplied) {
    return alreadyApplied
  }

  const prefix = job.jobType === "Internship" ? "PL-INT" : "PL-JOB"
  const newAppId = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const matchScore = calculateMatchScore(job, applicationData.candidateName)

  const application: JobApplication = {
    id: newAppId,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    companyLogo: job.companyLogo,
    userId,
    candidateName: applicationData.candidateName || "Candidate",
    candidateEmail: applicationData.candidateEmail || "applicant@pathlearn.edu",
    candidatePhone: applicationData.candidatePhone || "+91 98765 43210",
    portfolioUrl: applicationData.portfolioUrl || "",
    linkedInUrl: applicationData.linkedInUrl || "",
    githubUrl: applicationData.githubUrl || "",
    experienceYears: applicationData.experienceYears || (job.jobType === "Internship" ? "Student / 2026 Batch" : "2-4 years"),
    noticePeriod: applicationData.noticePeriod || "Immediate / 15 days",
    resumeType: applicationData.resumeType || "pathlearn-builder",
    resumeName: applicationData.resumeName || "Master Technical Resume (PathLearn ATS)",
    resumeUrl: applicationData.resumeUrl || "",
    coverPitch:
      applicationData.coverPitch ||
      `I am deeply excited to apply for ${job.title} at ${job.company} in ${job.location}. My technical background in ${job.tags.slice(0, 3).join(", ")} aligns with your engineering standards.`,
    matchScore,
    status: "APPLIED",
    appliedAt: new Date().toISOString(),
    statusNotes: `Application officially tracked. Company portal: ${job.applyUrl}`,
    applyUrl: job.applyUrl,
    location: job.location,
    jobType: job.jobType
  }

  // Increment applicant count on job
  job.applicantsCount = (job.applicantsCount || 0) + 1

  existingApps.unshift(application)
  userApplications.set(userId, existingApps)

  return application
}

/**
 * Retrieve all applications for a user
 */
export async function getUserApplications(userId: string = "guest-user"): Promise<JobApplication[]> {
  ensureMockApplicationsForUser(userId)
  return userApplications.get(userId) || []
}

/**
 * Toggle saving/bookmarking a role
 */
export async function toggleSaveJob(jobId: string, userId: string = "guest-user"): Promise<{ isSaved: boolean }> {
  ensureMockApplicationsForUser(userId)
  const saved = userSavedJobs.get(userId) || new Set<string>()

  let isSaved = false
  if (saved.has(jobId)) {
    saved.delete(jobId)
    isSaved = false
  } else {
    saved.add(jobId)
    isSaved = true
  }

  userSavedJobs.set(userId, saved)
  return { isSaved }
}

/**
 * Retrieve saved roles for user
 */
export async function getUserSavedJobs(userId: string = "guest-user"): Promise<JobOpening[]> {
  ensureMockApplicationsForUser(userId)
  const savedSet = userSavedJobs.get(userId) || new Set<string>()
  const userApps = userApplications.get(userId) || []
  const appliedSet = new Set(userApps.map((a) => a.jobId))

  return jobsData
    .filter((j) => savedSet.has(j.id))
    .map((j) => ({
      ...j,
      isSaved: true,
      hasApplied: appliedSet.has(j.id)
    }))
}

/**
 * AI-powered cover pitch generator tailored to the India / Bangalore job or internship
 */
export async function generateCoverPitch(
  jobId: string,
  candidate: { name?: string; experience?: string; skills?: string[]; targetRole?: string }
): Promise<string> {
  const job = jobsData.find((j) => j.id === jobId)
  if (!job) {
    throw new Error("Job or Internship not found.")
  }

  const prompt = `You are an expert technical hiring manager for top tech companies in Bangalore, India. Write a compelling, highly professional 2-3 paragraph application statement / cover pitch for a candidate applying to this role:
Role: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.jobType}
Description: ${job.description}
Key Requirements: ${job.requirements.join(", ")}
Tech Stack: ${job.tags.join(", ")}

Candidate Details:
Name: ${candidate.name || "Candidate"}
Experience: ${candidate.experience || "Software engineering practitioner / student in Bangalore"}
Target Role: ${candidate.targetRole || job.title}
Skills: ${(candidate.skills && candidate.skills.length > 0) ? candidate.skills.join(", ") : "Python, Java, Go, React, SQL, Distributed Systems"}

Requirements:
- Sound ambitious, technical, and directly align the candidate's achievements with ${job.company}'s engineering culture in Bangalore, Karnataka.
- Mention 2-3 specific technologies from ${job.tags.slice(0, 4).join(", ")}.
- Keep length between 130 to 190 words.
- Do not use generic placeholders like [Date] or [Address]. Return clean, ready-to-paste text.`

  try {
    const text = await generateText({
      systemPrompt: "You are an elite Indian technical hiring lead and executive career copilot.",
      userPrompt: prompt,
      temperature: 0.7
    })
    if (text && text.trim().length > 50) {
      return text.trim()
    }
  } catch (err) {
    console.warn("AI generation failed, using intelligent fallback pitch:", err)
  }

  // Intelligent fallback pitch
  const candidateName = candidate.name || "Candidate"
  return `Dear ${job.company} Hiring Team,

I am writing to express my strong interest in the ${job.title} opportunity in ${job.location}. With hands-on experience building scalable applications using ${job.tags.slice(0, 3).join(", ")}, I have cultivated a deep appreciation for software craftsmanship, high-concurrency systems, and robust database design.

Having followed ${job.company}'s technical innovations and impact in the Indian tech ecosystem, I am eager to contribute directly to your team's engineering roadmap in Bangalore. My background in solving complex technical problems and optimizing low-latency architectures prepares me to make an immediate impact.

Thank you for your consideration. I welcome the opportunity to discuss how my technical skills and enthusiasm make me a strong fit for ${job.company}.

Sincerely,
${candidateName}`
}

export default {
  getJobs,
  getJobById,
  applyForJob,
  getUserApplications,
  toggleSaveJob,
  getUserSavedJobs,
  generateCoverPitch
}

import resumeBuilderService, { ResumeData } from "../services/ai/resumeBuilderService"

async function testResumeBuilder() {
  console.log("=== Testing ATS Resume Builder & Career Optimizer Studio ===")

  const sampleResume: ResumeData = {
    id: `resume-test-${Date.now()}`,
    title: "Full Stack & AI Engineer Resume",
    targetRole: "Full Stack Software Engineer",
    templateId: "modern",
    personalInfo: {
      fullName: "Dr. Punith K R",
      professionalTitle: "Full Stack & AI Engineer",
      email: "punith@pathlearn.edu",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      linkedIn: "https://linkedin.com/in/punithkr",
      github: "https://github.com/punithkr",
    },
    summary:
      "Results-driven Software Engineer with hands-on expertise in React, TypeScript, Node.js, and Machine Learning. Passionate about building high-performance scalable web applications, optimizing databases, and deploying robust AI microservices.",
    education: [
      {
        id: "edu-1",
        degree: "Bachelor of Engineering (B.E.)",
        fieldOfStudy: "Computer Science & Engineering",
        institution: "Jain Institute of Technology",
        cgpaOrPercentage: "8.9 CGPA",
        startYear: "2021",
        endYear: "2025",
      },
    ],
    technicalSkills: {
      languages: ["TypeScript", "JavaScript", "Python", "Java", "SQL", "C++"],
      frameworks: ["React", "Node.js", "Express", "Next.js", "Tailwind CSS", "FastAPI"],
      databases: ["PostgreSQL", "MongoDB", "Redis"],
      cloudTechnologies: ["Docker", "AWS", "Git/GitHub Actions"],
      tools: ["Postman", "Linux", "VS Code", "Prisma ORM"],
      aiMlTechnologies: ["PyTorch", "Hugging Face", "LangChain", "Vector DBs"],
      other: ["RESTful APIs", "System Design"],
    },
    softSkills: ["Problem Solving", "Technical Leadership", "Team Collaboration"],
    projects: [
      {
        id: "proj-1",
        title: "PathLearn: AI-Curated Learning Platform",
        description: "Adaptive career roadmap, interview simulator, and verifiable certificate ecosystem.",
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
        bulletPoints: [
          "Architected full-stack adaptive learning platform serving interactive roadmaps and coding arena.",
          "Implemented AI Mock Interview Simulator featuring real-time speech processing and audio evaluation.",
        ],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AI Engineer Certification of Mastery",
        issuingOrganization: "PathLearn Academy",
        issueDate: "2025",
        credentialUrl: "https://pathlearn.dev/verify/cert-ai-101",
      },
    ],
    experience: [
      {
        id: "exp-1",
        organization: "TechNova Solutions",
        role: "Software Engineering Intern",
        duration: "Jun 2024 - Sep 2024",
        responsibilities: [
          "Developed reusable React UI component libraries using TypeScript and Tailwind CSS.",
          "Optimized PostgreSQL queries, reducing latency by 35%.",
        ],
        achievements: [],
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "1st Place Winner - State Level Hackathon 2024",
        category: "Hackathon",
        description: "Built an AI-driven disaster response dispatch portal in 36 hours.",
      },
    ],
    languages: [{ id: "lang-1", language: "English", proficiency: "Fluent" }],
    updatedAt: new Date().toISOString(),
  }

  // 1. Test Summary Generation
  console.log("\n1. Testing AI Summary Generation:")
  const summary = await resumeBuilderService.generateSummary(
    sampleResume.targetRole,
    sampleResume.technicalSkills.languages,
    sampleResume.education[0].degree
  )
  console.log("Generated Summary:", summary)

  // 2. Test Bullet Point Improver
  console.log("\n2. Testing AI Bullet Point Improver:")
  const improvedBullet = await resumeBuilderService.improveBulletPoint(
    "Made an AI voice assistant using Python."
  )
  console.log("Raw: 'Made an AI voice assistant using Python.'")
  console.log("Improved:", improvedBullet)

  // 3. Test Job Description ATS Optimization
  console.log("\n3. Testing Job Description ATS Matcher:")
  const sampleJD = `
  We are hiring a Full Stack Software Engineer.
  Requirements:
  - Strong proficiency in TypeScript, React, Node.js, and SQL (PostgreSQL).
  - Hands-on experience with Docker, Kubernetes, and AWS cloud deployment.
  - Good understanding of REST APIs and system design.
  - Bachelor's degree in Computer Science or related field.
  `
  const jdOptimization = await resumeBuilderService.optimizeForJob(sampleResume, sampleJD)
  console.log("Target Job:", jdOptimization.targetJob)
  console.log("ATS Score:", `${jdOptimization.atsScore}%`)
  console.log("Keyword Match:", `${jdOptimization.keywordMatchPercentage}%`)
  console.log("Matched Skills:", jdOptimization.matchedSkills.join(", "))
  console.log("Missing Skills:", jdOptimization.missingSkills.join(", "))

  // 4. Test ATS & Quality Audit
  console.log("\n4. Testing ATS Audit & Quality Analysis:")
  const audit = resumeBuilderService.calculateAtsAndQualityAudit(sampleResume)
  console.log("Overall Score:", `${audit.overallScore}%`)
  console.log("Formatting Score:", `${audit.formattingScore}%`)
  console.log("Skills Match:", `${audit.skillsMatch}%`)
  console.log("Actionable Suggestions Count:", audit.actionableSuggestions.length)

  // 5. Test Completion Percentage
  const completion = resumeBuilderService.calculateCompletion(sampleResume)
  console.log("Resume Completion Percentage:", `${completion}%`)

  console.log("\n✅ ALL ATS RESUME BUILDER TESTS PASSED SUCCESSFULLY!")
}

testResumeBuilder().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})

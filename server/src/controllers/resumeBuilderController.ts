import { Request, Response } from "express"
import resumeBuilderService, { ResumeData } from "../services/ai/resumeBuilderService"
import { prisma } from "../config/database"

// In-memory fallback cache for fast resume storage per user
const resumeCache = new Map<string, ResumeData[]>()

export async function getResumesHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || "guest-user"
    let userResumes = resumeCache.get(userId) || []

    if (userResumes.length === 0) {
      // Create initial master resume from profile if available
      const user = (req as any).user
      const initialResume: ResumeData = {
        id: `resume-${Date.now()}`,
        title: "Master Technical Resume",
        targetRole: "Full Stack Software Engineer",
        templateId: "modern",
        personalInfo: {
          fullName: user?.name || "Dr. Punith K R",
          professionalTitle: "Full Stack & AI Engineer",
          email: user?.email || "punith@pathlearn.edu",
          phone: "+91 98765 43210",
          location: "Bangalore, India",
          linkedIn: "https://linkedin.com/in/punithkr",
          github: "https://github.com/punithkr",
          portfolio: "https://punith.dev",
        },
        summary:
          "Results-driven Software Engineer with hands-on expertise in React, TypeScript, Node.js, and Machine Learning. Passionate about building high-performance scalable web applications, optimizing databases, and deploying robust AI microservices.",
        education: [
          {
            id: "edu-1",
            degree: "Bachelor of Engineering (B.E.)",
            fieldOfStudy: "Computer Science & Engineering",
            institution: "Jain Institute of Technology",
            university: "VTU",
            cgpaOrPercentage: "8.9 CGPA",
            startYear: "2021",
            endYear: "2025",
          },
        ],
        technicalSkills: {
          languages: ["TypeScript", "JavaScript", "Python", "Java", "SQL", "C++"],
          frameworks: ["React", "Node.js", "Express", "Next.js", "Tailwind CSS", "FastAPI"],
          databases: ["PostgreSQL", "MongoDB", "Redis"],
          cloudTechnologies: ["Docker", "AWS", "Vercel", "Git/GitHub Actions"],
          tools: ["Postman", "Linux", "VS Code", "Prisma ORM"],
          aiMlTechnologies: ["PyTorch", "Hugging Face", "LangChain", "Vector DBs"],
          other: ["RESTful APIs", "System Design", "Agile/Scrum"],
        },
        softSkills: [
          "Problem Solving",
          "Technical Leadership",
          "Cross-functional Collaboration",
          "Continuous Learning",
          "Time Management",
        ],
        projects: [
          {
            id: "proj-1",
            title: "PathLearn: AI-Curated Learning Platform",
            description: "Full-stack adaptive career learning and roadmap platform with AI mock interviews.",
            technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
            githubUrl: "https://github.com/punithkr/pathlearn",
            demoUrl: "https://pathlearn.dev",
            bulletPoints: [
              "Architected an end-to-end learning platform serving dynamic domain roadmaps, video lessons, and verifiable certificates.",
              "Implemented an AI Mock Interview Simulator featuring real-time speech synthesis, audio processing, and avatar feedback.",
              "Engineered high-performance REST APIs with PostgreSQL and Prisma ORM, achieving sub-50ms query response times.",
            ],
          },
          {
            id: "proj-2",
            title: "IoT Smart Traffic Signal System for Emergency Vehicles",
            description: "Embedded IoT system with ESP32 microcontroller and sound sensors for emergency preemption.",
            technologies: ["Embedded C++", "ESP32", "IoT", "WebSockets", "Digital Sensors"],
            githubUrl: "https://github.com/punithkr/iot-smart-traffic",
            bulletPoints: [
              "Designed an automated siren-detection traffic controller using ESP32 and calibrated digital acoustic sensors.",
              "Developed a real-time web telemetry dashboard enabling remote manual override and emergency lane preemption.",
              "Reduced simulated emergency response clearance latency at busy 4-way intersections by 68.5%.",
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
          {
            id: "cert-2",
            name: "Full Stack Web Developer Professional",
            issuingOrganization: "PathLearn Academy",
            issueDate: "2025",
            credentialUrl: "https://pathlearn.dev/verify/cert-fs-202",
          },
        ],
        experience: [
          {
            id: "exp-1",
            organization: "TechNova Solutions",
            role: "Software Engineering Intern",
            duration: "Jun 2024 - Sep 2024",
            location: "Bangalore, India",
            responsibilities: [
              "Developed reusable React UI component libraries using TypeScript and Tailwind CSS.",
              "Optimized database indexing in PostgreSQL, reducing backend query latency by 35%.",
            ],
            achievements: [
              "Awarded Best Intern of the Quarter for delivering authentication microservice ahead of deadline.",
            ],
          },
        ],
        achievements: [
          {
            id: "ach-1",
            title: "1st Place Winner - State Level Hackathon 2024",
            category: "Hackathon",
            date: "Nov 2024",
            description: "Built an AI-driven disaster response dispatch portal in 36 hours.",
          },
        ],
        languages: [
          { id: "lang-1", language: "English", proficiency: "Fluent" },
          { id: "lang-2", language: "Kannada", proficiency: "Native" },
          { id: "lang-3", language: "Hindi", proficiency: "Professional" },
        ],
        updatedAt: new Date().toISOString(),
      }

      initialResume.atsScore = resumeBuilderService.calculateAtsAndQualityAudit(initialResume).overallScore
      initialResume.completionPercentage = resumeBuilderService.calculateCompletion(initialResume)

      userResumes = [initialResume]
      resumeCache.set(userId, userResumes)
    }

    res.json({
      success: true,
      resumes: userResumes,
    })
  } catch (error: any) {
    console.error("getResumesHandler error:", error)
    res.status(500).json({ error: "Failed to fetch resumes" })
  }
}

export async function getResumeByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || "guest-user"
    const { id } = req.params
    const resumes = resumeCache.get(userId) || []
    const resume = resumes.find((r) => r.id === id)

    if (!resume) {
      res.status(404).json({ error: "Resume not found" })
      return
    }

    res.json({
      success: true,
      resume,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch resume" })
  }
}

export async function saveResumeHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || "guest-user"
    const incoming = req.body as ResumeData

    if (!incoming || !incoming.title) {
      res.status(400).json({ error: "Resume data is required" })
      return
    }

    const resumes = resumeCache.get(userId) || []
    const atsAudit = resumeBuilderService.calculateAtsAndQualityAudit(incoming)
    const completion = resumeBuilderService.calculateCompletion(incoming)

    const updatedResume: ResumeData = {
      ...incoming,
      id: incoming.id || `resume-${Date.now()}`,
      atsScore: atsAudit.overallScore,
      completionPercentage: completion,
      updatedAt: new Date().toISOString(),
    }

    const existingIndex = resumes.findIndex((r) => r.id === updatedResume.id)
    if (existingIndex >= 0) {
      resumes[existingIndex] = updatedResume
    } else {
      resumes.unshift(updatedResume)
    }

    resumeCache.set(userId, resumes)

    res.json({
      success: true,
      resume: updatedResume,
      atsAudit,
    })
  } catch (error: any) {
    console.error("saveResumeHandler error:", error)
    res.status(500).json({ error: "Failed to save resume" })
  }
}

export async function duplicateResumeHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || "guest-user"
    const { id } = req.params
    const resumes = resumeCache.get(userId) || []
    const original = resumes.find((r) => r.id === id)

    if (!original) {
      res.status(404).json({ error: "Original resume not found" })
      return
    }

    const cloned: ResumeData = {
      ...JSON.parse(JSON.stringify(original)),
      id: `resume-${Date.now()}`,
      title: `${original.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    }

    resumes.unshift(cloned)
    resumeCache.set(userId, resumes)

    res.json({
      success: true,
      resume: cloned,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to duplicate resume" })
  }
}

export async function deleteResumeHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || "guest-user"
    const { id } = req.params
    const resumes = resumeCache.get(userId) || []
    const filtered = resumes.filter((r) => r.id !== id)

    resumeCache.set(userId, filtered)
    res.json({
      success: true,
      message: "Resume deleted successfully",
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete resume" })
  }
}

export async function generateSummaryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { targetRole, skills, education, experienceLevel } = req.body
    const summary = await resumeBuilderService.generateSummary(
      targetRole || "Software Engineer",
      Array.isArray(skills) ? skills : [],
      education || "",
      experienceLevel
    )

    res.json({
      success: true,
      summary,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate summary" })
  }
}

export async function improveBulletHandler(req: Request, res: Response): Promise<void> {
  try {
    const { text, targetRole } = req.body
    if (!text || !text.trim()) {
      res.status(400).json({ error: "Text is required" })
      return
    }

    const improved = await resumeBuilderService.improveBulletPoint(text, targetRole || "Software Engineer")
    res.json({
      success: true,
      improved,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to improve bullet point" })
  }
}

export async function optimizeForJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { resume, jobDescription } = req.body
    if (!resume || !jobDescription || !jobDescription.trim()) {
      res.status(400).json({ error: "Resume data and Job Description are required" })
      return
    }

    const result = await resumeBuilderService.optimizeForJob(resume, jobDescription.trim())
    res.json({
      success: true,
      optimization: result,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to optimize for job description" })
  }
}

export async function auditResumeHandler(req: Request, res: Response): Promise<void> {
  try {
    const { resume } = req.body
    if (!resume) {
      res.status(400).json({ error: "Resume data is required" })
      return
    }

    const audit = resumeBuilderService.calculateAtsAndQualityAudit(resume)
    res.json({
      success: true,
      audit,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to audit resume" })
  }
}

export async function importPlatformDataHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id

    let earnedCertificates: any[] = []
    if (userId && prisma) {
      try {
        const certs = await prisma.certificate.findMany({
          where: { userId, status: "ACTIVE" },
          include: { domain: true },
        })
        earnedCertificates = certs.map((c) => ({
          name: `${c.domain.name} Professional Certificate`,
          issuingOrganization: "PathLearn Academy",
          issueDate: new Date(c.issuedAt).getFullYear().toString(),
          credentialUrl: `https://pathlearn.dev/verify/${c.certificateId}`,
        }))
      } catch (err) {
        console.warn("Could not query DB certificates, using default:", err)
      }
    }

    if (earnedCertificates.length === 0) {
      earnedCertificates = [
        {
          name: "AI & Deep Learning Mastery Certification",
          issuingOrganization: "PathLearn Academy",
          issueDate: "2025",
          credentialUrl: "https://pathlearn.dev/verify/cert-ai-eng",
        },
      ]
    }

    res.json({
      success: true,
      certificates: earnedCertificates,
    })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to import platform data" })
  }
}

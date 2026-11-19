import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const domains = [
  {
    name: "AI Engineer",
    slug: "ai-engineer",
    description: "Master modern artificial intelligence, deep learning architectures, Large Language Models, RAG, AI agents, and production MLOps.",
    icon: "Brain",
    difficulty: "ADVANCED" as const,
    estimatedDays: 75,
    skillTags: ["Python for AI", "PyTorch", "Transformers", "LLMs", "RAG", "AI Agents", "LangChain", "MLOps"],
  },
  {
    name: "Machine Learning Engineer",
    slug: "machine-learning-engineer",
    description: "Learn statistical modeling, feature engineering, supervised and unsupervised learning, ensemble methods, and production model deployment.",
    icon: "Brain",
    difficulty: "INTERMEDIATE" as const,
    estimatedDays: 60,
    skillTags: ["Python", "Statistics", "Scikit-Learn", "Feature Engineering", "Ensemble Methods", "Deep Learning", "Model Deployment"],
  },
  {
    name: "Data Scientist",
    slug: "data-scientist",
    description: "Derive deep predictive insights through statistical hypothesis testing, exploratory data analysis, machine learning algorithms, and storytelling.",
    icon: "BarChart3",
    difficulty: "INTERMEDIATE" as const,
    estimatedDays: 60,
    skillTags: ["Pandas", "NumPy", "Statistical Inference", "Predictive Modeling", "Seaborn", "Feature Selection", "SQL for Data Science"],
  },
  {
    name: "Data Analyst",
    slug: "data-analyst",
    description: "Transform raw organizational data into actionable dashboards, executive reports, and business intelligence metrics using SQL, PowerBI, and Python.",
    icon: "BarChart3",
    difficulty: "BEGINNER" as const,
    estimatedDays: 45,
    skillTags: ["SQL Queries", "Excel / Sheets", "Tableau", "Power BI", "Data Cleaning", "KPI Dashboards", "Exploratory Analytics"],
  },
  {
    name: "Python Developer",
    slug: "python-developer",
    description: "Master Python fundamentals, object-oriented design patterns, concurrency, asynchronous APIs, database integrations, and automated testing.",
    icon: "Code2",
    difficulty: "BEGINNER" as const,
    estimatedDays: 40,
    skillTags: ["Python 3", "Object-Oriented Design", "Data Structures", "FastAPI", "AsyncIO", "Unit Testing", "Database ORM"],
  },
  {
    name: "Web Developer",
    slug: "web-developer",
    description: "Build scalable, responsive full-stack web applications from scratch using modern React, TypeScript, Node.js, Express, and PostgreSQL.",
    icon: "Globe",
    difficulty: "BEGINNER" as const,
    estimatedDays: 50,
    skillTags: ["HTML & Modern CSS", "JavaScript ES6+", "TypeScript", "React", "Node.js & Express", "Tailwind CSS", "RESTful APIs"],
  },
  {
    name: "Generative AI Engineer",
    slug: "generative-ai-engineer",
    description: "Specialize in state-of-the-art Generative AI, advanced prompt engineering, embeddings, vector search, LangChain/LlamaIndex, and AI agent architectures.",
    icon: "Sparkles",
    difficulty: "ADVANCED" as const,
    estimatedDays: 70,
    skillTags: ["Prompt Engineering", "OpenAI / Claude APIs", "LangChain", "Vector Databases", "Embeddings", "Agentic Workflows", "Fine-Tuning"],
  },
]

async function main() {
  console.log("Seeding domains...")
  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: domain,
      create: domain,
    })
  }
  console.log(`Successfully seeded ${domains.length} production domains.`)
}

main()
  .catch((e) => {
    console.error("Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

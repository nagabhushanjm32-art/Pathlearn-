import api from "./api"
import { Domain } from "../types"

const defaultZeroDomains: Domain[] = [
  {
    id: "ai-engineer",
    slug: "ai-engineer",
    name: "AI Engineer",
    description: "Master modern artificial intelligence, deep learning architectures, Large Language Models, RAG, AI agents, and production MLOps.",
    icon: "Brain",
    difficulty: "ADVANCED",
    estimatedDays: 75,
    progress: 0,
    totalSteps: 12,
    completedSteps: 0,
    skillTags: ["Python for AI", "PyTorch", "Transformers", "LLMs", "RAG", "AI Agents", "LangChain", "MLOps"],
    targetRoles: ["AI Engineer", "GenAI Specialist", "AI Research Engineer"],
  },
  {
    name: "Machine Learning Engineer",
    id: "machine-learning-engineer",
    slug: "machine-learning-engineer",
    description: "Learn statistical modeling, feature engineering, supervised and unsupervised learning, ensemble methods, and production model deployment.",
    icon: "Brain",
    difficulty: "INTERMEDIATE",
    estimatedDays: 60,
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillTags: ["Python", "Statistics", "Scikit-Learn", "Feature Engineering", "Ensemble Methods", "Deep Learning", "Model Deployment"],
    targetRoles: ["ML Engineer", "Data Scientist", "Applied Scientist"],
  },
  {
    name: "Data Scientist",
    id: "data-scientist",
    slug: "data-scientist",
    description: "Derive deep predictive insights through statistical hypothesis testing, exploratory data analysis, machine learning algorithms, and storytelling.",
    icon: "BarChart3",
    difficulty: "INTERMEDIATE",
    estimatedDays: 60,
    progress: 0,
    totalSteps: 12,
    completedSteps: 0,
    skillTags: ["Pandas", "NumPy", "Statistical Inference", "Predictive Modeling", "Seaborn", "Feature Selection", "SQL for Data Science"],
    targetRoles: ["Data Scientist", "Analytics Lead", "Quantitative Analyst"],
  },
  {
    name: "Data Analyst",
    id: "data-analyst",
    slug: "data-analyst",
    description: "Transform raw organizational data into actionable dashboards, executive reports, and business intelligence metrics using SQL, PowerBI, and Python.",
    icon: "BarChart3",
    difficulty: "BEGINNER",
    estimatedDays: 45,
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillTags: ["SQL Queries", "Excel / Sheets", "Tableau", "Power BI", "Data Cleaning", "KPI Dashboards", "Exploratory Analytics"],
    targetRoles: ["Data Analyst", "BI Specialist", "Business Analyst"],
  },
  {
    name: "Python Developer",
    id: "python-developer",
    slug: "python-developer",
    description: "Master Python fundamentals, object-oriented design patterns, concurrency, asynchronous APIs, database integrations, and automated testing.",
    icon: "Code2",
    difficulty: "BEGINNER",
    estimatedDays: 40,
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillTags: ["Python 3", "Object-Oriented Design", "Data Structures", "FastAPI", "AsyncIO", "Unit Testing", "Database ORM"],
    targetRoles: ["Python Developer", "Backend Engineer", "Software Engineer"],
  },
  {
    name: "Web Developer",
    id: "web-developer",
    slug: "web-developer",
    description: "Build scalable, responsive full-stack web applications from scratch using modern React, TypeScript, Node.js, Express, and PostgreSQL.",
    icon: "Globe",
    difficulty: "BEGINNER",
    estimatedDays: 50,
    progress: 0,
    totalSteps: 12,
    completedSteps: 0,
    skillTags: ["HTML & Modern CSS", "JavaScript ES6+", "TypeScript", "React", "Node.js & Express", "Tailwind CSS", "RESTful APIs"],
    targetRoles: ["Frontend Developer", "Full Stack Developer", "Web Engineer"],
  },
  {
    name: "Generative AI Engineer",
    id: "generative-ai-engineer",
    slug: "generative-ai-engineer",
    description: "Specialize in state-of-the-art Generative AI, advanced prompt engineering, embeddings, vector search, LangChain/LlamaIndex, and AI agent architectures.",
    icon: "Sparkles",
    difficulty: "ADVANCED",
    estimatedDays: 70,
    progress: 0,
    totalSteps: 12,
    completedSteps: 0,
    skillTags: ["Prompt Engineering", "OpenAI / Claude APIs", "LangChain", "Vector Databases", "Embeddings", "Agentic Workflows", "Fine-Tuning"],
    targetRoles: ["Generative AI Engineer", "LLM Solutions Architect", "AI Product Engineer"],
  },
]

export const domainService = {
  async getDomains(): Promise<Domain[]> {
    try {
      const res = await api.get("/domains")
      return res.data.domains || defaultZeroDomains
    } catch {
      return defaultZeroDomains
    }
  },

  async getDomainBySlug(slug: string): Promise<Domain | undefined> {
    try {
      const res = await api.get(`/domains/${slug}`)
      return res.data.domain
    } catch {
      return defaultZeroDomains.find((d) => d.slug === slug || d.id === slug)
    }
  },
}

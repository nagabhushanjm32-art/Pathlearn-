import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const domains = [
  {
    name: "Python",
    slug: "python",
    description: "Master Python from fundamentals to advanced concepts, building a strong foundation for any tech career.",
    icon: "Code2",
    difficulty: "BEGINNER" as const,
    estimatedDays: 30,
    skillTags: ["Python", "OOP", "Scripting", "Automation"],
  },
  {
    name: "Data Structures & Algorithms",
    slug: "dsa",
    description: "Build strong problem-solving skills with core data structures and algorithms — essential for technical interviews.",
    icon: "GitBranch",
    difficulty: "INTERMEDIATE" as const,
    estimatedDays: 45,
    skillTags: ["Arrays", "Trees", "Graphs", "Dynamic Programming"],
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    description: "Learn the theory and practice of machine learning, from linear regression to neural networks.",
    icon: "Brain",
    difficulty: "INTERMEDIATE" as const,
    estimatedDays: 50,
    skillTags: ["Supervised Learning", "Neural Networks", "scikit-learn", "Model Evaluation"],
  },
  {
    name: "Data Analytics",
    slug: "data-analytics",
    description: "Turn raw data into actionable insights using statistical analysis, visualization, and SQL.",
    icon: "BarChart3",
    difficulty: "BEGINNER" as const,
    estimatedDays: 35,
    skillTags: ["SQL", "Excel", "Data Visualization", "Statistics"],
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Build modern, responsive web applications from the ground up using React and Node.js.",
    icon: "Globe",
    difficulty: "BEGINNER" as const,
    estimatedDays: 40,
    skillTags: ["React", "Node.js", "REST APIs", "Responsive Design"],
  },
]

async function main() {
  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: domain,
      create: domain,
    })
  }
  console.log(`Seeded ${domains.length} domains`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

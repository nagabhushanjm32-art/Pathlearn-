import { generateJSON } from "./aiService"
import { aiRoadmapResponseSchema } from "../../validators/roadmapValidator"

interface GenerateRoadmapParams {
  domainName: string
  domainDescription: string
  level: string | null
  goal: string | null
  studyTimePerDay: string | null
}

export async function generateRoadmap(params: GenerateRoadmapParams) {
  const { domainName, domainDescription, level, goal, studyTimePerDay } = params

  const prompt = `You are an expert technical curriculum designer creating an industry-leading learning roadmap for a student.

Domain: ${domainName}
Domain description: ${domainDescription}
Learner's current level: ${level || "BEGINNER"}
Learner's goal: ${goal || "JOB_READY"}
Learner's study time: ${studyTimePerDay || "ONE_HOUR"}

Generate a structured learning roadmap with 10 to 14 sequential steps/topics that take the learner from fundamentals to advanced engineering and technical interview readiness in ${domainName}. Each step must build logically upon prior steps.

Respond with ONLY valid JSON in this exact structure, no markdown outside JSON:

{
  "steps": [
    {
      "title": "Topic Name",
      "description": "1-2 sentence description of what this step covers and why it is critical.",
      "difficulty": "BEGINNER",
      "estimatedMinutes": 45,
      "prerequisites": [],
      "learningObjectives": [
        "First concrete objective",
        "Second concrete objective",
        "Third concrete objective"
      ],
      "skillsGained": ["Skill 1", "Skill 2", "Skill 3"],
      "interviewRelevance": "How this concept is evaluated during technical interviews."
    }
  ]
}`

  try {
    const rawResponse = await generateJSON(prompt)
    let parsed: unknown
    try {
      const cleanJson = rawResponse.replace(/```json\s*|\s*```/g, "").trim()
      parsed = JSON.parse(cleanJson)
    } catch {
      throw new Error("AI returned invalid JSON")
    }

    const validated = aiRoadmapResponseSchema.safeParse(parsed)
    if (!validated.success) {
      console.warn("AI roadmap validation issue:", validated.error.flatten())
      return getDomainTemplateRoadmap(domainName)
    }

    return validated.data.steps
  } catch (error) {
    console.error("AI roadmap generation using domain curriculum template:", error)
    return getDomainTemplateRoadmap(domainName)
  }
}

/**
 * High-quality, industry-standard curriculums for all 7 engineering tracks
 */
export function getDomainTemplateRoadmap(domainName: string) {
  const normalized = domainName.toLowerCase()

  // 1. AI ENGINEER (14 Steps)
  if (normalized.includes("ai engineer") || normalized === "ai-engineer") {
    return [
      {
        title: "Python for AI & Scientific Computing",
        description: "Master Python fundamentals, NumPy array vectorization, and data structures essential for AI development.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Understand array broadcasting", "Write vectorized calculations", "Implement modular code"],
        skillsGained: ["Python 3", "NumPy", "Vectorization"],
        interviewRelevance: "Vectorized operations and time complexity are frequently evaluated in coding rounds.",
      },
      {
        title: "Mathematics & Linear Algebra for AI",
        description: "Explore matrix decompositions, eigenvalues, gradients, and multivariable calculus for neural networks.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 50,
        prerequisites: ["Python for AI & Scientific Computing"],
        learningObjectives: ["Calculate matrix transformations", "Compute loss gradients", "Understand tensor dimensions"],
        skillsGained: ["Linear Algebra", "Calculus", "Probability"],
        interviewRelevance: "Theoretical foundations behind optimization and backpropagation.",
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Learn supervised and unsupervised learning algorithms, cost functions, and validation techniques.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 55,
        prerequisites: ["Mathematics & Linear Algebra for AI"],
        learningObjectives: ["Train regression & classification models", "Perform k-fold cross validation", "Evaluate bias vs variance"],
        skillsGained: ["Scikit-Learn", "Model Evaluation", "Cross-Validation"],
        interviewRelevance: "Underfitting vs overfitting and evaluation metrics (Precision, Recall, F1, ROC-AUC).",
      },
      {
        title: "Deep Learning & Neural Architectures",
        description: "Build multi-layer perceptrons, activation functions, backpropagation algorithms, and PyTorch tensors.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Machine Learning Fundamentals"],
        learningObjectives: ["Implement custom PyTorch modules", "Configure Adam/SGD optimizers", "Prevent gradient vanishing"],
        skillsGained: ["PyTorch", "Backpropagation", "Neural Networks"],
        interviewRelevance: "Deep learning fundamentals and custom loss functions.",
      },
      {
        title: "Natural Language Processing (NLP)",
        description: "Tokenization, word embeddings (Word2Vec, FastText), recurrent networks, and sequence-to-sequence models.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Deep Learning & Neural Architectures"],
        learningObjectives: ["Build tokenizers and vocabularies", "Train RNN / LSTM sequence models", "Evaluate BLEU and ROUGE metrics"],
        skillsGained: ["NLP", "Tokenization", "Word Embeddings", "LSTMs"],
        interviewRelevance: "Sequence modeling and text preprocessing trade-offs.",
      },
      {
        title: "Transformer Architecture & Self-Attention",
        description: "Demystify scaled dot-product attention, multi-head attention mechanisms, positional encodings, and BERT/GPT.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 65,
        prerequisites: ["Natural Language Processing (NLP)"],
        learningObjectives: ["Implement scaled dot-product attention", "Understand encoder-decoder vs decoder-only models", "Analyze O(N^2) complexity"],
        skillsGained: ["Transformers", "Self-Attention", "BERT", "GPT"],
        interviewRelevance: "Transformers are the core architecture tested in modern AI engineering interviews.",
      },
      {
        title: "Large Language Models & Fine-Tuning",
        description: "Pre-training vs fine-tuning, PEFT, LoRA, QLoRA, and quantization strategies (4-bit, 8-bit).",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 60,
        prerequisites: ["Transformer Architecture & Self-Attention"],
        learningObjectives: ["Fine-tune open-weights models with LoRA", "Apply model quantization", "Benchmark inference latency"],
        skillsGained: ["LLMs", "LoRA / QLoRA", "Hugging Face", "Quantization"],
        interviewRelevance: "Trade-offs between full fine-tuning, parameter-efficient fine-tuning, and prompting.",
      },
      {
        title: "Prompt Engineering & Structured Outputs",
        description: "Master Few-Shot, Chain-of-Thought, ReAct pattern, system prompt hardening, and JSON schema constraints.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 40,
        prerequisites: ["Large Language Models & Fine-Tuning"],
        learningObjectives: ["Design deterministic JSON prompts", "Implement Chain-of-Thought reasoning", "Guard against prompt injections"],
        skillsGained: ["Prompt Engineering", "Structured JSON", "Security Guardrails"],
        interviewRelevance: "Prompt reliability and schema adherence in production services.",
      },
      {
        title: "Retrieval-Augmented Generation (RAG)",
        description: "Chunking strategies, dense/sparse embeddings, vector database indexing, hybrid search, and reranking.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 65,
        prerequisites: ["Prompt Engineering & Structured Outputs"],
        learningObjectives: ["Build an end-to-end RAG pipeline", "Implement chunking and vector indexing", "Apply cross-encoder rerankers"],
        skillsGained: ["RAG", "Vector Databases", "Embeddings", "Reranking"],
        interviewRelevance: "Enterprise search, context window limitations, and RAG evaluation (Ragas/TruLens).",
      },
      {
        title: "Autonomous AI Agents & Tool Calling",
        description: "Build goal-driven autonomous agents with memory, planning modules, function calling, and multi-agent coordination.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 70,
        prerequisites: ["Retrieval-Augmented Generation (RAG)"],
        learningObjectives: ["Implement tool execution loops", "Manage persistent agent memory", "Coordinate multi-agent state machines"],
        skillsGained: ["AI Agents", "Tool Calling", "LangGraph", "Multi-Agent Systems"],
        interviewRelevance: "Agentic control loops, error recovery, and loop termination safeguards.",
      },
      {
        title: "LangChain & Agent Orchestration Frameworks",
        description: "Orchestrate complex generative workflows, chains, document loaders, and semantic caching using LangChain & LlamaIndex.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Autonomous AI Agents & Tool Calling"],
        learningObjectives: ["Build composable LCEL chains", "Integrate vector stores and document retrievers", "Implement semantic cache"],
        skillsGained: ["LangChain", "LlamaIndex", "LCEL", "Semantic Caching"],
        interviewRelevance: "Architectural patterns for production LLM application pipelines.",
      },
      {
        title: "Model Deployment & Inference Optimization",
        description: "Serve models with vLLM, TensorRT-LLM, streaming WebSockets, continuous batching, and KV-cache optimization.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["LangChain & Agent Orchestration Frameworks"],
        learningObjectives: ["Deploy models with vLLM", "Configure continuous batching and PagedAttention", "Implement streaming token APIs"],
        skillsGained: ["vLLM", "Model Serving", "KV Cache", "FastAPI"],
        interviewRelevance: "High-throughput inference optimization and GPU memory bandwidth bottlenecks.",
      },
      {
        title: "MLOps, Monitoring & AI Evaluation",
        description: "Set up CI/CD pipelines, track data drift, log LLM traces with OpenTelemetry, and deploy evaluation harnesses.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 50,
        prerequisites: ["Model Deployment & Inference Optimization"],
        learningObjectives: ["Implement LLM observability traces", "Monitor drift and hallucination rates", "Automate regression testing for AI"],
        skillsGained: ["MLOps", "Observability", "Evaluation Harnesses", "CI/CD"],
        interviewRelevance: "Production reliability, monitoring KPIs, and automated evaluation frameworks.",
      },
      {
        title: "Full-Scale AI Engineering Capstone Project",
        description: "Architect and deliver an end-to-end production AI system incorporating RAG, multi-agent workflows, and live monitoring.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 80,
        prerequisites: ["MLOps, Monitoring & AI Evaluation"],
        learningObjectives: ["Integrate multi-tier AI architectures", "Enforce latency SLAs and fallback logic", "Deliver production-ready deliverables"],
        skillsGained: ["System Design", "Production Architecture", "Full-Stack AI"],
        interviewRelevance: "Comprehensive AI system design interviews and portfolio presentation.",
      },
    ]
  }

  // 2. MACHINE LEARNING ENGINEER (10 Steps)
  if (normalized.includes("machine learning") || normalized === "machine-learning-engineer") {
    return [
      {
        title: "Python for Data & Machine Learning",
        description: "Essential Python idioms, NumPy matrix manipulation, and Pandas dataframes for ML pipelines.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Vectorize matrix computations", "Clean structured dataframes", "Build reproducible workflows"],
        skillsGained: ["Python", "NumPy", "Pandas"],
        interviewRelevance: "Coding proficiency with vectorized operations and data structures.",
      },
      {
        title: "Applied Statistics & Probability",
        description: "Probability distributions, central limit theorem, hypothesis testing, p-values, and confidence intervals.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 50,
        prerequisites: ["Python for Data & Machine Learning"],
        learningObjectives: ["Perform A/B hypothesis tests", "Evaluate distribution skewness", "Calculate conditional probabilities"],
        skillsGained: ["Statistics", "Hypothesis Testing", "Probability"],
        interviewRelevance: "Statistical intuition and A/B testing methodology are standard interview questions.",
      },
      {
        title: "Data Preprocessing & Feature Engineering",
        description: "Imputation strategies, categorical encoding, feature scaling, outlier detection, and transformation pipelines.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Applied Statistics & Probability"],
        learningObjectives: ["Build Scikit-Learn Pipelines and ColumnTransformers", "Engineer interaction features", "Prevent data leakage"],
        skillsGained: ["Feature Engineering", "Data Preprocessing", "Pipeline Design"],
        interviewRelevance: "Preventing data leakage between train/test splits is a top interview filter.",
      },
      {
        title: "Supervised Learning: Regression & Classification",
        description: "Linear/Logistic Regression, Decision Trees, Support Vector Machines, Naive Bayes, and k-NN.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Data Preprocessing & Feature Engineering"],
        learningObjectives: ["Derive gradient descent updates", "Tune regularizers (L1/L2)", "Evaluate multi-class confusion matrices"],
        skillsGained: ["Linear Models", "Decision Trees", "SVM", "Scikit-Learn"],
        interviewRelevance: "Mathematical derivations of loss functions and bias-variance trade-off.",
      },
      {
        title: "Ensemble Methods & Gradient Boosting",
        description: "Bagging vs Boosting, Random Forests, XGBoost, LightGBM, CatBoost, and hyperparameter optimization.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Supervised Learning: Regression & Classification"],
        learningObjectives: ["Train XGBoost and LightGBM models", "Tune learning rates and tree depths with Optuna", "Analyze feature importance"],
        skillsGained: ["XGBoost", "LightGBM", "Random Forest", "Optuna"],
        interviewRelevance: "Tree-based gradient boosting algorithms dominate tabular ML interviews.",
      },
      {
        title: "Unsupervised Learning & Dimensionality Reduction",
        description: "K-Means, DBSCAN, Hierarchical clustering, PCA, t-SNE, and UMAP.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Ensemble Methods & Gradient Boosting"],
        learningObjectives: ["Select optimal cluster count using Silhouette analysis", "Compute principal components", "Reduce high-dimensional feature spaces"],
        skillsGained: ["Clustering", "PCA", "Dimensionality Reduction"],
        interviewRelevance: "Explaining variance explained in PCA and clustering metric interpretations.",
      },
      {
        title: "Model Evaluation & Diagnostic Metrics",
        description: "ROC-AUC, Precision-Recall curves, Log-Loss, cross-validation schemes, and calibration curves.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 45,
        prerequisites: ["Unsupervised Learning & Dimensionality Reduction"],
        learningObjectives: ["Interpret PR curves on imbalanced datasets", "Calibrate model probabilities", "Design stratified time-series splits"],
        skillsGained: ["Model Diagnostics", "Metric Selection", "Probability Calibration"],
        interviewRelevance: "Choosing appropriate evaluation metrics under severe class imbalance.",
      },
      {
        title: "Deep Learning Fundamentals & PyTorch",
        description: "Feedforward neural nets, backpropagation, batch normalization, dropout, and learning rate schedulers.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 65,
        prerequisites: ["Model Evaluation & Diagnostic Metrics"],
        learningObjectives: ["Build custom PyTorch training loops", "Implement regularizations", "Diagnose training loss instabilities"],
        skillsGained: ["PyTorch", "Deep Learning", "Optimization"],
        interviewRelevance: "PyTorch architecture and training debugging strategies.",
      },
      {
        title: "Model Packaging & Production Deployment",
        description: "Serialize models (ONNX, TorchScript), build FastAPI inference endpoints, Dockerize services, and deploy to Kubernetes.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 60,
        prerequisites: ["Deep Learning Fundamentals & PyTorch"],
        learningObjectives: ["Export models to ONNX runtime", "Create asynchronous FastAPI prediction endpoints", "Containerize inference apps with Docker"],
        skillsGained: ["FastAPI", "ONNX", "Docker", "Model Deployment"],
        interviewRelevance: "Production latency, containerization, and API design for ML systems.",
      },
      {
        title: "MLOps: CI/CD, Feature Stores & Monitoring",
        description: "Automated training pipelines, data drift detection (Evidently AI), MLflow experiment tracking, and Feast feature stores.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Model Packaging & Production Deployment"],
        learningObjectives: ["Track model experiments with MLflow", "Detect covariate shift and concept drift", "Automate retraining triggers"],
        skillsGained: ["MLflow", "Data Drift Monitoring", "CI/CD", "Feature Stores"],
        interviewRelevance: "End-to-end MLOps lifecycle and handling data drift in production.",
      },
    ]
  }

  // 3. DATA SCIENTIST (10 Steps)
  if (normalized.includes("data scientist") || normalized === "data-scientist") {
    return [
      {
        title: "Python for Data Science & Numerical Computing",
        description: "Master Pandas dataframe wrangling, NumPy vectorization, and data structuring.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Perform multi-index aggregation", "Handle missing values cleanly", "Optimize dataframe memory footprint"],
        skillsGained: ["Python", "Pandas", "NumPy"],
        interviewRelevance: "Pandas manipulation coding questions and data restructuring.",
      },
      {
        title: "Advanced SQL & Relational Analytics",
        description: "Window functions, CTEs, self-joins, aggregations, and query optimization for analytical databases.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 50,
        prerequisites: ["Python for Data Science & Numerical Computing"],
        learningObjectives: ["Write complex window calculations (RANK, LEAD, LAG)", "Design multi-tier CTEs", "Optimize query execution plans"],
        skillsGained: ["SQL", "Window Functions", "CTEs", "Database Analytics"],
        interviewRelevance: "SQL window functions are universally tested in live data science interviews.",
      },
      {
        title: "Exploratory Data Analysis (EDA) & Visualization",
        description: "Uncover patterns, anomalies, and correlations with Seaborn, Matplotlib, and interactive Plotly.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["Advanced SQL & Relational Analytics"],
        learningObjectives: ["Generate distribution and correlation heatmaps", "Detect bivariate relationships", "Communicate visual insights"],
        skillsGained: ["EDA", "Data Visualization", "Seaborn", "Plotly"],
        interviewRelevance: "Explaining data distributions and identifying hidden anomalies.",
      },
      {
        title: "Inferential Statistics & A/B Testing",
        description: "Parametric & non-parametric tests, p-value interpretation, sample size determination, and experimental design.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Exploratory Data Analysis (EDA) & Visualization"],
        learningObjectives: ["Design power calculations for A/B tests", "Perform t-tests, ANOVA, and Chi-square tests", "Control for Type I and Type II errors"],
        skillsGained: ["Hypothesis Testing", "A/B Testing", "Experimental Design"],
        interviewRelevance: "A/B testing case studies and sample size estimation formulas.",
      },
      {
        title: "Feature Engineering & Dimensionality Reduction",
        description: "Target encoding, polynomial features, variance inflation factor (VIF), PCA, and t-SNE.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Inferential Statistics & A/B Testing"],
        learningObjectives: ["Eliminate multicollinearity with VIF", "Apply PCA dimensionality reduction", "Engineer temporal and interaction features"],
        skillsGained: ["Feature Selection", "PCA", "Multicollinearity Handling"],
        interviewRelevance: "Feature importance interpretation and handling high-cardinality data.",
      },
      {
        title: "Supervised Predictive Modeling",
        description: "Linear/Logistic Regression, Random Forest, XGBoost, and hyperparameter tuning with cross-validation.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Feature Engineering & Dimensionality Reduction"],
        learningObjectives: ["Train cross-validated XGBoost models", "Optimize hyperparameters with Optuna", "Analyze SHAP feature importance values"],
        skillsGained: ["Scikit-Learn", "XGBoost", "SHAP Values", "Cross-Validation"],
        interviewRelevance: "Model interpretability using SHAP values and feature attribution.",
      },
      {
        title: "Time Series Analysis & Forecasting",
        description: "Stationarity tests (ADF), ARIMA, SARIMAX, Prophet, and exponential smoothing.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Supervised Predictive Modeling"],
        learningObjectives: ["Decompose trend and seasonality", "Achieve stationarity with differencing", "Evaluate MAPE and RMSE metrics"],
        skillsGained: ["Time Series", "ARIMA", "Prophet", "Forecasting"],
        interviewRelevance: "Seasonality modeling and backtesting time-series without lookahead bias.",
      },
      {
        title: "Unsupervised Learning & Customer Segmentation",
        description: "K-Means, Hierarchical Clustering, DBSCAN, and RFM (Recency, Frequency, Monetary) modeling.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Time Series Analysis & Forecasting"],
        learningObjectives: ["Perform RFM customer segmentation", "Determine optimal clusters using silhouette analysis", "Map personas to business outcomes"],
        skillsGained: ["Clustering", "RFM Modeling", "Customer Segmentation"],
        interviewRelevance: "Business case studies on segmentation and retention optimization.",
      },
      {
        title: "Business Translation & Executive Storytelling",
        description: "Translate statistical findings into revenue impact, executive slide decks, and strategic recommendations.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 40,
        prerequisites: ["Unsupervised Learning & Customer Segmentation"],
        learningObjectives: ["Quantify ROI and monetary business impact", "Structure executive-ready narratives", "Present uncertainty effectively"],
        skillsGained: ["Business Storytelling", "Executive Communication", "ROI Estimation"],
        interviewRelevance: "Behavioral and product-sense interviews for senior data scientists.",
      },
      {
        title: "End-to-End Data Science Portfolio Capstone",
        description: "Build, validate, containerize, and present a complete predictive analytics pipeline on real-world datasets.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 75,
        prerequisites: ["Business Translation & Executive Storytelling"],
        learningObjectives: ["Deliver end-to-end data product", "Document methodology and trade-offs", "Package analysis for stakeholder review"],
        skillsGained: ["Portfolio Capstone", "Full Pipeline", "Stakeholder Delivery"],
        interviewRelevance: "Technical portfolio defense and deep-dive interview discussions.",
      },
    ]
  }

  // 4. DATA ANALYST (8 Steps)
  if (normalized.includes("data analyst") || normalized === "data-analyst") {
    return [
      {
        title: "Advanced Spreadsheet & Excel Modeling",
        description: "Master INDEX/MATCH, XLOOKUP, Pivot Tables, power query, and dynamic dashboard creation.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 40,
        prerequisites: [],
        learningObjectives: ["Build dynamic financial models", "Automate data transformation with Power Query", "Design interactive pivot charts"],
        skillsGained: ["Excel", "XLOOKUP", "Pivot Tables", "Power Query"],
        interviewRelevance: "Basic data manipulation and business model spreadsheet tests.",
      },
      {
        title: "SQL Fundamentals for Data Extraction",
        description: "SELECT queries, WHERE filtering, GROUP BY aggregations, and relational INNER/LEFT JOINs.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["Advanced Spreadsheet & Excel Modeling"],
        learningObjectives: ["Write multi-table relational queries", "Calculate grouped summary metrics", "Filter nulls and duplicates"],
        skillsGained: ["SQL Basics", "JOINs", "Aggregations", "Filtering"],
        interviewRelevance: "Core SQL querying screening rounds for analyst roles.",
      },
      {
        title: "Advanced SQL & Analytical Functions",
        description: "Window functions (ROW_NUMBER, DENSE_RANK, SUM OVER), Common Table Expressions, and subqueries.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["SQL Fundamentals for Data Extraction"],
        learningObjectives: ["Calculate running totals and moving averages", "Rank cohorts using window partitions", "Simplify nested logic with CTEs"],
        skillsGained: ["Window Functions", "CTEs", "Cohort Analysis", "SQL"],
        interviewRelevance: "Intermediate and advanced SQL technical assessments.",
      },
      {
        title: "Data Cleaning & Quality Assurance",
        description: "Detect anomalies, standardize date formats, resolve missing records, and prevent schema drift.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 40,
        prerequisites: ["Advanced SQL & Analytical Functions"],
        learningObjectives: ["Standardize messy text and datetime columns", "Reconcile discrepancies between data sources", "Implement data validation rules"],
        skillsGained: ["Data Quality", "Data Cleansing", "Validation Rules"],
        interviewRelevance: "Explaining how you ensure analytical numbers match audited truth.",
      },
      {
        title: "Business Intelligence & Tableau / Power BI Dashboards",
        description: "Design intuitive executive dashboards with DAX calculations, interactive filters, and drill-downs.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Data Cleaning & Quality Assurance"],
        learningObjectives: ["Write custom DAX measures", "Implement cross-filtering and drill-through pages", "Apply user-centric dashboard design principles"],
        skillsGained: ["Power BI", "Tableau", "DAX", "Dashboard UI"],
        interviewRelevance: "Portfolio review and dashboard UX design rationale.",
      },
      {
        title: "Key Business Metrics & Product Analytics",
        description: "Analyze CAC, LTV, Churn Rate, Retention Cohorts, Conversion Funnels, and ARR/MRR.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 45,
        prerequisites: ["Business Intelligence & Tableau / Power BI Dashboards"],
        learningObjectives: ["Build retention cohort matrices", "Calculate customer lifetime value (LTV)", "Identify funnel drop-off stages"],
        skillsGained: ["Product Analytics", "SaaS Metrics", "Cohort Retention", "Funnel Analysis"],
        interviewRelevance: "Product-sense and business case interview questions.",
      },
      {
        title: "Python for Exploratory Analytics & Automation",
        description: "Automate repetitive reporting tasks and create statistical charts with Pandas and Seaborn.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["Key Business Metrics & Product Analytics"],
        learningObjectives: ["Automate recurring spreadsheet generation with Python", "Plot statistical distributions", "Perform correlation analysis"],
        skillsGained: ["Python", "Pandas", "Automation", "Seaborn"],
        interviewRelevance: "Demonstrating automation and modern tooling efficiency.",
      },
      {
        title: "Executive Business Report & Presentation Capstone",
        description: "Synthesize insights into an executive-ready presentation with actionable revenue recommendations.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Python for Exploratory Analytics & Automation"],
        learningObjectives: ["Draft an executive summary memo", "Support findings with data visualizations", "Recommend prioritized strategic initiatives"],
        skillsGained: ["Executive Reporting", "Strategic Communication", "Data Storytelling"],
        interviewRelevance: "Final-round presentation of case study datasets to hiring managers.",
      },
    ]
  }

  // 5. PYTHON DEVELOPER (10 Steps)
  if (normalized.includes("python developer") || normalized === "python-developer") {
    return [
      {
        title: "Python 3 Syntax & Idiomatic Fundamentals",
        description: "Core data types, comprehensions, generators, decorators, context managers, and memory model.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Write memory-efficient generator expressions", "Implement custom function decorators", "Utilize context managers (with statement)"],
        skillsGained: ["Python 3", "Generators", "Decorators", "Context Managers"],
        interviewRelevance: "Python language mechanics and generator memory efficiency questions.",
      },
      {
        title: "Object-Oriented Design & Design Patterns in Python",
        description: "Classes, inheritance, polymorphism, abstract base classes, and SOLID principles in Python.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Python 3 Syntax & Idiomatic Fundamentals"],
        learningObjectives: ["Implement Factory and Singleton patterns", "Use typing and abstract base classes (ABC)", "Apply dependency injection principles"],
        skillsGained: ["OOP", "Design Patterns", "SOLID", "Type Hinting"],
        interviewRelevance: "Object-oriented design and clean architecture interviews.",
      },
      {
        title: "Data Structures, Algorithms & Computational Complexity",
        description: "Hash maps, binary search, trees, graphs, sorting algorithms, and Big-O time/space complexity.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["Object-Oriented Design & Design Patterns in Python"],
        learningObjectives: ["Analyze time and space complexity", "Implement tree and graph traversals (BFS/DFS)", "Optimize lookup structures"],
        skillsGained: ["Data Structures", "Algorithms", "Big-O", "Problem Solving"],
        interviewRelevance: "Standard coding interview rounds (LeetCode medium style questions).",
      },
      {
        title: "Concurrency & Asynchronous Programming (AsyncIO)",
        description: "Event loops, coroutines, tasks, threading vs multiprocessing vs async/await execution models.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Data Structures, Algorithms & Computational Complexity"],
        learningObjectives: ["Write asynchronous coroutines with AsyncIO", "Manage thread locks and process pools", "Prevent race conditions and deadlocks"],
        skillsGained: ["AsyncIO", "Concurrency", "Multithreading", "Event Loop"],
        interviewRelevance: "GIL (Global Interpreter Lock) explanation and asynchronous I/O trade-offs.",
      },
      {
        title: "Modern REST API Development with FastAPI",
        description: "Build high-performance REST APIs with Pydantic validation, dependency injection, and OpenAPI documentation.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Concurrency & Asynchronous Programming (AsyncIO)"],
        learningObjectives: ["Define request/response Pydantic schemas", "Structure modular API routers", "Implement authentication middleware"],
        skillsGained: ["FastAPI", "Pydantic", "REST APIs", "OpenAPI"],
        interviewRelevance: "API design best practices, status codes, and schema validation.",
      },
      {
        title: "Database Integration with PostgreSQL & SQLAlchemy ORM",
        description: "Relational modeling, async SQLAlchemy, Alembic migrations, connection pooling, and transaction isolation.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Modern REST API Development with FastAPI"],
        learningObjectives: ["Model relational entities and foreign keys", "Execute async CRUD operations", "Manage Alembic database migrations"],
        skillsGained: ["PostgreSQL", "SQLAlchemy", "Alembic", "Database Design"],
        interviewRelevance: "Database optimization, N+1 query problem, and indexing.",
      },
      {
        title: "Automated Testing with Pytest & Test-Driven Development",
        description: "Unit testing, integration testing, mocking, fixtures, parameterized tests, and coverage reporting.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["Database Integration with PostgreSQL & SQLAlchemy ORM"],
        learningObjectives: ["Write reusable pytest fixtures", "Mock external API dependencies", "Achieve high test coverage"],
        skillsGained: ["Pytest", "TDD", "Mocking", "Test Fixtures"],
        interviewRelevance: "Writing clean tests and understanding test-driven development.",
      },
      {
        title: "Background Tasks & Caching with Celery and Redis",
        description: "Asynchronous task queues, Redis in-memory caching, task retries, and distributed worker architectures.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Automated Testing with Pytest & Test-Driven Development"],
        learningObjectives: ["Configure Celery worker queues", "Implement Redis cache-aside patterns", "Handle worker task failures gracefully"],
        skillsGained: ["Celery", "Redis", "Task Queues", "Caching"],
        interviewRelevance: "Distributed systems and asynchronous queue architecture.",
      },
      {
        title: "Dockerization, Packaging & CI/CD Pipelines",
        description: "Containerize Python applications with multi-stage Dockerfiles, poetry package management, and GitHub Actions.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Background Tasks & Caching with Celery and Redis"],
        learningObjectives: ["Write lightweight multi-stage Docker builds", "Manage dependencies with Poetry", "Automate CI/CD test execution"],
        skillsGained: ["Docker", "Poetry", "GitHub Actions", "CI/CD"],
        interviewRelevance: "DevOps practices and containerization for Python backends.",
      },
      {
        title: "Production Backend Engineering Capstone",
        description: "Build and deploy a full-scale microservice architecture with authentication, rate limiting, and observability.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 75,
        prerequisites: ["Dockerization, Packaging & CI/CD Pipelines"],
        learningObjectives: ["Implement rate limiting and token buckets", "Integrate structured JSON logging", "Deploy scalable cloud service"],
        skillsGained: ["System Architecture", "Security", "Production Readiness"],
        interviewRelevance: "Senior software engineering system design and portfolio review.",
      },
    ]
  }

  // 6. WEB DEVELOPER (10 Steps)
  if (normalized.includes("web developer") || normalized === "web-developer") {
    return [
      {
        title: "HTML5 Semantic Markup & Modern CSS3",
        description: "Semantic web architecture, Flexbox, CSS Grid, custom properties, and responsive typography.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 40,
        prerequisites: [],
        learningObjectives: ["Build accessible HTML5 layouts", "Design responsive Grid and Flexbox systems", "Utilize modern CSS variables"],
        skillsGained: ["HTML5", "CSS3", "Responsive Design", "Flexbox & Grid"],
        interviewRelevance: "Core layout mechanics and accessibility (a11y) standards.",
      },
      {
        title: "Modern JavaScript (ES6+) Fundamentals",
        description: "Closures, prototypes, destructuring, promises, async/await, event loop, and DOM manipulation.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 50,
        prerequisites: ["HTML5 Semantic Markup & Modern CSS3"],
        learningObjectives: ["Master JavaScript event loop & microtasks", "Handle asynchronous operations with Promises", "Write clean functional array transformations"],
        skillsGained: ["JavaScript ES6+", "Event Loop", "Promises", "Async/Await"],
        interviewRelevance: "JavaScript closures, event propagation, and asynchronous execution order.",
      },
      {
        title: "TypeScript for Robust Web Applications",
        description: "Static typing, interfaces, generics, union types, utility types, and strict type safety.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 45,
        prerequisites: ["Modern JavaScript (ES6+) Fundamentals"],
        learningObjectives: ["Define reusable Generic types and interfaces", "Utilize utility types (Pick, Omit, Partial)", "Enforce strict compile-time safety"],
        skillsGained: ["TypeScript", "Generics", "Type Inference", "Strict Typing"],
        interviewRelevance: "TypeScript generics and type narrowing coding questions.",
      },
      {
        title: "React Component Architecture & Hooks",
        description: "Functional components, useState, useEffect, useMemo, useCallback, useRef, and custom hooks.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 60,
        prerequisites: ["TypeScript for Robust Web Applications"],
        learningObjectives: ["Structure modular component trees", "Build custom reusable hooks", "Optimize re-renders with memoization"],
        skillsGained: ["React", "Custom Hooks", "Component Design", "Memoization"],
        interviewRelevance: "React lifecycle, virtual DOM reconciliation, and hook dependency gotchas.",
      },
      {
        title: "State Management & Server State (TanStack Query)",
        description: "Global state patterns (Zustand), asynchronous cache management, mutations, and optimistic UI updates.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["React Component Architecture & Hooks"],
        learningObjectives: ["Manage server cache with TanStack Query", "Implement optimistic updates and rollback", "Architect lightweight Zustand stores"],
        skillsGained: ["TanStack Query", "Zustand", "Cache Management", "Optimistic UI"],
        interviewRelevance: "Server-state caching strategies and client-side data synchronization.",
      },
      {
        title: "Modern UI Styling with Tailwind CSS & Shadcn/UI",
        description: "Utility-first design tokens, animations with Framer Motion, accessible primitives, and dark mode systems.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["State Management & Server State (TanStack Query)"],
        learningObjectives: ["Implement cohesive theme systems", "Compose Shadcn/UI primitives", "Build fluid micro-animations with Framer Motion"],
        skillsGained: ["Tailwind CSS", "Shadcn/ui", "Framer Motion", "UI Design"],
        interviewRelevance: "Modern design system implementation and component accessibility.",
      },
      {
        title: "Backend API Engineering with Node.js & Express",
        description: "REST API routing, middleware pipelines, error handlers, cookie/header parsing, and rate limiting.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 55,
        prerequisites: ["Modern UI Styling with Tailwind CSS & Shadcn/UI"],
        learningObjectives: ["Build modular Express API routes", "Write centralized error handling middleware", "Enforce security with Helmet and CORS"],
        skillsGained: ["Node.js", "Express", "REST APIs", "Middleware"],
        interviewRelevance: "Node.js asynchronous runtime and middleware architecture.",
      },
      {
        title: "Database Modeling with PostgreSQL & Prisma ORM",
        description: "Relational database modeling, Prisma schema migrations, connection pooling, and complex joins.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Backend API Engineering with Node.js & Express"],
        learningObjectives: ["Design relational entity schemas", "Run automated migrations with Prisma", "Execute optimized relational queries"],
        skillsGained: ["PostgreSQL", "Prisma ORM", "Database Design", "Migrations"],
        interviewRelevance: "Relational indexing, cascading deletions, and transactional integrity.",
      },
      {
        title: "Authentication, Security & Session Management",
        description: "JWT tokens, HTTP-only cookies, password hashing with bcrypt, CSRF protection, and OAuth flows.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Database Modeling with PostgreSQL & Prisma ORM"],
        learningObjectives: ["Implement secure JWT token rotation", "Store tokens in HTTP-only Secure SameSite cookies", "Prevent XSS and CSRF vulnerabilities"],
        skillsGained: ["Authentication", "JWT", "Web Security", "Bcrypt"],
        interviewRelevance: "Web security fundamentals (XSS, CSRF, JWT storage trade-offs).",
      },
      {
        title: "Full-Stack Web Application Capstone",
        description: "Design, build, test, and deploy a production-grade full-stack web SaaS application with live CI/CD.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 80,
        prerequisites: ["Authentication, Security & Session Management"],
        learningObjectives: ["Deliver end-to-end full-stack SaaS", "Deploy frontend to Vercel and backend to cloud containers", "Implement automated end-to-end testing"],
        skillsGained: ["Full-Stack Architecture", "Deployment", "CI/CD", "Production Ready"],
        interviewRelevance: "Full-stack system design and end-to-end architectural defense.",
      },
    ]
  }

  // 7. GENERATIVE AI ENGINEER (10 Steps)
  if (normalized.includes("generative") || normalized === "generative-ai-engineer") {
    return [
      {
        title: "Generative AI Foundations & Architecture",
        description: "Autoregressive models, sampling parameters (temperature, top_p, top_k), context windows, and tokenizers.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Understand autoregressive token prediction", "Tune temperature and top_p for determinism vs creativity", "Compute token counts and cost estimates"],
        skillsGained: ["GenAI Basics", "Tokenization", "Sampling Parameters"],
        interviewRelevance: "Foundational LLM mechanics and token generation constraints.",
      },
      {
        title: "Advanced Prompt Engineering & System Design",
        description: "Few-shot prompting, Chain-of-Thought (CoT), Least-to-Most prompting, and guardrails against prompt injection.",
        difficulty: "BEGINNER" as const,
        estimatedMinutes: 45,
        prerequisites: ["Generative AI Foundations & Architecture"],
        learningObjectives: ["Construct robust few-shot system prompts", "Apply Chain-of-Thought reasoning steps", "Implement prompt injection mitigations"],
        skillsGained: ["Prompt Engineering", "Chain of Thought", "Security Guardrails"],
        interviewRelevance: "Prompt reliability, deterministic outputs, and guardrail enforcement.",
      },
      {
        title: "Vector Embeddings & Semantic Search",
        description: "Dense vector spaces, cosine similarity, embedding models (text-embedding-3, bge), and vector indexing (HNSW).",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Advanced Prompt Engineering & System Design"],
        learningObjectives: ["Generate dense semantic embeddings", "Index embeddings with HNSW algorithms", "Evaluate semantic recall versus keyword search"],
        skillsGained: ["Embeddings", "Cosine Similarity", "Vector Search", "HNSW"],
        interviewRelevance: "Vector database indexing algorithms and embedding dimensionality trade-offs.",
      },
      {
        title: "Advanced RAG Architecture (Retrieval-Augmented Generation)",
        description: "Chunking strategies, hybrid search (dense + BM25 sparse), cross-encoder reranking, and query transformations.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 65,
        prerequisites: ["Vector Embeddings & Semantic Search"],
        learningObjectives: ["Implement semantic and recursive chunking", "Combine dense search with BM25 keyword matching", "Apply cross-encoder rerankers to improve top-k precision"],
        skillsGained: ["RAG", "Hybrid Search", "Reranking", "Chunking Strategies"],
        interviewRelevance: "Solving hallucination and context fragmentation in enterprise search.",
      },
      {
        title: "Structured Outputs & Function Calling APIs",
        description: "JSON Schema enforcement, tool definitions, structured extraction, and deterministic tool dispatching.",
        difficulty: "INTERMEDIATE" as const,
        estimatedMinutes: 50,
        prerequisites: ["Advanced RAG Architecture (Retrieval-Augmented Generation)"],
        learningObjectives: ["Enforce strict JSON schema responses", "Define and invoke multi-parameter functions", "Handle tool execution errors gracefully"],
        skillsGained: ["Function Calling", "Structured Outputs", "JSON Schema", "Tool Integration"],
        interviewRelevance: "Connecting LLMs reliably to external APIs and database queries.",
      },
      {
        title: "Autonomous AI Agents & Multi-Agent Workflows",
        description: "ReAct patterns, short-term and long-term memory, LangGraph state machines, and multi-agent coordination.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 70,
        prerequisites: ["Structured Outputs & Function Calling APIs"],
        learningObjectives: ["Build cyclical state machines with LangGraph", "Manage hierarchical multi-agent supervisor patterns", "Persist conversation state across turns"],
        skillsGained: ["AI Agents", "LangGraph", "Multi-Agent Systems", "State Machines"],
        interviewRelevance: "Agent loop convergence, deadlock prevention, and multi-agent architecture.",
      },
      {
        title: "Fine-Tuning LLMs with LoRA & QLoRA",
        description: "Parameter-Efficient Fine-Tuning (PEFT), Low-Rank Adaptation (LoRA), 4-bit quantization, and dataset curation.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 65,
        prerequisites: ["Autonomous AI Agents & Multi-Agent Workflows"],
        learningObjectives: ["Format instruction fine-tuning datasets", "Configure LoRA rank and alpha hyperparameters", "Evaluate fine-tuned model loss on validation benchmarks"],
        skillsGained: ["Fine-Tuning", "LoRA", "QLoRA", "Hugging Face"],
        interviewRelevance: "When to choose Prompting vs RAG vs Fine-Tuning in enterprise systems.",
      },
      {
        title: "GenAI Evaluation, Guardrails & LLM Observability",
        description: "RAG triad evaluation (Ragas, TruLens), hallucination detection, toxicity filtering (NeMo Guardrails), and Langfuse.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 55,
        prerequisites: ["Fine-Tuning LLMs with LoRA & QLoRA"],
        learningObjectives: ["Implement automated evaluation with Ragas", "Configure NeMo safety guardrails", "Trace token latency and cost with Langfuse"],
        skillsGained: ["LLM Evaluation", "Ragas", "Guardrails", "Langfuse"],
        interviewRelevance: "Evaluating non-deterministic AI outputs and production SLA monitoring.",
      },
      {
        title: "Multimodal AI: Vision, Audio & Document Understanding",
        description: "Vision-language models, OCR with multimodal embeddings, Whisper audio transcription, and structured document parsing.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 60,
        prerequisites: ["GenAI Evaluation, Guardrails & LLM Observability"],
        learningObjectives: ["Process images and diagrams with vision models", "Transcribe audio with Whisper", "Extract structured tabular data from PDFs"],
        skillsGained: ["Multimodal AI", "Computer Vision", "Whisper", "Document Extraction"],
        interviewRelevance: "Multimodal embedding spaces and unstructured document understanding.",
      },
      {
        title: "Enterprise Generative AI Production Capstone",
        description: "Deliver a secure, scalable, observable enterprise GenAI assistant with RAG, agents, and guardrails.",
        difficulty: "ADVANCED" as const,
        estimatedMinutes: 80,
        prerequisites: ["Multimodal AI: Vision, Audio & Document Understanding"],
        learningObjectives: ["Deploy production GenAI backend", "Enforce RBAC security on document retrieval", "Achieve sub-second TTFT (Time To First Token)"],
        skillsGained: ["Enterprise GenAI", "Production Deployment", "Streaming APIs", "Security"],
        interviewRelevance: "End-to-end Generative AI system design and technical architecture review.",
      },
    ]
  }

  // Fallback for any other title
  return [
    {
      title: `${domainName} Fundamentals`,
      description: `Master core principles, syntax, and foundational architecture required for professional ${domainName}.`,
      difficulty: "BEGINNER" as const,
      estimatedMinutes: 45,
      prerequisites: [],
      learningObjectives: ["Understand core domain principles", "Set up modern development tooling", "Write clean foundational code"],
      skillsGained: [`${domainName} Basics`, "Architecture", "Syntax"],
      interviewRelevance: "Foundational conceptual knowledge tested in initial screening rounds.",
    },
    {
      title: "Data Structures & Core Architectural Patterns",
      description: `Implement scalable patterns, abstractions, and structures used across ${domainName}.`,
      difficulty: "BEGINNER" as const,
      estimatedMinutes: 50,
      prerequisites: [`${domainName} Fundamentals`],
      learningObjectives: ["Apply architectural patterns", "Optimize data structures", "Handle edge cases"],
      skillsGained: ["Design Patterns", "Data Structures", "Modularity"],
      interviewRelevance: "Time and space complexity analysis in technical coding rounds.",
    },
    {
      title: "Intermediate System Architecture & Data Pipelines",
      description: `Build interconnected modules, manage asynchronous state, and interface with storage layers.`,
      difficulty: "INTERMEDIATE" as const,
      estimatedMinutes: 55,
      prerequisites: ["Data Structures & Core Architectural Patterns"],
      learningObjectives: ["Design clean interfaces", "Manage asynchronous execution", "Structure database queries"],
      skillsGained: ["Architecture", "Asynchronous Code", "State Management"],
      interviewRelevance: "Modular design and separation of concerns.",
    },
    {
      title: "Advanced Engineering, Optimization & Performance",
      description: `Profile system bottlenecks, apply caching strategies, and optimize compute throughput.`,
      difficulty: "ADVANCED" as const,
      estimatedMinutes: 60,
      prerequisites: ["Intermediate System Architecture & Data Pipelines"],
      learningObjectives: ["Profile memory and CPU bottlenecks", "Implement caching layers", "Benchmark performance"],
      skillsGained: ["Performance Tuning", "Profiling", "Optimization"],
      interviewRelevance: "System trade-offs and performance scaling under load.",
    },
    {
      title: "Production Deployment, Observability & Best Practices",
      description: `CI/CD pipelines, containerization, observability, automated testing, and cloud deployment.`,
      difficulty: "ADVANCED" as const,
      estimatedMinutes: 55,
      prerequisites: ["Advanced Engineering, Optimization & Performance"],
      learningObjectives: ["Automate CI/CD testing", "Dockerize deployment artifacts", "Set up structured telemetry"],
      skillsGained: ["CI/CD", "Docker", "Testing", "Observability"],
      interviewRelevance: "Senior-level deployment, monitoring, and operational excellence questions.",
    },
  ]
}

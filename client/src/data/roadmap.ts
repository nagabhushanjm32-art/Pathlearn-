import { Roadmap, RoadmapStep } from "../types"

export const mockMachineLearningSteps: RoadmapStep[] = [
  {
    id: "step-ml-1",
    order: 1,
    title: "Python for Machine Learning",
    description: "Learn Python, NumPy, Pandas and essential libraries for ML workflows and vector computation.",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    skillsGained: ["Python", "NumPy", "Pandas", "Vectorization"],
    isCompleted: true,
    isCurrent: false,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0",
    videoDuration: "42 mins",
    videoChannel: "PathLearn AI Academy",
    notes: {
      id: "note-ml-1",
      title: "Python for ML: Key Concepts & NumPy Essentials",
      summary: "Comprehensive guide on multi-dimensional ndarrays, broadcasting, vectorization vs loops, and Pandas DataFrame manipulations.",
      keyTakeaways: [
        "NumPy ndarrays provide 50x faster memory-contiguous array operations compared to standard Python lists.",
        "Broadcasting allows arithmetic operations on arrays of different shapes without explicit looping.",
        "Pandas DataFrames provide powerful grouping, merging, pivoting, and NaN handling."
      ],
      codeSnippet: `import numpy as np\nimport pandas as pd\n\n# Vectorized matrix multiplication\nA = np.random.randn(1000, 50)\nB = np.random.randn(50, 10)\nC = np.dot(A, B)\nprint(f"Result matrix shape: {C.shape}")`
    },
    quiz: {
      id: "quiz-ml-1",
      title: "NumPy & Vectorization Fundamentals",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: true,
      score: 100,
      questions: [
        {
          id: "q1",
          question: "Why are NumPy array operations significantly faster than Python list operations?",
          options: [
            "NumPy uses contiguous C-level memory allocations and vectorized CPU instructions",
            "NumPy runs in a background thread automatically",
            "Python lists have no indexing support",
            "NumPy uses cloud GPUs by default"
          ],
          correctIndex: 0,
          explanation: "NumPy arrays are stored in contiguous memory blocks with homogeneous types, allowing SIMD CPU vectorization and C-speed execution."
        },
        {
          id: "q2",
          question: "Which function is used to create a 2D identity matrix in NumPy?",
          options: ["np.zeros((n, n))", "np.eye(n)", "np.ones((n, n))", "np.diag()"],
          correctIndex: 1,
          explanation: "np.eye(N) returns a 2-D array with ones on the diagonal and zeros elsewhere."
        }
      ]
    }
  },
  {
    id: "step-ml-2",
    order: 2,
    title: "Statistics & Mathematics",
    description: "Essential statistics, linear algebra, probability, and calculus concepts for machine learning.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    skillsGained: ["Linear Algebra", "Calculus", "Probability", "Descriptive Statistics"],
    isCompleted: true,
    isCurrent: false,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=Jnqa8I5_298",
    videoDuration: "55 mins",
    videoChannel: "DeepMath AI",
    notes: {
      id: "note-ml-2",
      title: "Math Foundations: Gradient Descent & Matrix Decompositions",
      summary: "Understand partial derivatives, gradient vectors, eigenvalues, and Bayes Theorem underpinning loss minimization.",
      keyTakeaways: [
        "Gradient represents the direction of steepest ascent of a multi-variable function.",
        "Learning rate controls step size along the negative gradient vector during optimization.",
        "Covariance matrix measures pairwise variance across feature dimensions."
      ],
      codeSnippet: `def gradient_descent(x_start, lr=0.01, epochs=100):\n    x = x_start\n    for _ in range(epochs):\n        grad = 2 * x # derivative of x^2\n        x = x - lr * grad\n    return x`
    },
    quiz: {
      id: "quiz-ml-2",
      title: "Statistics & Linear Algebra Quiz",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: true,
      score: 90,
      questions: [
        {
          id: "q2-1",
          question: "What does the gradient vector of a scalar function indicate?",
          options: [
            "The direction of steepest rate of increase of the function",
            "The global minimum directly",
            "The average slope across all axes",
            "The curvature radius"
          ],
          correctIndex: 0,
          explanation: "The gradient points in the direction of the greatest rate of increase of the function, and its magnitude is the slope in that direction."
        }
      ]
    }
  },
  {
    id: "step-ml-3",
    order: 3,
    title: "Supervised Learning",
    description: "Learn regression, classification algorithms, decision trees, random forests, and boosting algorithms.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 150,
    skillsGained: ["Linear Regression", "Logistic Regression", "Random Forest", "XGBoost", "Scikit-Learn"],
    isCompleted: true,
    isCurrent: false,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
    videoDuration: "68 mins",
    videoChannel: "Scikit Mastery",
    notes: {
      id: "note-ml-3",
      title: "Supervised Learning Architectures",
      summary: "In-depth breakdown of linear models, decision trees, bagging vs boosting, and hyperparameter tuning.",
      keyTakeaways: [
        "Decision trees split nodes to minimize Gini Impurity or maximize Information Gain (Entropy reduction).",
        "Random Forest reduces variance through bootstrap aggregation (bagging).",
        "Gradient Boosting builds trees sequentially to correct the residual errors of prior trees."
      ]
    },
    quiz: {
      id: "quiz-ml-3",
      title: "Supervised Algorithms Mastery",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: true,
      score: 85,
      questions: [
        {
          id: "q3-1",
          question: "What is the primary difference between Bagging and Boosting?",
          options: [
            "Bagging trains models in parallel independently; Boosting trains models sequentially to reduce residuals",
            "Bagging is only for regression; Boosting is only for classification",
            "Boosting uses neural networks while Bagging uses decision trees",
            "Bagging requires unlabelled data"
          ],
          correctIndex: 0,
          explanation: "Bagging (Bootstrap Aggregation) fits independent base estimators in parallel to reduce variance, whereas Boosting trains estimators sequentially to reduce bias."
        }
      ]
    }
  },
  {
    id: "step-ml-4",
    order: 4,
    title: "Unsupervised Learning",
    description: "Clustering, dimensionality reduction, K-Means, DBSCAN, PCA, and association rules.",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 110,
    skillsGained: ["K-Means", "DBSCAN", "PCA", "t-SNE", "Hierarchical Clustering"],
    isCompleted: true,
    isCurrent: false,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=FgakZw6K1QQ",
    videoDuration: "48 mins",
    videoChannel: "Unsupervised AI",
    notes: {
      id: "note-ml-4",
      title: "Unsupervised Clustering & Dimensionality Reduction",
      summary: "Techniques for discovering hidden patterns, density-based clustering, and projecting high-dimensional features to lower-dimensional latent spaces.",
      keyTakeaways: [
        "PCA identifies orthogonal principal axes that maximize variance in the dataset.",
        "DBSCAN detects clusters of arbitrary shape based on spatial density and robustly flags outliers.",
        "Elbow method and Silhouette score help determine optimal K for K-Means."
      ]
    },
    quiz: {
      id: "quiz-ml-4",
      title: "Unsupervised Clustering & PCA",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: true,
      score: 95,
      questions: [
        {
          id: "q4-1",
          question: "Which metric evaluates the separation and cohesion of clusters in unsupervised learning?",
          options: ["Silhouette Score", "Accuracy Score", "Mean Squared Error", "Cross Entropy Loss"],
          correctIndex: 0,
          explanation: "The Silhouette Coefficient measures how similar an object is to its own cluster compared to other clusters (-1 to +1)."
        }
      ]
    }
  },
  {
    id: "step-ml-5",
    order: 5,
    title: "Model Evaluation & Hyperparameter Tuning",
    description: "Cross-validation, ROC-AUC curves, Precision-Recall trade-offs, GridSearchCV, and Optuna.",
    difficulty: "ADVANCED",
    estimatedMinutes: 130,
    skillsGained: ["Cross Validation", "ROC-AUC", "Precision-Recall", "GridSearchCV", "Optuna"],
    isCompleted: true,
    isCurrent: false,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=WPqnwtWjhG0",
    videoDuration: "52 mins",
    videoChannel: "MLOps Production",
    notes: {
      id: "note-ml-5",
      title: "Rigorous Evaluation & Metric Selection",
      summary: "Preventing data leakage, stratified K-fold cross-validation, and optimizing business-critical metrics on imbalanced datasets.",
      keyTakeaways: [
        "Accuracy is misleading on imbalanced datasets; use PR-AUC or F1-Score instead.",
        "Stratified K-Fold preserves class proportions across validation splits.",
        "Bayesian optimization with Optuna converges faster than exhaustive Grid Search."
      ]
    },
    quiz: {
      id: "quiz-ml-5",
      title: "Model Metrics & Validation",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: true,
      score: 90,
      questions: [
        {
          id: "q5-1",
          question: "When evaluating a rare disease diagnosis model (highly imbalanced classes), which metric is most crucial?",
          options: ["Recall (Sensitivity) on the positive class", "Overall Accuracy", "Specificity only", "Training R-squared"],
          correctIndex: 0,
          explanation: "High Recall ensures false negatives are minimized so sick patients are not missed."
        }
      ]
    }
  },
  {
    id: "step-ml-6",
    order: 6,
    title: "Real-World Machine Learning Project",
    description: "End-to-end ML pipeline: data ingestion, feature engineering, model training, MLflow tracking, and FastAPI deployment.",
    difficulty: "ADVANCED",
    estimatedMinutes: 240,
    skillsGained: ["End-to-End ML Pipeline", "Feature Engineering", "FastAPI", "Docker", "Model Deployment"],
    isCompleted: false,
    isCurrent: true,
    isLocked: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
    videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
    videoDuration: "75 mins",
    videoChannel: "FullStack AI",
    notes: {
      id: "note-ml-6",
      title: "Production ML Deployment Architecture",
      summary: "Learn containerization with Docker, building low-latency inference endpoints with FastAPI, and monitoring model drift in production.",
      keyTakeaways: [
        "Decouple model training from inference pipelines.",
        "Serve models using lightweight asynchronous web frameworks.",
        "Track input data distributions to detect covariate shift and concept drift."
      ]
    },
    quiz: {
      id: "quiz-ml-6",
      title: "Production MLOps Final Quiz",
      totalQuestions: 5,
      passingScore: 80,
      isPassed: false,
      questions: [
        {
          id: "q6-1",
          question: "What is data drift (covariate shift) in production ML?",
          options: [
            "Change in the statistical distribution of input features over time",
            "Server downtime due to traffic spikes",
            "Database schema migrations failing",
            "Loss function code bugs"
          ],
          correctIndex: 0,
          explanation: "Data drift occurs when the distribution of real-world input features changes compared to the training dataset distribution."
        }
      ]
    }
  }
]

export const mockRoadmaps: Record<string, Roadmap> = {
  "ai-engineer": {
    id: "roadmap-ai",
    domainId: "ai-engineer",
    domainName: "AI Engineer",
    domainSlug: "ai-engineer",
    domainDescription: "Master modern artificial intelligence, deep learning architectures, Large Language Models, RAG, AI agents, and production MLOps.",
    icon: "brain",
    targetRoles: ["AI Engineer", "GenAI Specialist", "AI Research Engineer"],
    progress: 0,
    totalSteps: 14,
    completedSteps: 0,
    skillsCount: 9,
    skills: ["Python for AI", "PyTorch", "Transformers", "LLMs", "RAG", "AI Agents", "LangChain", "MLOps"],
    steps: mockMachineLearningSteps.map((s, idx) => ({ ...s, id: `ai-${s.id}`, order: idx + 1, isCompleted: false, isLocked: idx !== 0, videoProgress: 0 }))
  },
  "machine-learning-engineer": {
    id: "roadmap-ml",
    domainId: "machine-learning-engineer",
    domainName: "Machine Learning Engineer",
    domainSlug: "machine-learning-engineer",
    domainDescription: "Learn statistical modeling, feature engineering, supervised and unsupervised learning, ensemble methods, and production model deployment.",
    icon: "brain",
    targetRoles: ["ML Engineer", "Data Scientist", "Applied Scientist"],
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillsCount: 7,
    skills: ["Python", "Statistics", "Scikit-Learn", "Feature Engineering", "Ensemble Methods", "Deep Learning", "Model Deployment"],
    steps: mockMachineLearningSteps.map((s, idx) => ({ ...s, id: `ml-${s.id}`, order: idx + 1, isCompleted: false, isLocked: idx !== 0, videoProgress: 0 }))
  },
  "python-developer": {
    id: "roadmap-py",
    domainId: "python-developer",
    domainName: "Python Developer",
    domainSlug: "python-developer",
    domainDescription: "Master Python fundamentals, object-oriented design patterns, concurrency, asynchronous APIs, database integrations, and automated testing.",
    icon: "code",
    targetRoles: ["Python Developer", "Backend Engineer", "Software Engineer"],
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillsCount: 8,
    skills: ["Python 3", "OOP", "Data Structures", "FastAPI", "AsyncIO", "Unit Testing", "Database ORM"],
    steps: mockMachineLearningSteps.map((s, idx) => ({ ...s, id: `py-${s.id}`, order: idx + 1, isCompleted: false, isLocked: idx !== 0, videoProgress: 0 }))
  },
  "data-scientist": {
    id: "roadmap-ds",
    domainId: "data-scientist",
    domainName: "Data Scientist",
    domainSlug: "data-scientist",
    domainDescription: "Derive deep predictive insights through statistical hypothesis testing, exploratory data analysis, machine learning algorithms, and storytelling.",
    icon: "bar-chart-3",
    targetRoles: ["Data Scientist", "Analytics Lead", "Quantitative Analyst"],
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillsCount: 7,
    skills: ["Pandas", "NumPy", "Statistical Inference", "Predictive Modeling", "Seaborn", "Feature Selection", "SQL for Data Science"],
    steps: mockMachineLearningSteps.map((s, idx) => ({ ...s, id: `ds-${s.id}`, order: idx + 1, isCompleted: false, isLocked: idx !== 0, videoProgress: 0 }))
  },
  "web-developer": {
    id: "roadmap-web",
    domainId: "web-developer",
    domainName: "Web Developer",
    domainSlug: "web-developer",
    domainDescription: "Build scalable, responsive full-stack web applications from scratch using modern React, TypeScript, Node.js, Express, and PostgreSQL.",
    icon: "globe",
    targetRoles: ["Frontend Developer", "Full Stack Developer", "Web Engineer"],
    progress: 0,
    totalSteps: 10,
    completedSteps: 0,
    skillsCount: 8,
    skills: ["HTML & Modern CSS", "JavaScript ES6+", "TypeScript", "React", "Node.js & Express", "Tailwind CSS", "RESTful APIs"],
    steps: mockMachineLearningSteps.map((s, idx) => ({ ...s, id: `web-${s.id}`, order: idx + 1, isCompleted: false, isLocked: idx !== 0, videoProgress: 0 }))
  },
}

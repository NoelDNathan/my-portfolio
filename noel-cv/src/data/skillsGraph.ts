export type SkillLevel = "basic" | "medium" | "advanced";

export interface SkillNode {
  id: string;
  name: string;
  level: SkillLevel | undefined;
  parentId?: string | null;
  relatedItems?: string[]; // timeline item ids
}

export const skillsGraph: SkillNode[] = [
  // ========================
  // ROOT DOMAINS
  // ========================
  { id: "ai", name: "Artificial Intelligence", level: "advanced", parentId: null },
  { id: "software", name: "Software Engineering", level: "medium", parentId: null },
  { id: "blockchain", name: "Blockchain & Cryptography", level: "medium", parentId: null },
  { id: "robotics", name: "Robotics", level: "medium", parentId: null },
  { id: "data", name: "Data Science", level: "advanced", parentId: null },
  { id: "soft-skills", name: "Soft Skills", level: undefined, parentId: null },
  { id: "languages", name: "Languages", level: undefined, parentId: null },
  { id: "tools", name: "Tools", level: undefined, parentId: null },

  // ========================
  // AI
  // ========================
  { id: "ml", name: "Machine Learning", level: "advanced", parentId: "ai" },
  { id: "dl", name: "Deep Learning", level: "advanced", parentId: "ml" },
  { id: "rl", name: "Reinforcement Learning", level: "advanced", parentId: "ml" },
  { id: "cv", name: "Computer Vision", level: "advanced", parentId: "ai" },
  { id: "nlp", name: "NLP", level: "medium", parentId: "ai" },
  { id: "llm", name: "Large Language Models", level: "medium", parentId: "nlp" },

  // AI theoretical foundations
  { id: "mathematics", name: "Mathematics", level: "medium", parentId: "ai", relatedItems: ["ai-bachelor-upc", "josep-lluis-sert"] },
  { id: "statistics", name: "Statistics", level: "advanced", parentId: "mathematics", relatedItems: ["ai-bachelor-upc"] },
  { id: "probability", name: "Probability", level: "advanced", parentId: "mathematics", relatedItems: ["ai-bachelor-upc"] },
  { id: "linear-algebra", name: "Linear Algebra", level: "advanced", parentId: "mathematics", relatedItems: ["ai-bachelor-upc"] },
  { id: "optimization", name: "Optimization", level: "advanced", parentId: "mathematics", relatedItems: ["ai-bachelor-upc", "packengers-project"] },

  // ML sub-areas
  { id: "supervised-learning", name: "Supervised Learning", level: "advanced", parentId: "ml", relatedItems: ["ai-bachelor-upc"] },
  { id: "unsupervised-learning", name: "Unsupervised Learning", level: "advanced", parentId: "ml", relatedItems: ["ai-bachelor-upc"] },
  { id: "data-augmentation", name: "Data Augmentation", level: "medium", parentId: "ml", relatedItems: ["ai-bachelor-upc", "vision-guided-rl-robotics"] },
  { id: "explainable-ml", name: "Explainable ML", level: "advanced", parentId: "ml", relatedItems: ["erasmus-tartu", "ai-bachelor-upc"] },
  { id: "automated-ml", name: "Automated ML", level: "advanced", parentId: "ml", relatedItems: ["erasmus-tartu"] },
  { id: "knowledge-representation", name: "Knowledge Representation", level: "medium", parentId: "ai", relatedItems: ["ai-bachelor-upc"] },
  { id: "speech-recognition", name: "Speech Recognition", level: "medium", parentId: "ai", relatedItems: ["ai-bachelor-upc"] },
  { id: "hpc", name: "High-Performance Computing", level: "basic", parentId: "ai", relatedItems: ["ai-bachelor-upc"] },

  { id: "dqn", name: "DQN", level: "medium", parentId: "rl", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "ppo", name: "PPO", level: "medium", parentId: "rl", relatedItems: ["vision-guided-rl-robotics"] },

  { id: "yolo", name: "YOLO", level: "advanced", parentId: "cv", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "synthetic-data", name: "Synthetic Images Generation", level: "medium", parentId: "cv", relatedItems: ["vision-guided-rl-robotics"] },

  { id: "transformers", name: "Transformers", level: "medium", parentId: "llm", relatedItems: ["sancho-mini"] },
  { id: "transformers-training", name: "Transformers Training", level: "medium", parentId: "transformers", relatedItems: ["sancho-mini"] },
  { id: "web-inference", name: "Web Inference", level: "medium", parentId: "transformers", relatedItems: ["sancho-mini"] },
  { id: "prompting", name: "Prompt Engineering", level: "medium", parentId: "llm", relatedItems: ["university-project-dataclea"] },
  { id: "voice-ai", name: "Voice AI", level: "medium", parentId: "ai", relatedItems: ["healthi-bot"] },
  { id: "conversation-design", name: "Conversation Design", level: "medium", parentId: "ai", relatedItems: ["healthi-bot"] },
  { id: "pipecat", name: "Pipecat", level: "medium", parentId: "llm", relatedItems: ["healthi-bot"] },
  { id: "langchain", name: "LangChain", level: "medium", parentId: "llm", relatedItems: ["healthi-bot"] },
  { id: "langgraph", name: "LangGraph", level: "medium", parentId: "llm", relatedItems: ["healthi-bot"] },


  // ========================
  // SOFTWARE ENGINEERING
  // ========================
  { id: "frontend", name: "Frontend Development", level: "medium", parentId: "software" },
  { id: "backend", name: "Backend Development", level: "medium", parentId: "software" },
  { id: "cloud", name: "Cloud & DevOps", level: "basic", parentId: "software" },

  { id: "react", name: "React", level: "medium", parentId: "frontend", relatedItems: ["decentralized-poker", "packengers-project"] },
  { id: "nextjs", name: "Next.js", level: "basic", parentId: "frontend" },

  { id: "fastapi", name: "FastAPI", level: "medium", parentId: "backend", relatedItems: ["packengers-project"] },
  { id: "sqlalchemy", name: "SQLAlchemy", level: "medium", parentId: "backend", relatedItems: ["packengers-project"] },
  { id: "apis", name: "APIs", level: "medium", parentId: "backend", relatedItems: ["university-project-dataclea"] },

  { id: "aws", name: "AWS", level: "basic", parentId: "cloud", relatedItems: ["packengers-project"] },
  { id: "docker", name: "Docker", level: "medium", parentId: "cloud", relatedItems: ["packengers-project"] },
  { id: "cicd", name: "CI/CD", level: "basic", parentId: "cloud", relatedItems: ["packengers-project"] },
  { id: "testing", name: "Testing", level: "medium", parentId: "software", relatedItems: ["decentralized-poker"] },

  // ========================
  // BLOCKCHAIN
  // ========================
  { id: "smart-contracts", name: "Smart Contracts", level: "advanced", parentId: "blockchain", relatedItems: ["decentralized-poker"] },
  { id: "solidity", name: "Solidity", level: "advanced", parentId: "smart-contracts", relatedItems: ["decentralized-poker"] },
  { id: "zk", name: "Zero Knowledge Proofs", level: "medium", parentId: "blockchain", relatedItems: ["decentralized-poker", "erasmus-tartu"] },
  { id: "circom", name: "Circom", level: "medium", parentId: "zk", relatedItems: ["decentralized-poker"] },
  { id: "erc20", name: "ERC-20", level: "medium", parentId: "blockchain", relatedItems: ["decentralized-poker"] },
  { id: "erc721", name: "ERC-721", level: "medium", parentId: "blockchain", relatedItems: ["decentralized-poker"] },
  { id: "hardhat", name: "Hardhat", level: "medium", parentId: "smart-contracts", relatedItems: ["decentralized-poker"] },
  { id: "p2p-networking", name: "P2P Networking", level: "medium", parentId: "blockchain", relatedItems: ["decentralized-poker"] },
  { id: "smart-wallets", name: "Smart Wallets", level: "medium", parentId: "blockchain", relatedItems: ["decentralized-poker"] },
  {
    id: "blockchain-protocol-optimization",
    name: "Blockchain Protocol Optimization",
    level: "medium",
    parentId: "blockchain",
    relatedItems: ["decentralized-poker"],
  },

  // ========================
  // ROBOTICS
  // ========================
  { id: "task-planning", name: "Task Planning", level: "medium", parentId: "robotics", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "ur", name: "Universal Robots", level: "advanced", parentId: "robotics", relatedItems: ["vision-guided-rl-robotics", "universal-robots-courses"] },
  { id: "motion-planning", name: "Motion Planning", level: "medium", parentId: "robotics" },
  { id: "pick-place", name: "Pick and Place", level: "medium", parentId: "robotics", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "control-systems", name: "Control Systems", level: "medium", parentId: "robotics", relatedItems: ["ai-bachelor-upc"] },
  { id: "partial-observability", name: "Partial Observability", level: "medium", parentId: "robotics", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "ros", name: "ROS", level: "medium", parentId: "robotics", relatedItems: ["ai-bachelor-upc"] },

  // ========================
  // DATA SCIENCE
  // ========================
  { id: "data-engineering", name: "Data Engineering", level: "advanced", parentId: "data", relatedItems: ["data-science-ai-developer"] },
  { id: "geospatial", name: "Geospatial Analysis", level: "medium", parentId: "data", relatedItems: ["data-science-ai-developer"] },
  { id: "or-tools", name: "OR-Tools Optimization", level: "medium", parentId: "data", relatedItems: ["packengers-project"] },
  { id: "sql", name: "SQL", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc", "packengers-project"] },
  { id: "postgresql", name: "PostgreSQL", level: "advanced", parentId: "data", relatedItems: ["ai-bachelor-upc", "packengers-project"] },
  { id: "data-visualization", name: "Data Visualization", level: "advanced", parentId: "data", relatedItems: ["ai-bachelor-upc", "data-science-ai-developer"] },
  { id: "feature-engineering", name: "Feature Engineering", level: "advanced", parentId: "data", relatedItems: ["data-science-ai-developer", "university-project-dataclea"] },
  { id: "anomaly-detection", name: "Anomaly Detection", level: "advanced", parentId: "data", relatedItems: ["university-project-dataclea"] },
  { id: "pandas", name: "Pandas", level: "advanced", parentId: "data", relatedItems: ["data-science-ai-developer", "ai-bachelor-upc"] },
  { id: "numpy", name: "NumPy", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "scipy", name: "SciPy", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "pytorch", name: "PyTorch", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "tensorflow", name: "TensorFlow", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "keras", name: "Keras", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "scikit-learn", name: "Scikit-learn", level: "advanced", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "seaborn", name: "Seaborn", level: "advanced", parentId: "data", relatedItems: ["ai-bachelor-upc"] },
  { id: "plotly", name: "Plotly", level: "medium", parentId: "data", relatedItems: ["ai-bachelor-upc"] },

  // ========================
  // PROGRAMMING LANGUAGES
  // ========================
  { id: "python", name: "Python", level: "advanced", parentId: "software" },
  { id: "rust", name: "Rust", level: "basic", parentId: "software", relatedItems: ["decentralized-poker"] },
  { id: "csharp", name: "C#", level: "medium", parentId: "software", relatedItems: ["breaking-barriers-game"] },
  { id: "matlab", name: "MATLAB", level: "medium", parentId: "robotics", relatedItems: ["vision-guided-rl-robotics"] },
  { id: "javascript", name: "JavaScript", level: "medium", parentId: "software", relatedItems: ["packengers-project"] },
  { id: "typescript", name: "TypeScript", level: "basic", parentId: "software", relatedItems: ["packengers-project"] },
  { id: "r", name: "R", level: "basic", parentId: "software", relatedItems: ["ai-bachelor-upc"] },

  // ========================
  // SOFT SKILLS
  // ========================
  { id: "leadership", name: "Leadership", level: undefined, parentId: "soft-skills" },
  { id: "communication", name: "Communication", level: undefined, parentId: "soft-skills" },
  { id: "teamwork", name: "Teamwork", level: undefined, parentId: "soft-skills" },
  { id: "problem-solving", name: "Problem Solving", level: undefined, parentId: "soft-skills" },
   { id: "critical-thinking", name: "Critical Thinking", level: undefined, parentId: "soft-skills", relatedItems: ["ai-bachelor-upc", "packengers-project"] },
   { id: "creativity", name: "Creativity", level: undefined, parentId: "soft-skills", relatedItems: ["ai-bachelor-upc", "decentralized-poker"] },
   { id: "adaptability", name: "Adaptability", level: undefined, parentId: "soft-skills", relatedItems: ["erasmus-tartu", "rugby-player-cruc"] },
   { id: "resilience", name: "Resilience", level: undefined, parentId: "soft-skills", relatedItems: ["rugby-player-cruc"] },
   { id: "time-management", name: "Time Management", level: undefined, parentId: "soft-skills", relatedItems: ["josep-lluis-sert", "packengers-project"] },
   { id: "conflict-resolution", name: "Conflict Resolution", level: undefined, parentId: "soft-skills", relatedItems: ["youth-rugby-coach"] },
   { id: "mentoring", name: "Mentoring", level: undefined, parentId: "soft-skills", relatedItems: ["youth-rugby-coach", "packengers-project"] },
   { id: "strategy", name: "Strategy", level: undefined, parentId: "soft-skills", relatedItems: ["rugby-player-cruc"] },
   { id: "discipline", name: "Discipline", level: undefined, parentId: "soft-skills", relatedItems: ["rugby-player-cruc"] },
   { id: "training-design", name: "Training Design", level: undefined, parentId: "soft-skills", relatedItems: ["rugby-coach-qualification"] },

  // ========================
  // LANGUAGES
  // ========================
  { id: "spanish", name: "Spanish", level: "advanced", parentId: "languages" },
  { id: "catalan", name: "Catalan", level: "advanced", parentId: "languages" },
  { id: "english", name: "English", level: "medium", parentId: "languages" },
  { id: "french", name: "French", level: "basic", parentId: "languages" },


  // ========================
  // Tools
  // ========================
  { id: "blender", name: "Blender", level: "medium", parentId: "tools" },
  { id: "unity", name: "Unity", level: "medium", parentId: "tools" },
  { id: "microsoft-azure", name: "Microsoft Azure", level: "medium", parentId: "tools" },
  { id: "esri-arcgis", name: "ESRI ArcGIS", level: "medium", parentId: "tools" },
  { id: "git", name: "Git", level: "medium", parentId: "tools", relatedItems: ["ai-bachelor-upc", "packengers-project", "decentralized-poker"] },
  { id: "playwright", name: "Playwright", level: "medium", parentId: "tools", relatedItems: ["healthi-bot"] },
];
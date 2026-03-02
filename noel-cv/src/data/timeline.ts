export type TimelineTopic =
  | "education"
  | "professional"
  | "project"
  | "course"
  | "sport";

export interface TimelineVideo {
  label: string;
  url: string;
}

export interface TimelineLink {
  label: string;
  url: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  period: string;
  yearStart: number;
  yearEnd?: number;
  summary: string;
  description: string;
  learnings: string[];
  shortSkills?: string[];
  topic: TimelineTopic;
  video?: TimelineVideo | null;
  links?: TimelineLink[];
}

export const timelineItems: TimelineItem[] = [
  {
    id: "josep-lluis-sert",
    title: "Scientific-Technological High School Diploma – Institut Josep Lluís Sert",
    period: "2019 – 2021",
    yearStart: 2019,
    yearEnd: 2021,
    summary: "Completed a science and technology focused high school diploma with highest distinction.",
    description:
      "I studied a Scientific-Technological High School Diploma at Institut Josep Lluís Sert. The curriculum focused on mathematics, physics, technology, and computer science, and allowed me to build a strong quantitative and analytical foundation before university. I finished with a final grade of 9.57 / 10 and received the highest distinction, which reflects both academic performance and consistency over the two years.",
    learnings: [
      "Solid foundation in mathematics, physics, and technology.",
      "Early exposure to programming and computational thinking.",
      "Strong study discipline and time management.",
      "Ability to excel in a demanding academic environment.",
    ],
    shortSkills: ["Mathematics", "Physics", "Technology", "Computer Science"],
    topic: "education",
    video: null,
  },
  {
    id: "breaking-barriers-game",
    title: "Breaking Barriers – 3D Platformer Game",
    period: "2020 – 2021",
    yearStart: 2020,
    yearEnd: 2021,
    summary:
      "Final high school project: designed and developed a 3D platformer game to learn game development by doing.",
    description:
      "For my final year high school project, I decided to learn game development by actually shipping a complete game. I designed and built “Breaking Barriers”, a 3D platformer where you control a ball and navigate through obstacles and barriers to complete each level. I documented the full process, from early prototypes to polishing mechanics and visuals. The project built on my previous experiments with game development and pushed me to structure my work like a real production.",
    learnings: [
      "C# programming in Unity for gameplay logic and systems.",
      "3D asset creation and level design using Blender.",
      "Iterative game design: prototyping, playtesting, and balancing difficulty.",
      "Project planning and documentation for a complete game.",
    ],
    shortSkills: ["Unity", "C#", "Blender", "Game Design"],
    topic: "project",
    video: {
      label: "Breaking Barriers gameplay",
      url: "https://www.youtube.com/embed/5GO3d6OP0bk",
    },

  },
  {
    id: "data-science-ai-developer",
    title: "Data Science and AI Developer",
    period: "December 2023 – May 2024",
    yearStart: 2023,
    yearEnd: 2024,
    summary:
      "Designed and implemented machine learning models and data visualization pipelines for geospatial and satellite data.",
    description:
      "As a Data Science and AI Developer, I designed and implemented machine learning models focused on geospatial and satellite data analysis. I built data pipelines to preprocess, clean, and structure large datasets, and then created visualization workflows to transform complex information into clear, actionable insights. The work combined statistical modeling, feature engineering, and predictive analytics, and supported decision-making in a real-world context.",
    learnings: [
      "Machine learning for geospatial and satellite data.",
      "Data preprocessing, feature engineering, and model evaluation.",
      "Design of data visualization pipelines for complex datasets.",
      "Collaboration in applied data science projects with stakeholders.",
    ],
    shortSkills: ["Python", "Machine Learning", "Geospatial", "Data Viz"],
    topic: "professional",
    video: null,
  },
  {
    id: "university-project-dataclea",
    title: "DataClea – Generative AI for Data Cleaning and Analysis",
    period: "2024",
    yearStart: 2024,
    yearEnd: 2024,
    summary:
      "Entrepreneurship project with Telefónica: designed a SaaS platform using generative AI to automate data cleaning and analysis.",
    description:
      "As part of an entrepreneurship course, my team collaborated with Telefónica on DataClea, a SaaS concept that uses generative AI to automate data cleaning and analysis. We designed an end-to-end solution to preprocess, standardize, and validate datasets, reducing manual effort while keeping data quality high. The project covered both business and technical aspects: market research, risk management, SaaS architecture, AI model integration, and a working front-end prototype. We experimented with large language models to understand schema, detect anomalies, and suggest cleaning operations that could be integrated into existing workflows.",
    learnings: [
      "Generative AI and LLMs applied to data cleaning workflows.",
      "Data preprocessing, standardization, and anomaly detection.",
      "Prompt engineering and model fine-tuning for structured data tasks.",
      "Design of SaaS architectures and cloud-based integrations (e.g. Azure, APIs).",
      "Front-end development and app integration for AI-powered tools.",
      "Project management using Agile techniques and Gantt/PERT planning.",
      "Risk assessment and mitigation for early-stage AI products.",
      "Collaboration with corporate partners in an innovation context.",
    ],
    shortSkills: ["LLMs", "Prompting", "Azure", "APIs", "React"],
    topic: "project",
    video: {
      label: "NN – DataClea (PIA) demo",
      url: "https://www.youtube.com/embed/8luinEnWZ-w",
    },
  },
  {
    id: "erasmus-tartu",
    title: "Erasmus+ Exchange – University of Tartu, Estonia",
    period: "2024 – 2025",
    yearStart: 2024,
    yearEnd: 2025,
    summary:
      "Exchange year focused on AI and security: zero-knowledge proofs, explainable AutoML, applied cryptography, and information retrieval.",
    description:
      "During my Erasmus+ exchange at the University of Tartu (2024–2025), I focused on advanced topics at the intersection of AI, security, and information retrieval. My courses included Zero Knowledge Proofs, Explainable Automated Machine Learning, Applied Cryptography, and Information Retrieval, with a strong emphasis on how modern web search engines work. The experience exposed me to a different academic culture, deepened my understanding of privacy-preserving systems, and strengthened my English communication skills in an international environment.",
    learnings: [
      "Zero Knowledge Proofs and privacy-preserving cryptographic protocols.",
      "Explainable Automated Machine Learning and model interpretability.",
      "Applied cryptography for secure systems.",
      "Information Retrieval and the inner workings of web search engines.",
      "Academic and professional communication in English.",
      "Cultural adaptability and collaboration in international teams.",
    ],
    shortSkills: ["ZK Proofs", "Cryptography", "Information Retrieval", "Explainable ML"],
    topic: "education",
    video: null,
    links: [
      {
        label: "University of Tartu",
        url: "https://ut.ee/et",
      },
    ],
  },
  {
    id: "decentralized-poker",
    title: "Decentralized Poker Platform",
    period: "2024 – 2025",
    yearStart: 2024,
    yearEnd: 2025,
    summary:
      "Built a fully decentralized poker platform using smart contracts, zero-knowledge proofs, and a custom P2P network.",
    description:
      "I developed a fully decentralized poker platform that implements advanced security and fairness guarantees. Starting from theory in a Zero Knowledge Proofs course, I designed Circom circuits and smart contracts in Solidity that verify critical properties of the game while preserving player privacy. The system integrates ERC-20 tokens and NFTs, and runs on an optimized protocol to minimize gas costs (reduced by around 80% after iterations). On the networking side, I implemented P2P connections in Rust, and built a React front-end to enable real-time gameplay and interactions. The project is an end-to-end exploration of decentralized systems, from cryptographic primitives to UX.",
    learnings: [
      "Smart contract development in Solidity for complex game logic.",
      "Zero-knowledge proof design with Circom circuits.",
      "Token and NFT integration using ERC-20 and NFT standards.",
      "Blockchain protocol optimization for lower gas costs.",
      "P2P networking in Rust for real-time communication.",
      "Front-end development in React for interactive dApps.",
      "Testing and deployment workflows with Hardhat.",
      "Secure system design and threat modeling in decentralized environments.",
    ],
    shortSkills: ["Solidity", "Circom", "Rust", "React", "Hardhat"],
    topic: "project",
    video: {
      label: "Dog Poker Club demo",
      url: "",
    },
    links: [
      {
        label: "Dog Poker Club",
        url: "https://www.dogpokerclub.com/",
      },
    ],
  },
  {
    id: "ai-bachelor-upc",
    title: "Bachelor’s Degree in Artificial Intelligence – UPC",
    period: "2021 – 2025",
    yearStart: 2021,
    yearEnd: 2025,
    summary:
      "Completed an AI bachelor’s degree at UPC with GPA 8.62 / 10 (Very Good), ranked 7th in the cohort.",
    description:
      "I completed a Bachelor’s Degree in Artificial Intelligence at the Universitat Politècnica de Catalunya (UPC), graduating in June 2025 with a final GPA of 8.62 / 10 (Very Good) and ranking 7th in my cohort. The program combined a strong mathematical foundation with computer science, engineering, and specialized AI subjects. I studied algebra, calculus, optimization, statistics, systems modeling and simulation, high-performance computing, and parallel and distributed systems. On the software side, I took multiple courses in programming, algorithms, and databases. My specialization focused on artificial intelligence and machine learning, including courses in classical ML, deep learning, reinforcement learning, computer vision, natural language processing, knowledge representation, and explainable ML. I also explored electives in applied cryptography, zero-knowledge proofs, information retrieval, robotics, and intelligent data analysis. Part of the degree included an Erasmus+ year at the University of Tartu.",
    learnings: [
      "Mathematics for AI: algebra, calculus, probability, and statistics.",
      "Programming, algorithms, and software engineering fundamentals.",
      "Machine learning, deep learning, and reinforcement learning.",
      "Computer vision and natural language processing fundamentals.",
      "High-performance, parallel, and distributed computing.",
      "Knowledge representation, reasoning, and explainable ML.",
      "Applied cryptography, zero-knowledge proofs, and information retrieval.",
      "Robotics, control systems, and data-driven modeling.",
    ],
    shortSkills: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP", "HPC"],
    topic: "education",
    video: null,
    links: [
      {
        label: "UPC – Artificial Intelligence Degree",
        url: "https://www.upc.edu/es/grados/inteligencia-artificial-barcelona-fib",
      },
    ],
  },
  {
    id: "vision-guided-rl-robotics",
    title: "Vision-Guided Task Planning with Reinforcement Learning for Robotic Manipulation",
    period: "2025",
    yearStart: 2025,
    yearEnd: 2025,
    summary:
      "Final degree project: unified system that combines reinforcement learning-based task planning with deep learning computer vision for robotic manipulation.",
    description:
      "For my final degree project, I developed a unified robotic manipulation system that combines reinforcement learning for task planning under uncertainty with deep learning-based computer vision. I trained vision models on synthetic 3D datasets to detect and track objects, and integrated them into a control pipeline that executes manipulation tasks according to learned plans. The project was carried out in collaboration with UPC, Universal Robots, and MATLAB, and is part of a broader initiative to create AI courses on computer vision and reinforcement learning using real robotic arms. The work bridges perception, planning, and actuation in a realistic industrial setting.",
    learnings: [
      "Reinforcement learning for task planning in probabilistic environments.",
      "Task planning under uncertainty and partial observability.",
      "Deep learning-based computer vision for object detection and tracking.",
      "Synthetic 3D dataset generation for training and simulation.",
      "Robotic manipulation with Universal Robots cobots.",
      "Integration of perception, planning, and control into a unified system.",
      "Simulation and 3D modeling for robotics experiments.",
      "Collaboration between academia and industry partners.",
    ],
    shortSkills: ["Python", "Computer Vision", "Reinforcement Learning", "MATLAB", "Robotics"],
    topic: "professional",
    video: {
      label: "Vision-Guided Task Planning demo",
      url: "https://www.youtube.com/embed/LoswNZsRGok",
    },
  },
  {
    id: "rugby-coach-qualification",
    title: "Rugby Coach Qualification – L1 World Rugby",
    period: "2025",
    yearStart: 2025,
    yearEnd: 2025,
    summary: "Completed World Rugby Level 1 coach qualification.",
    description:
      "I obtained the World Rugby Level 1 coaching qualification, which formalized my understanding of coaching principles, player safety, and training design. The course covered fundamental techniques, age-appropriate coaching, and best practices for creating a safe and engaging environment for players.",
    learnings: [
      "Foundations of rugby coaching and training design.",
      "Player safety and risk management in sports.",
      "Communication skills for guiding and motivating athletes.",
      "Understanding of structured practice sessions for youth teams.",
    ],
    shortSkills: ["Coaching", "Leadership", "Training Design", "Communication"],
    topic: "course",
    video: null,
  },
  {
    id: "universal-robots-courses",
    title: "Universal Robots – Core and Advanced Training",
    period: "2025",
    yearStart: 2025,
    yearEnd: 2025,
    summary:
      "Hands-on industrial cobot training in programming, safety configuration, and deployment with Universal Robots.",
    description:
      "I completed the Core Training and Advanced Training courses from Universal Robots. These hands-on certifications focused on real industrial collaborative robots, covering pick-and-place applications, safety configuration, motion optimization, force control, palletizing, coordinate systems, and flexible redeployment. The experience strengthened my ability to translate abstract robotics concepts into practical, production-ready programs.",
    learnings: [
      "Programming and deployment of industrial collaborative robots.",
      "Configuration of safety zones, stops, and safe operating procedures.",
      "Motion planning, trajectory optimization, and force control.",
      "Design of pick-and-place and palletizing applications.",
      "Use of coordinate systems and frames for flexible redeployment.",
    ],
    shortSkills: ["Universal Robots", "Robot Programming", "Safety Config", "Motion Planning"],
    topic: "course",
    video: null,
  },
  {
    id: "youth-rugby-coach",
    title: "Youth Rugby Team Coach (ages 10–12)",
    period: "2023 and 2025",
    yearStart: 2023,
    yearEnd: 2025,
    summary:
      "Coached youth rugby teams, developing leadership, communication, and mentoring skills through real group management.",
    description:
      "In 2023 and 2025, I coached youth rugby teams of children aged 10–12. I was responsible for planning training sessions, managing group dynamics, resolving conflicts, and keeping players engaged and motivated. The experience developed my leadership, communication, and mentoring skills, and taught me how to make complex instructions accessible to younger players while keeping safety and enjoyment at the center.",
    learnings: [
      "Leadership and communication in group settings.",
      "Planning and structuring training sessions for young athletes.",
      "Conflict resolution and emotional intelligence with children.",
      "Mentoring and creating a positive, inclusive team culture.",
    ],
    shortSkills: ["Mentoring", "Leadership", "Conflict Resolution", "Team Management"],
    topic: "sport",
    video: null,
  },
  {
    id: "rugby-player-cruc",
    title: "Rugby Player – CRUC Senior Team",
    period: "2021 – Present",
    yearStart: 2021,
    yearEnd: 2026,
    summary:
      "Senior player at local club CRUC, competing in the highest Catalan league, with playing experience since 2010.",
    description:
      "I have been playing rugby since 2010 and currently play for the senior team of my local club, CRUC, in the highest Catalan league. Rugby has been a long-term commitment that shaped my resilience, teamwork, and discipline. Balancing high-level competition with studies and professional projects has trained me to manage pressure and maintain performance across different areas of life.",
    learnings: [
      "High-level competition experience in team sports.",
      "Teamwork, discipline, and commitment over many seasons.",
      "Performance under pressure and resilience after setbacks.",
      "Transferable soft skills: communication, leadership by example, and strategic thinking.",
    ],
    shortSkills: ["Teamwork", "Discipline", "Resilience", "Strategy"],
    topic: "sport",
    video: null,
  },
  {
    id: "sancho-mini",
    title: "sancho-mini – Small-Scale LLM",
    period: "December 2025",
    yearStart: 2025,
    yearEnd: 2025,
    summary:
      "Built and trained a compact LLM on the works of Miguel de Cervantes and deployed it to run directly in the browser.",
    description:
      "In the sancho-mini project, I built and trained a compact large language model using the complete works of Miguel de Cervantes, following a tutorial by Gabriel Merlo. I then adapted the model to run directly in the browser so that users could interact with it in real time without any server dependency. The project required careful control of model size, optimization for web deployment, and an understanding of the trade-offs between capacity and latency.",
    learnings: [
      "Training and fine-tuning small language models on specialized corpora.",
      "Understanding of transformer architectures and their constraints.",
      "Optimization techniques to run models efficiently in the browser.",
      "Front-end integration of AI models for interactive experiences.",
    ],
    shortSkills: ["LLMs", "Transformers", "Fine-tuning", "Web Inference"],
    topic: "project",
    video: null,
  },
  {
    id: "packengers-project",
    title: "Packengers – AI Copilot for Logistics",
    period: "August 2025 – Present",
    yearStart: 2025,
    yearEnd: 2026,
    summary:
      "End-to-end AI project for Packengers: route optimization, payments workflow, and full-stack application deployed on AWS.",
    description:
      "For Packengers, I worked on an end-to-end AI-powered logistics project to solve two core problems: reducing empty kilometers for truck drivers and accelerating their payments. I developed CargafullIA, an AI route and order optimizer that connects to multiple freight marketplaces and selects the best orders based on driver preferences and schedules. The optimization engine uses OR-Tools and incorporates scheduling constraints, with extensive tests and validation. In parallel, I implemented an accounting and payment tracking system that records advance payment requests, manages approvals, and provides transparency for both drivers and administrators. The solution spans the full stack: a React front-end, a FastAPI backend with SQLAlchemy, and deployment on AWS with Docker. I also designed CI/CD pipelines and supervised a team of interns, providing technical guidance and code reviews.",
    learnings: [
      "AI optimization and route planning with OR-Tools.",
      "Full-stack development with React, FastAPI, and SQLAlchemy.",
      "Cloud deployment on AWS using Docker.",
      "Design of accounting and workflow systems for payments.",
      "CI/CD pipeline design and automation for reliable releases.",
      "Team supervision, mentorship, and technical leadership.",
      "Communication with stakeholders to translate business needs into technical solutions.",
    ],
    shortSkills: ["OR-Tools", "React", "FastAPI", "AWS", "Docker"],
    topic: "professional",
    video: {
      label: "Packengers AI Copilot demo",
      url: "",
    },
    links: [
      {
        label: "Packengers AI Copilot",
        url: "https://www.packengers.es/",
      },
    ],
  },
  {
    id: "healthi-bot",
    title: "Healthi Bot – Voice AI Agent for Medical Appointments",
    period: "January 2026",
    yearStart: 2026,
    yearEnd: 2026,
    summary:
      "Built a voice-based AI agent to automate medical appointment scheduling through natural dialog and external service integration.",
    description:
      "Healthi Bot is a voice AI agent designed to handle medical appointment scheduling end-to-end. The agent interacts with patients using natural dialog, collects their name and birthdate, and connects to an external service (Healthie bot) via Playwright and Pipecat to look up existing patients and manage appointments. Once the patient is identified, the agent guides them through choosing a date and time and confirms the booking automatically. The system is designed to streamline administrative workflows while keeping the experience accurate and user-friendly.",
    learnings: [
      "Design of voice-based conversational agents.",
      "Orchestration of multiple AI components using Playwright and Pipecat.",
      "Integration with external services and legacy systems for scheduling.",
      "Conversation design for robust, user-friendly appointment booking.",
    ],
    shortSkills: ["Voice AI", "Playwright", "Tooling", "Conversation Design"],
    topic: "project",
    video: {
      label: "Healthi Bot demo",
      url: "https://www.youtube.com/embed/XFS1tF1-4gg",
    },
  },
  {
    id: "privacy-legal-course",
    title: "Privacy and GDPR Legal Course",
    period: "February 2026",
    yearStart: 2026,
    yearEnd: 2026,
    summary:
      "Completed a comprehensive GDPR course covering fundamentals, certification, and implementation of data protection programs.",
    description:
      "I completed a comprehensive legal course on privacy and the General Data Protection Regulation (GDPR). The program covered the foundations of data protection law, certification paths, and the practical implementation of data protection compliance programs within organizations. This training complements my technical background in AI and data, helping me design systems that respect privacy, consent, and regulatory requirements.",
    learnings: [
      "Fundamentals of GDPR and European data protection law.",
      "Design of data protection compliance programs.",
      "Risk assessment and documentation for data processing activities.",
      "Alignment of technical systems with legal and ethical requirements.",
    ],
    shortSkills: ["GDPR", "Privacy", "Compliance", "Risk Assessment"],
    topic: "course",
    video: null,
  },
];


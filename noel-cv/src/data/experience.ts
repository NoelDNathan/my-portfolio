export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  highlights: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: "packengers",
    company: "Packengers",
    role: "Optimization Engineer",
    location: "Barcelona, Spain",
    period: "August 2025 – Present",
    highlights: [
      "Designed and implemented the AI optimization engine for order assignment and route planning (OR-Tools).",
      "Developed comprehensive test cases and validation procedures to ensure optimizer accuracy and reliability.",
      "Created a simple user interface for drivers to input working hours and preferences.",
      "Documented the optimizer's design, usage, and testing procedures for developers and end-users.",
      "Implemented both frontend and backend components using React for the user interface and FastAPI for server-side logic.",
      "Deployed the backend server on AWS using Docker for containerization and scalable cloud deployment.",
      "Established a CI/CD pipeline to automate testing, integration, and deployment, ensuring rapid and reliable delivery of updates.",
    ],
  },
  {
    id: "upc",
    company: "UPC",
    role: "AI Researcher | Computer Vision · Reinforcement Learning",
    location: "Barcelona, Spain",
    period: "February 2025 – June 2025",
    highlights: [
      "Generated synthetic data in Blender for training computer vision models in realistic environments, improving model robustness and generalization.",
      "Trained and validated YOLOv8 models with both synthetic and real datasets, optimizing accuracy for object detection tasks.",
      "Researched state-of-the-art task planning methods with a focus on probabilistic environments and languages such as RDDL, applying advances to practical use cases.",
      "Developed and trained Reinforcement Learning models (DQN, Maskable PPO) and used the PROST planner in discrete robotic manipulation (pick and place) environments.",
      "Integrated models in MATLAB and Python for robotic applications, covering perception through high-level planning.",
      "Combined computer vision, reinforcement learning, and probabilistic planning to address complex problems in robotic manipulation.",
    ],
  },
  {
    id: "space4earth",
    company: "Space4Earth",
    role: "AI Developer",
    location: "Castelldefels, Spain",
    period: "December 2023 – May 2024",
    highlights: [
      "Developed AI tools applied to geospatial and satellite data (machine learning).",
      "Implemented solutions in Microsoft Azure, Unity, and ESRI ArcGIS.",
    ],
  },
];

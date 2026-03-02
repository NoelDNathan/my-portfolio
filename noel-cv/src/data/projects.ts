export interface Project {
  id: string;
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  technologies: string[];
  results: string[];
  thumbnail?: string;
  links?: {
    label: string;
    url: string;
  }[];
}

export const projects: Project[] = [
  {
    id: "packengers",
    title: "Packengers Optimization Engine",
    oneLiner: "AI-driven logistics optimizer for order assignment and route planning",
    problem:
      "Manual order assignment and inefficient routes were limiting delivery capacity and driver efficiency.",
    solution:
      "Designed and implemented an AI optimization engine using OR-Tools for automated order assignment and route planning, with a driver-facing UI for preferences and working hours.",
    technologies: [
      "React",
      "FastAPI",
      "OR-Tools",
      "AWS",
      "Docker",
      "CI/CD",
    ],
    results: [
      "Automated order assignment and route planning",
      "Comprehensive test cases and validation procedures for optimizer accuracy",
      "Driver UI for inputting working hours and preferences",
      "Full documentation for developers and end-users",
      "Scalable cloud deployment on AWS",
    ],
  },
  {
    id: "robotic-manipulation",
    title: "Robotic Manipulation Pipeline",
    oneLiner: "Perception-to-planning pipeline for pick-and-place in uncertain environments",
    problem:
      "Robotic manipulation in uncertain environments required robust perception and high-level planning under uncertainty.",
    solution:
      "Combined synthetic data generation in Blender, YOLOv8 for object detection, reinforcement learning (DQN, Maskable PPO), and probabilistic planning (RDDL, PROST) for an integrated perception-to-planning pipeline.",
    technologies: [
      "Blender",
      "YOLOv8",
      "Python",
      "MATLAB",
      "PROST",
      "RDDL",
    ],
    results: [
      "Improved model robustness with synthetic data in realistic environments",
      "Optimized object detection accuracy with synthetic and real datasets",
      "Integrated perception through high-level planning in robotic applications",
      "End-to-end pipeline for complex robotic manipulation tasks",
    ],
  },
  {
    id: "geospatial-ai",
    title: "Geospatial AI Tools",
    oneLiner: "ML solutions for satellite and georeferenced data analysis",
    problem:
      "Satellite and georeferenced data required efficient analysis and optimization workflows.",
    solution:
      "Developed and implemented AI tools applied to geospatial and satellite data using machine learning, deployed on Microsoft Azure with Unity and ESRI ArcGIS integration.",
    technologies: [
      "Microsoft Azure",
      "Unity",
      "ESRI ArcGIS",
      "Machine Learning",
    ],
    results: [
      "Optimized satellite and georeferenced data analysis",
      "Cloud-based AI solutions for geospatial workflows",
    ],
  },
];

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skills: SkillCategory[] = [
  {
    name: "Languages",
    skills: [
      "Python",
      "JavaScript",
      "C#",
      "C++",
      "R",
      "MATLAB",
      "Solidity",
      "SQL",
    ],
  },
  {
    name: "AI/ML",
    skills: [
      "Computer Vision (YOLOv8)",
      "Reinforcement Learning (DQN, PPO)",
      "LangChain",
      "LangGraph",
    ],
  },
  {
    name: "Optimization",
    skills: ["OR-Tools", "Probabilistic planning (RDDL)"],
  },
  {
    name: "Tools & Platforms",
    skills: ["Blender", "Unity", "Microsoft Azure", "ESRI ArcGIS"],
  },
  {
    name: "Web & DevOps",
    skills: ["React", "FastAPI", "Docker", "AWS", "CI/CD"],
  },
];

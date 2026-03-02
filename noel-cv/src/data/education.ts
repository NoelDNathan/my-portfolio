export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  details: string;
  location: string;
  period: string;
}

export const education: EducationItem[] = [
  {
    id: "upc",
    institution: "Polytechnic University of Catalonia (UPC)",
    degree: "Bachelor's Degree in Artificial Intelligence",
    details: "Final Grade: 8.61 / 10 | Class Rank: 7th in the graduating cohort | Honors: Highest Distinction in Parallelism and Distributed Systems",
    location: "Barcelona, Spain",
    period: "September 2021 – June 2025",
  },
  {
    id: "sert",
    institution: "Institut Josep Lluís Sert",
    degree: "Secondary Education",
    details: "Final Grade: 9.57 / 10 | Honors: Highest Distinction",
    location: "Castelldefels, Spain",
    period: "September 2019 – 2021",
  },
];

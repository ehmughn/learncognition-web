export const modulesSeed = [
  {
    id: "1",
    name: "Neighborhood Explorer",
    description:
      "Students scan real-world objects, compare labels, and earn a summary score that teachers can review in seconds.",
    type: "identify",
    code: "4821936507",
    stats: {
      items: 3,
      scanned: 82,
      taken: 26,
      averageScore: 86,
      passingRate: 91,
    },
    items: [
      { id: "a", label: "Bottle", description: "Plastic bottle on the desk." },
      {
        id: "b",
        label: "Chair",
        description: "Find a chair with a straight back.",
      },
      { id: "c", label: "Notebook", description: "Choose the class notebook." },
    ],
    students: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    name: "Classroom Search Sprint",
    description:
      "A timed search activity where students locate common classroom items in sequence and submit evidence from the camera feed.",
    type: "search",
    code: "9315072468",
    stats: {
      items: 4,
      scanned: 65,
      taken: 18,
      averageScore: 81,
      passingRate: 88,
    },
    items: [
      { id: "a", label: "Eraser", description: "Small white eraser." },
      { id: "b", label: "Marker", description: "Dry erase marker." },
      { id: "c", label: "Ruler", description: "Thirty-centimeter ruler." },
      { id: "d", label: "Scissors", description: "Safety classroom scissors." },
    ],
    students: ["1", "3", "4"],
  },
  {
    id: "3",
    name: "AR Object Match",
    description:
      "A guided identify module using object matching, in-app feedback, and detailed progress reporting for teachers.",
    type: "identify",
    code: "2048571936",
    stats: {
      items: 3,
      scanned: 91,
      taken: 32,
      averageScore: 90,
      passingRate: 95,
    },
    items: [
      {
        id: "a",
        label: "Apple",
        description: "Round red object with glossy surface.",
      },
      {
        id: "b",
        label: "Book",
        description: "Thick hard-cover reading material.",
      },
      { id: "c", label: "Lamp", description: "Table lamp with a cone shade." },
    ],
    students: ["2", "3", "4"],
  },
];

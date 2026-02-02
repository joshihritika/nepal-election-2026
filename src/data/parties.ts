import { Party } from "@/types/election";

export const parties: Party[] = [
  {
    id: "cpn-uml",
    name: "Communist Party of Nepal (Unified Marxist-Leninist)",
    shortName: "CPN-UML",
    color: "#DC2626", // Red
  },
  {
    id: "nc",
    name: "Nepali Congress",
    shortName: "NC",
    color: "#2563EB", // Blue
  },
  {
    id: "rsp",
    name: "Rastriya Swatantra Party",
    shortName: "RSP",
    color: "#F59E0B", // Amber/Orange
  },
  {
    id: "maoist",
    name: "CPN (Maoist Centre)",
    shortName: "CPN-MC",
    color: "#7C3AED", // Purple
  },
  {
    id: "jspn",
    name: "Janata Samajwadi Party Nepal",
    shortName: "JSPN",
    color: "#10B981", // Green
  },
  {
    id: "rpp",
    name: "Rastriya Prajatantra Party",
    shortName: "RPP",
    color: "#EC4899", // Pink
  },
  {
    id: "ujyalo",
    name: "Ujyalo Nepal",
    shortName: "UN",
    color: "#FBBF24", // Yellow
  },
  {
    id: "independent",
    name: "Independent",
    shortName: "IND",
    color: "#6B7280", // Gray
  },
];

export const getPartyById = (id: string): Party | undefined => {
  return parties.find((p) => p.id === id);
};

export const getPartyByShortName = (shortName: string): Party | undefined => {
  return parties.find((p) => p.shortName === shortName);
};

export const getPartyColor = (partyId: string): string => {
  return getPartyById(partyId)?.color || "#6B7280";
};

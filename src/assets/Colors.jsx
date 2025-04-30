export const PORT_COLORS = {
  SBY: "#EF4444", // red
  MKS: "#3B82F6", // blue
  MDN: "#10B981", // green
  JYP: "#EAB308", // yellow
  BPN: "#000000", // black
  BKS: "#F97316", // orange
  BGR: "#EC4899", // pink
  BTH: "#92400E", // brown
  AMQ: "#06B6D4", // cyan
  SMR: "#059669", // teal
};

export const getPortColor = (port) => {
  if (!port) return "#64748B";
  
  const portCode = port.toUpperCase();
  return PORT_COLORS[portCode] || "#64748B";
};

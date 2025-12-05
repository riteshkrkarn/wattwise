export interface AppliancePreset {
  name: string;
  category:
    | "Cooling"
    | "Heating"
    | "Kitchen"
    | "Laundry"
    | "Lighting"
    | "Entertainment"
    | "Other";
  wattage: number;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  { name: "Ceiling Fan", category: "Cooling", wattage: 75 },
  { name: "Table Fan", category: "Cooling", wattage: 50 },
  { name: "AC (1.0 Ton)", category: "Cooling", wattage: 1000 },
  { name: "AC (1.5 Ton)", category: "Cooling", wattage: 1500 },
  { name: "AC (2.0 Ton)", category: "Cooling", wattage: 2000 },
  { name: "Cooler", category: "Cooling", wattage: 150 },

  { name: "LED Bulb", category: "Lighting", wattage: 9 }, // Standard LED
  { name: "Tube Light (LED)", category: "Lighting", wattage: 20 },
  { name: "Tube Light (Old)", category: "Lighting", wattage: 40 },
  { name: "CFL", category: "Lighting", wattage: 15 },

  { name: "Refrigerator (Single Door)", category: "Kitchen", wattage: 150 },
  { name: "Refrigerator (Double Door)", category: "Kitchen", wattage: 250 },
  { name: "Microwave", category: "Kitchen", wattage: 1200 },
  { name: "Induction Cooktop", category: "Kitchen", wattage: 1500 },
  { name: "Electric Kettle", category: "Kitchen", wattage: 1500 },
  { name: "Toaster", category: "Kitchen", wattage: 800 },
  { name: "Mixer Grinder", category: "Kitchen", wattage: 500 },
  { name: "Dishwasher", category: "Kitchen", wattage: 1200 },

  { name: "Washing Machine", category: "Laundry", wattage: 500 },
  { name: "Electric Iron", category: "Laundry", wattage: 1000 },

  { name: 'TV (LED 32-43")', category: "Entertainment", wattage: 60 },
  { name: 'TV (LED 50"+)', category: "Entertainment", wattage: 100 },
  { name: "Desktop Computer", category: "Entertainment", wattage: 200 },
  { name: "Laptop", category: "Entertainment", wattage: 50 },
  { name: "Gaming Console", category: "Entertainment", wattage: 150 },

  { name: "Geyser (Instant)", category: "Heating", wattage: 3000 },
  { name: "Geyser (Storage)", category: "Heating", wattage: 2000 },
  { name: "Room Heater", category: "Heating", wattage: 1500 },

  { name: "Water Pump", category: "Other", wattage: 750 },
];

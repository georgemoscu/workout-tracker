// Predefined gym machines and equipment for workout tracking
export const GYM_MACHINES = [
  "Barbell",
  "Dumbbell",
  "Cable Machine",
  "Smith Machine",
  "Leg Press",
  "Bench Press",
  "Squat Rack",
  "Pull-up Bar",
  "Dip Station",
  "Treadmill",
  "Rowing Machine",
  "Elliptical",
  "Bodyweight",
  "Resistance Bands",
  "Kettlebell",
] as const;

export type GymMachine = (typeof GYM_MACHINES)[number];

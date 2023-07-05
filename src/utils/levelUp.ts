export function levelUp({
  experience,
  currentLevel,
  currentExperience,
}: {
  experience: number;
  currentLevel: number;
  currentExperience: number;
}) {
  let newExperience = currentExperience + experience;
  let newLevel = currentLevel;
  while (newExperience >= 100) {
    newExperience -= 100;
    newLevel++;
  }
  return { newLevel, newExperience };
}

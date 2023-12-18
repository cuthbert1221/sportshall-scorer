function groupAndSortAttempts(attempts) {
    const groupedAttempts = new Map();
  
    attempts.forEach((attempt) => {
      if (!groupedAttempts.has(attempt.signupId)) {
        groupedAttempts.set(attempt.signupId, []);
      }
      groupedAttempts.get(attempt.signupId).push(attempt.score);
    });
  
    // Sort each athlete's attempts in descending order
    groupedAttempts.forEach((scores, signupId) => {
      scores.sort((a, b) => b - a);
    });
  
    return groupedAttempts;
}
  
function compareAthletes(aScores, bScores, isHigherBetter) {
    for (let i = 0; i < Math.min(aScores.length, bScores.length); i++) {
      if (aScores[i] !== bScores[i]) {
        return isHigherBetter ? bScores[i] - aScores[i] : aScores[i] - bScores[i];
      }
    }
    return bScores.length - aScores.length; // More attempts ranks higher if scores are tied
  }
  
function rankEventAttempts(eventAttempts, isHigherBetter = true) {
    const groupedAttempts = groupAndSortAttempts(eventAttempts);
  
    const sortedAthletes = Array.from(groupedAttempts.entries()).sort(
      ([aId, aScores], [bId, bScores]) =>
        compareAthletes(aScores, bScores, isHigherBetter)
    );
  
    let currentRank = 1;
    let athletesInCurrentRank = 0;
  
    sortedAthletes.forEach((athlete, index) => {
      if (index > 0) {
        const prevAthlete = sortedAthletes[index - 1][1];
        if (compareAthletes(athlete[1], prevAthlete, isHigherBetter) !== 0) {
          currentRank += athletesInCurrentRank;
          athletesInCurrentRank = 1;
        } else {
          athletesInCurrentRank++;
        }
      } else {
        athletesInCurrentRank = 1;
      }
      athlete[1].position = currentRank;
    });
  
    return sortedAthletes.map(([signupId, scores]) => ({
      signupId,
      position: scores.position,
    }));
  }
  
  let eventAttempts = [
    { signupId: 1, score: 5 },
    { signupId: 2, score: 4 },
    { signupId: 3, score: 5 },
    { signupId: 3, score: 5 },
    { signupId: 4, score: 5 },
  ];
  // For an event where higher scores are better
  const rankedAthletesHigherIsBetter = rankEventAttempts(eventAttempts, true);
  
  // For an event where lower scores are better
  const rankedAthletesLowerIsBetter = rankEventAttempts(eventAttempts, false);
  
  console.log(rankedAthletesHigherIsBetter);
  console.log(rankedAthletesLowerIsBetter);
  
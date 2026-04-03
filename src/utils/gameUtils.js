export const calculateSpinOdds = (currentScore, targetScore) => {
    // If they haven't taken their first spin, or they busted, no odds needed
    if (currentScore === 0 || currentScore >= 100) return null;

    let winSpaces = 0;
    let tieSpaces = 0;
    let bustSpaces = 0;
    let surviveSpaces = 0;

    // Loop through every physical space on the wheel (5 to 100)
    for (let spinValue = 5; spinValue <= 100; spinValue += 5) {
        const projectedScore = currentScore + spinValue;

        if (projectedScore > 100) {
            bustSpaces++;
        } else if (projectedScore > targetScore) {
            winSpaces++;
        } else if (projectedScore === targetScore) {
            tieSpaces++;
        } else {
            surviveSpaces++;
        }
    }

    // Multiply the tally by 5 to get the exact percentage
    return {
        win: winSpaces * 5,
        tie: tieSpaces * 5,
        bust: bustSpaces * 5,
        survive: surviveSpaces * 5
    };
};
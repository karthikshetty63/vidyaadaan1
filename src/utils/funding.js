const toNonNegativeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
};

export const getAmountRemaining = (budget, amountRaised) => {
    const normalizedBudget = toNonNegativeNumber(budget);
    const normalizedRaised = toNonNegativeNumber(amountRaised);
    return Math.max(0, normalizedBudget - normalizedRaised);
};

export const getFundingPercentage = (budget, amountRaised) => {
    const normalizedBudget = toNonNegativeNumber(budget);
    const normalizedRaised = toNonNegativeNumber(amountRaised);

    if (normalizedBudget === 0) return 0;
    return Math.min(100, Math.round((normalizedRaised / normalizedBudget) * 100));
};

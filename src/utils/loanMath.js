export function calculateEmi(principal, annualRatePercent, months) {
  const monthsCount = Number(months);
  const principalValue = Number(principal);
  if (!principalValue || !monthsCount || monthsCount <= 0) return 0;
  const monthlyRate = annualRatePercent / 12 / 100;
  if (monthlyRate === 0) return principalValue / monthsCount;
  const growth = Math.pow(1 + monthlyRate, monthsCount);
  return (principalValue * monthlyRate * growth) / (growth - 1);
}

export function calculateTotals(principal, annualRatePercent, months) {
  const emi = calculateEmi(principal, annualRatePercent, months);
  const totalRepayable = emi * Number(months);
  return {
    emi: Math.round(emi),
    totalRepayable: Math.round(totalRepayable),
    totalInterest: Math.round(totalRepayable - Number(principal)),
  };
}

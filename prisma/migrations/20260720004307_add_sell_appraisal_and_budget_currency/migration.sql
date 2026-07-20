-- Extend lead operations to cover the commercial flows handled by Hermes.
ALTER TYPE "Operation" ADD VALUE 'SELL';
ALTER TYPE "Operation" ADD VALUE 'APPRAISAL';

-- Preserve the currency supplied with a budget instead of assuming USD.
ALTER TABLE "Lead"
ADD COLUMN "budgetCurrency" TEXT,
ADD COLUMN "assignedAdvisorName" TEXT;

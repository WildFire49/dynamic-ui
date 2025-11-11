// Mock data for Credit Rule Engine

export const loanTypes = [
  { id: "mfi", label: "MFI (Microfinance Institution)" },
  { id: "consumer", label: "Consumer Loan" },
  { id: "gold", label: "Gold Loan" },
  { id: "vehicle", label: "Vehicle Loan" },
  { id: "home", label: "Home Loan" },
  { id: "business", label: "Business Loan" },
  { id: "agriculture", label: "Agriculture Loan" },
  { id: "education", label: "Education Loan" },
  { id: "personal", label: "Personal Loan" },
];

export const accountStatuses = [
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
  { id: "any", label: "Any" },
  { id: "npa", label: "NPA (Non-Performing Asset)" },
  { id: "written_off", label: "Written Off" },
];

export const fields = [
  {
    id: "dpd",
    label: "DPD (Days Past Due)",
    type: "numeric",
    requiresTimePeriod: true,
  },
  {
    id: "overdue_amount",
    label: "Overdue Amount",
    type: "numeric",
    requiresTimePeriod: true,
  },
  {
    id: "loan_status",
    label: "Loan Status",
    type: "text",
    requiresTimePeriod: false,
  },
  {
    id: "active_mfis",
    label: "Number of Active MFIs",
    type: "numeric",
    requiresTimePeriod: false,
  },
  {
    id: "total_outstanding",
    label: "Total Outstanding + Proposed Loan",
    type: "numeric",
    requiresTimePeriod: false,
  },
  {
    id: "credit_score",
    label: "Credit Score",
    type: "numeric",
    requiresTimePeriod: false,
  },
  {
    id: "side_heading",
    label: "Side Heading / Remarks",
    type: "text",
    requiresTimePeriod: false,
  },
  {
    id: "loan_amount",
    label: "Loan Amount",
    type: "numeric",
    requiresTimePeriod: false,
  },
];

export const timePeriods = [
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "last_reported_month", label: "Last Reported Month" },
  { id: "last_90_days", label: "Last 90 Days" },
  { id: "last_6_months", label: "Last 6 Months" },
  { id: "last_year", label: "Last Year" },
  { id: "no_restriction", label: "No Restriction" },
];

export const numericOperators = [
  { id: "gt", label: ">", symbol: ">" },
  { id: "lt", label: "<", symbol: "<" },
  { id: "eq", label: "=", symbol: "=" },
  { id: "gte", label: ">=", symbol: ">=" },
  { id: "lte", label: "<=", symbol: "<=" },
  { id: "between", label: "Between", symbol: "between" },
];

export const textOperators = [
  { id: "equals", label: "Equals", symbol: "equals" },
  { id: "contains", label: "Contains", symbol: "contains" },
  { id: "includes", label: "Includes", symbol: "includes" },
  { id: "not_equals", label: "Not Equals", symbol: "!=" },
];

export const loanStatuses = [
  { id: "written_off", label: "Written Off" },
  { id: "npa", label: "NPA" },
  { id: "settled", label: "Settled Down" },
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
  { id: "overdue", label: "Overdue" },
];

export const outcomes = [
  { id: "reject", label: "Reject", color: "error" },
  { id: "review", label: "Review", color: "warning" },
  { id: "approve", label: "Approve", color: "success" },
];

// Mock rules data
export const mockRules = [
  {
    id: "R1",
    name: "MFI DPD > 0",
    status: true,
    loanTypes: ["mfi"],
    field: "dpd",
    timePeriod: "last_reported_month",
    operator: "gt",
    value: "0",
    outcome: "reject",
    exceptions: ["gold"],
    summary: "If DPD > 0 in the last reported month",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "R2",
    name: "High DPD Consumer Loans",
    status: true,
    loanTypes: ["consumer", "personal"],
    field: "dpd",
    timePeriod: "last_30_days",
    operator: "gt",
    value: "30",
    outcome: "reject",
    exceptions: ["gold"],
    summary: "If DPD > 30 in the last 30 days",
    createdAt: "2024-01-20",
    updatedAt: "2024-02-25",
  },
  {
    id: "R3",
    name: "Low Credit Score Check",
    status: true,
    loanTypes: ["consumer", "personal", "vehicle"],
    field: "credit_score",
    timePeriod: "no_restriction",
    operator: "lt",
    value: "650",
    outcome: "review",
    exceptions: [],
    summary: "If Credit Score < 650",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-28",
  },
  {
    id: "R4",
    name: "Multiple Active MFIs",
    status: false,
    loanTypes: ["mfi"],
    field: "active_mfis",
    timePeriod: "no_restriction",
    operator: "gte",
    value: "3",
    outcome: "review",
    exceptions: [],
    summary: "If Number of Active MFIs >= 3",
    createdAt: "2024-02-10",
    updatedAt: "2024-03-01",
  },
  {
    id: "R5",
    name: "High Outstanding Amount",
    status: true,
    loanTypes: ["consumer", "personal", "business"],
    field: "total_outstanding",
    timePeriod: "no_restriction",
    operator: "gt",
    value: "500000",
    outcome: "review",
    exceptions: ["home", "vehicle"],
    summary: "If Total Outstanding > ₹5,00,000",
    createdAt: "2024-02-15",
    updatedAt: "2024-03-05",
  },
  {
    id: "R6",
    name: "Written Off Loan Status",
    status: true,
    loanTypes: ["consumer", "mfi", "personal"],
    field: "loan_status",
    timePeriod: "no_restriction",
    operator: "includes",
    value: ["written_off", "npa"],
    outcome: "reject",
    exceptions: [],
    summary: "If Loan Status includes Written Off or NPA",
    createdAt: "2024-02-20",
    updatedAt: "2024-03-10",
  },
];

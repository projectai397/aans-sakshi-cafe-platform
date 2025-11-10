/**
 * Financial Dashboard Service
 * P&L statements, cash flow analysis, and expense tracking
 */

type ExpenseCategory = 'rent' | 'utilities' | 'salaries' | 'food_cost' | 'marketing' | 'maintenance' | 'delivery' | 'other';
type TransactionType = 'revenue' | 'expense' | 'investment' | 'loan' | 'refund';

interface Transaction {
  id: string;
  type: TransactionType;
  category: ExpenseCategory | 'sales';
  amount: number;
  description: string;
  date: Date;
  locationId: string;
  reference?: string; // Order ID, Invoice ID, etc.
}

interface DailyFinancials {
  date: Date;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  transactionCount: number;
}

interface MonthlyFinancials {
  month: string;
  revenue: number;
  expenses: Record<ExpenseCategory, number>;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  cashFlow: number;
}

interface ProfitLossStatement {
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: Record<ExpenseCategory, number>;
  totalOperatingExpenses: number;
  operatingProfit: number;
  otherIncome: number;
  otherExpenses: number;
  netProfit: number;
  netMargin: number;
}

interface CashFlowStatement {
  period: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  openingCash: number;
  closingCash: number;
}

interface FinancialAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  averageDailyRevenue: number;
  averageDailyExpenses: number;
  averageDailyProfit: number;
  expenseBreakdown: Record<ExpenseCategory, number>;
  revenueByLocation: Array<{ locationId: string; revenue: number; profit: number; margin: number }>;
  monthlyTrends: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  budgetVsActual: Record<ExpenseCategory, { budget: number; actual: number; variance: number }>;
  cashPosition: number;
  debtOutstanding: number;
  equityValue: number;
}

class FinancialDashboardService {
  private transactions: Map<string, Transaction> = new Map();
  private budgets: Map<string, number> = new Map();
  private dailyFinancials: Map<string, DailyFinancials> = new Map();

  /**
   * Record transaction
   */
  async recordTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const fullTransaction: Transaction = {
      ...transaction,
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.transactions.set(fullTransaction.id, fullTransaction);

    // Update daily financials
    await this.updateDailyFinancials(transaction.date, transaction.locationId);

    return fullTransaction;
  }

  /**
   * Update daily financials
   */
  private async updateDailyFinancials(date: Date, locationId: string): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = Array.from(this.transactions.values()).filter((t) => {
      const tDate = t.date.toISOString().split('T')[0];
      return tDate === dateStr && t.locationId === locationId;
    });

    const revenue = dayTransactions.filter((t) => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const daily: DailyFinancials = {
      date,
      revenue,
      expenses,
      profit,
      profitMargin,
      transactionCount: dayTransactions.length,
    };

    this.dailyFinancials.set(dateStr, daily);
  }

  /**
   * Get daily financials
   */
  async getDailyFinancials(date: Date): Promise<DailyFinancials | null> {
    const dateStr = date.toISOString().split('T')[0];
    return this.dailyFinancials.get(dateStr) || null;
  }

  /**
   * Get monthly financials
   */
  async getMonthlyFinancials(year: number, month: number): Promise<MonthlyFinancials> {
    const monthTransactions = Array.from(this.transactions.values()).filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month - 1;
    });

    const revenue = monthTransactions.filter((t) => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);

    const expenseBreakdown: Record<ExpenseCategory, number> = {
      rent: 0,
      utilities: 0,
      salaries: 0,
      food_cost: 0,
      marketing: 0,
      maintenance: 0,
      delivery: 0,
      other: 0,
    };

    const expenseTransactions = monthTransactions.filter((t) => t.type === 'expense');
    for (const txn of expenseTransactions) {
      if (txn.category !== 'sales') {
        expenseBreakdown[txn.category as ExpenseCategory] += txn.amount;
      }
    }

    const totalExpenses = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0);
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const monthStr = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      month: monthStr,
      revenue,
      expenses: expenseBreakdown,
      totalExpenses,
      profit,
      profitMargin,
      cashFlow: profit, // Simplified: profit = cash flow
    };
  }

  /**
   * Get profit & loss statement
   */
  async getProfitLossStatement(year: number, month: number): Promise<ProfitLossStatement> {
    const monthly = await this.getMonthlyFinancials(year, month);

    const costOfGoodsSold = monthly.expenses.food_cost;
    const grossProfit = monthly.revenue - costOfGoodsSold;
    const grossMargin = monthly.revenue > 0 ? (grossProfit / monthly.revenue) * 100 : 0;

    const operatingExpenses = { ...monthly.expenses };
    delete operatingExpenses.food_cost;

    const totalOperatingExpenses = Object.values(operatingExpenses).reduce((a, b) => a + b, 0);
    const operatingProfit = grossProfit - totalOperatingExpenses;

    const netProfit = operatingProfit;
    const netMargin = monthly.revenue > 0 ? (netProfit / monthly.revenue) * 100 : 0;

    return {
      period: monthly.month,
      revenue: monthly.revenue,
      costOfGoodsSold,
      grossProfit,
      grossMargin,
      operatingExpenses,
      totalOperatingExpenses,
      operatingProfit,
      otherIncome: 0,
      otherExpenses: 0,
      netProfit,
      netMargin,
    };
  }

  /**
   * Get cash flow statement
   */
  async getCashFlowStatement(year: number, month: number): Promise<CashFlowStatement> {
    const monthly = await this.getMonthlyFinancials(year, month);

    const operatingCashFlow = monthly.profit;
    const investingCashFlow = 0; // Would be calculated from investment transactions
    const financingCashFlow = 0; // Would be calculated from loan/equity transactions
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    const monthStr = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      period: monthStr,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      openingCash: 0, // Would be calculated from previous month
      closingCash: netCashFlow,
    };
  }

  /**
   * Set budget
   */
  async setBudget(category: ExpenseCategory, amount: number): Promise<void> {
    this.budgets.set(category, amount);
  }

  /**
   * Get budget
   */
  async getBudget(category: ExpenseCategory): Promise<number | null> {
    return this.budgets.get(category) || null;
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(days: number = 30): Promise<FinancialAnalytics> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const periodTransactions = Array.from(this.transactions.values()).filter((t) => t.date >= startDate);

    const totalRevenue = periodTransactions.filter((t) => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);

    const expenseBreakdown: Record<ExpenseCategory, number> = {
      rent: 0,
      utilities: 0,
      salaries: 0,
      food_cost: 0,
      marketing: 0,
      maintenance: 0,
      delivery: 0,
      other: 0,
    };

    const expenseTransactions = periodTransactions.filter((t) => t.type === 'expense');
    for (const txn of expenseTransactions) {
      if (txn.category !== 'sales') {
        expenseBreakdown[txn.category as ExpenseCategory] += txn.amount;
      }
    }

    const totalExpenses = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const averageDailyRevenue = totalRevenue / days;
    const averageDailyExpenses = totalExpenses / days;
    const averageDailyProfit = netProfit / days;

    // Revenue by location
    const locationRevenue: Record<string, { revenue: number; expenses: number }> = {};
    for (const txn of periodTransactions) {
      if (!locationRevenue[txn.locationId]) {
        locationRevenue[txn.locationId] = { revenue: 0, expenses: 0 };
      }

      if (txn.type === 'revenue') {
        locationRevenue[txn.locationId].revenue += txn.amount;
      } else if (txn.type === 'expense') {
        locationRevenue[txn.locationId].expenses += txn.amount;
      }
    }

    const revenueByLocation = Object.entries(locationRevenue)
      .map(([locationId, data]) => ({
        locationId,
        revenue: data.revenue,
        profit: data.revenue - data.expenses,
        margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthly = await this.getMonthlyFinancials(date.getFullYear(), date.getMonth() + 1);

      monthlyTrends.push({
        month: monthly.month,
        revenue: monthly.revenue,
        expenses: monthly.totalExpenses,
        profit: monthly.profit,
      });
    }

    // Budget vs actual
    const budgetVsActual: Record<ExpenseCategory, { budget: number; actual: number; variance: number }> = {
      rent: { budget: 0, actual: 0, variance: 0 },
      utilities: { budget: 0, actual: 0, variance: 0 },
      salaries: { budget: 0, actual: 0, variance: 0 },
      food_cost: { budget: 0, actual: 0, variance: 0 },
      marketing: { budget: 0, actual: 0, variance: 0 },
      maintenance: { budget: 0, actual: 0, variance: 0 },
      delivery: { budget: 0, actual: 0, variance: 0 },
      other: { budget: 0, actual: 0, variance: 0 },
    };

    for (const [category, actual] of Object.entries(expenseBreakdown)) {
      const budget = this.budgets.get(category as ExpenseCategory) || 0;
      budgetVsActual[category as ExpenseCategory] = {
        budget,
        actual,
        variance: budget - actual,
      };
    }

    return {
      totalRevenue: Math.round(totalRevenue),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      profitMargin: Math.round(profitMargin * 100) / 100,
      averageDailyRevenue: Math.round(averageDailyRevenue),
      averageDailyExpenses: Math.round(averageDailyExpenses),
      averageDailyProfit: Math.round(averageDailyProfit),
      expenseBreakdown,
      revenueByLocation,
      monthlyTrends,
      budgetVsActual,
      cashPosition: netProfit,
      debtOutstanding: 0,
      equityValue: 0,
    };
  }

  /**
   * Get expense report
   */
  async getExpenseReport(category: ExpenseCategory, days: number = 30): Promise<any> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const categoryTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.category === category && t.type === 'expense' && t.date >= startDate
    );

    const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = categoryTransactions.length > 0 ? totalAmount / categoryTransactions.length : 0;
    const budget = this.budgets.get(category) || 0;
    const variance = budget - totalAmount;

    return {
      category,
      period: `Last ${days} days`,
      totalAmount: Math.round(totalAmount),
      averageAmount: Math.round(averageAmount),
      transactionCount: categoryTransactions.length,
      budget,
      variance,
      variancePercentage: budget > 0 ? (variance / budget) * 100 : 0,
      transactions: categoryTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10),
    };
  }
}

export default FinancialDashboardService;

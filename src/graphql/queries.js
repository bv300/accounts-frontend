import { gql } from '@apollo/client';

// ── Auth ──
export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $firstName: String, $lastName: String) {
    register(username: $username, email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
      user { id username email role }
      success
    }
  }
`;

export const ME = gql`
  query Me {
    me { id username email firstName lastName role }
  }
`;

// ── Company & Accounts ──
export const ALL_COMPANIES = gql`
  query AllCompanies {
    allCompanies { id name legalName gstin city state currency }
  }
`;

export const CREATE_COMPANY = gql`
  mutation CreateCompany($name: String!, $gstin: String, $city: String, $state: String, $currency: String) {
    createCompany(name: $name, gstin: $gstin, city: $city, state: $state, currency: $currency) {
      company { id name }
    }
  }
`;

export const ALL_ACCOUNT_GROUPS = gql`
  query AllAccountGroups($companyId: ID!, $nature: String) {
    allAccountGroups(companyId: $companyId, nature: $nature) {
      id name nature description
      parent { id name }
    }
  }
`;

export const ALL_ACCOUNTS = gql`
  query AllAccounts($companyId: ID!, $groupId: ID, $isActive: Boolean) {
    allAccounts(companyId: $companyId, groupId: $groupId, isActive: $isActive) {
      id name code description openingBalance isActive
      group { id name nature }
    }
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($companyId: ID!, $groupId: ID!, $name: String!, $code: String, $description: String, $openingBalance: Decimal) {
    createAccount(companyId: $companyId, groupId: $groupId, name: $name, code: $code, description: $description, openingBalance: $openingBalance) {
      account { id name code }
    }
  }
`;

// ── Journal Entries ──
export const ALL_JOURNAL_ENTRIES = gql`
  query AllJournalEntries($companyId: ID!, $fiscalYearId: ID, $voucherType: String) {
    allJournalEntries(companyId: $companyId, fiscalYearId: $fiscalYearId, voucherType: $voucherType) {
      id voucherType voucherNumber date narration isPosted totalAmount
      lines { id account { id name } debit credit }
    }
  }
`;

export const CREATE_JOURNAL_ENTRY = gql`
  mutation CreateJournalEntry($companyId: ID!, $fiscalYearId: ID!, $date: Date!, $narration: String, $voucherType: String, $lines: [JournalEntryLineInput]!) {
    createJournalEntry(companyId: $companyId, fiscalYearId: $fiscalYearId, date: $date, narration: $narration, voucherType: $voucherType, lines: $lines) {
      journalEntry { id voucherNumber }
      success
    }
  }
`;

// ── Sales ──
export const ALL_CUSTOMERS = gql`
  query AllCustomers($companyId: ID!) {
    allCustomers(companyId: $companyId) {
      id name gstin email phone billingAddress state
    }
  }
`;

export const ALL_SALES_INVOICES = gql`
  query AllSalesInvoices($companyId: ID!, $status: String) {
    allSalesInvoices(companyId: $companyId, status: $status) {
      id invoiceNumber date dueDate status subtotal taxAmount totalAmount amountPaid balanceDue
      customer { id name }
    }
  }
`;

export const CREATE_SALES_INVOICE = gql`
  mutation CreateSalesInvoice(
    $companyId: ID!, $customerId: ID!, $invoiceNumber: String!, $date: Date!,
    $fiscalYearId: ID!, $lines: [InvoiceLineInput]!, $dueDate: Date, $placeOfSupply: String
  ) {
    createSalesInvoice(
      companyId: $companyId, customerId: $customerId, invoiceNumber: $invoiceNumber,
      date: $date, fiscalYearId: $fiscalYearId, lines: $lines, dueDate: $dueDate,
      placeOfSupply: $placeOfSupply
    ) {
      invoice { id invoiceNumber totalAmount }
    }
  }
`;

// ── Purchases ──
export const ALL_VENDORS = gql`
  query AllVendors($companyId: ID!) {
    allVendors(companyId: $companyId) {
      id name gstin email phone address state
    }
  }
`;

export const ALL_PURCHASE_INVOICES = gql`
  query AllPurchaseInvoices($companyId: ID!, $status: String) {
    allPurchaseInvoices(companyId: $companyId, status: $status) {
      id invoiceNumber date dueDate status subtotal taxAmount totalAmount amountPaid balanceDue itcEligible
      vendor { id name }
    }
  }
`;

// ── Expenses ──
export const ALL_EXPENSE_VOUCHERS = gql`
  query AllExpenseVouchers($companyId: ID!, $status: String) {
    allExpenseVouchers(companyId: $companyId, status: $status) {
      id voucherNumber date paidTo totalAmount taxAmount status
    }
  }
`;

// ── Tax ──
export const ALL_TAX_RATES = gql`
  query AllTaxRates($companyId: ID!, $taxType: String) {
    allTaxRates(companyId: $companyId, taxType: $taxType) {
      id name taxType rate
      components { id name componentType rate }
    }
  }
`;

// ── Reports ──
export const TRIAL_BALANCE = gql`
  query TrialBalance($companyId: ID!, $fromDate: Date, $toDate: Date) {
    trialBalance(companyId: $companyId, fromDate: $fromDate, toDate: $toDate) {
      accountId accountName accountCode groupName nature debit credit
    }
  }
`;

export const PROFIT_AND_LOSS = gql`
  query ProfitAndLoss($companyId: ID!, $fromDate: Date!, $toDate: Date!) {
    profitAndLoss(companyId: $companyId, fromDate: $fromDate, toDate: $toDate) {
      revenueItems { accountId accountName amount }
      expenseItems { accountId accountName amount }
      totalRevenue totalExpense netProfit
    }
  }
`;

export const BALANCE_SHEET = gql`
  query BalanceSheet($companyId: ID!, $asOfDate: Date!) {
    balanceSheet(companyId: $companyId, asOfDate: $asOfDate) {
      assets { accountId accountName amount }
      liabilities { accountId accountName amount }
      equity { accountId accountName amount }
      totalAssets totalLiabilities totalEquity
    }
  }
`;

export const DASHBOARD = gql`
  query Dashboard($companyId: ID!, $fromDate: Date!, $toDate: Date!) {
    dashboard(companyId: $companyId, fromDate: $fromDate, toDate: $toDate) {
      totalRevenue totalExpenses netProfit receivables payables cashBalance
    }
  }
`;

// ── Fiscal Years ──
export const ALL_FISCAL_YEARS = gql`
  query AllFiscalYears($companyId: ID!) {
    allFiscalYears(companyId: $companyId) {
      id name startDate endDate isActive isClosed
    }
  }
`;

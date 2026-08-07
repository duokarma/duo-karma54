import { AutomationJob } from './engine';
import { alwaysRun, hasOverdueInvoices, hasUrgentProjects } from './conditions';
import { generateProactiveInsights } from './insights';
import { createSystemNotification, generateDailyDashboardSummary } from './actions';

export const JOB_REGISTRY: AutomationJob[] = [
  {
    id: 'daily-dashboard-summary',
    name: 'Daily Dashboard Summary',
    description: 'Generates a high-level business summary every day.',
    trigger: { type: 'schedule', value: 'daily' },
    condition: alwaysRun,
    action: generateDailyDashboardSummary
  },
  {
    id: 'invoice-reminders',
    name: 'Invoice Reminders',
    description: 'Checks for overdue invoices and creates an urgent notification.',
    trigger: { type: 'schedule', value: 'daily' },
    condition: hasOverdueInvoices,
    action: createSystemNotification('You have overdue invoices that require attention.', 'urgent')
  },
  {
    id: 'urgent-project-alerts',
    name: 'Urgent Project Alerts',
    description: 'Checks for projects at risk or nearing deadlines.',
    trigger: { type: 'schedule', value: 'daily' },
    condition: hasUrgentProjects,
    action: createSystemNotification('One or more projects are at risk or due soon.', 'warning')
  },
  {
    id: 'invoice-created-event',
    name: 'Invoice Creation Logger',
    description: 'Logs when a new invoice is created via webhook.',
    trigger: { type: 'event', value: 'invoice.created' },
    condition: alwaysRun,
    action: createSystemNotification('A new invoice was just created.', 'info')
  },
  {
    id: 'weekly-proactive-insights',
    name: 'Weekly Proactive Insights',
    description: 'Analyzes weekly performance and generates actionable insights.',
    trigger: { type: 'schedule', value: 'weekly' },
    condition: alwaysRun,
    action: generateProactiveInsights
  }
];

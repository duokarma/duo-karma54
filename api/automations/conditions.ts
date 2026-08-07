import { AutomationCondition } from './engine';

export const alwaysRun: AutomationCondition = async () => true;

export const hasOverdueInvoices: AutomationCondition = async (supabase) => {
  const now = new Date().toISOString();
  // Check if invoices table exists, fallback to clients
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id')
    .neq('status', 'Paid')
    .lt('dueDate', now)
    .limit(1);

  if (error) {
    // Fallback: check clients with totalValue > amountPaid
    const { data: clients } = await supabase.from('clients').select('id, totalValue, amountPaid');
    const overdue = (clients || []).filter((c: any) => (c.totalValue || 0) > (c.amountPaid || 0));
    return overdue.length > 0;
  }
  
  return (invoices && invoices.length > 0);
};

export const hasUrgentProjects: AutomationCondition = async (supabase) => {
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, progress, dueDate');
    
  const now = new Date();
  const urgent = (projects || []).filter((p: any) => {
    if (p.status === 'Completed' || p.progress === 100) return false;
    if (p.status === 'At Risk' || p.status === 'Delayed') return true;
    const dueDate = new Date(p.dueDate);
    const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  return urgent.length > 0;
};

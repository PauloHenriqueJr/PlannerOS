export type TemplateKind = 'tasks' | 'habits' | 'table';

export interface PlannerTemplate {
  id: string;
  labelKey: string;
  kind: TemplateKind;
  items: string[] | [string, string][];
}

export const TEMPLATES: Record<TemplateKind, PlannerTemplate[]> = {
  tasks: [
    {
      id: 'morning-reset',
      labelKey: 'tpl_morning_reset',
      kind: 'tasks',
      items: ['task_water', 'task_priority', 'task_meditate'],
    },
    {
      id: 'admin-sweep',
      labelKey: 'tpl_admin_sweep',
      kind: 'tasks',
      items: ['task_call_doc', 'task_pay_bills', 'task_read_20'],
    },
  ],
  habits: [
    {
      id: 'wellness-basics',
      labelKey: 'tpl_wellness_basics',
      kind: 'habits',
      items: ['habit_water_2l', 'habit_sun', 'habit_sleep_8'],
    },
    {
      id: 'mood-check',
      labelKey: 'tpl_mood_check',
      kind: 'habits',
      items: ['well_mood_ex1', 'well_mood_ex2', 'well_mood_ex3'],
    },
  ],
  table: [
    {
      id: 'project-board',
      labelKey: 'tpl_project_board',
      kind: 'table',
      items: [['proj_1', 'stat_progress'], ['proj_2', 'stat_pending']],
    },
    {
      id: 'finance-starter',
      labelKey: 'tpl_finance_starter',
      kind: 'table',
      items: [['adhd_money_ex1', 'adhd_money_ex1_val'], ['adhd_money_ex2', 'adhd_money_ex2_val']],
    },
  ],
};

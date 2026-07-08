import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }    from '@/app/providers/LanguageProvider';
import { Card }       from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ROUTES }     from '@/app/router/routes';
import { useProjectDetails }   from '../hooks/useProjectDetails';
import { usePmTaskLookups }    from '../hooks/usePmTaskLookups';
import { pmProjectTeamApi }    from '../api/project.api';
import type { PmProjectTeamMember } from '../types/project.types';
import { pmTaskApi } from '../../tasks/api/task.api';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { PmTaskFormFields, type PmTaskFormState } from '../components/PmTaskFormFields';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

const INITIAL: PmTaskFormState = {
  title: '', description: '', priority: '', status: '',
  assigneeId: '', dueDate: '', estimatedHours: '', phaseId: '',
};

export function AddPmTaskPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { project, isLoading } = useProjectDetails(id);
  const { statuses, priorities } = usePmTaskLookups();
  const invalidateTasks = useInvalidateProjectTasks(id);

  const { data: team = [] } = useQuery({
    queryKey: ['pm-project', id, 'team'],
    queryFn:  () => pmProjectTeamApi.list(id, { per_page: 100 }).then((r): PmProjectTeamMember[] => r.data.data.data),
    enabled:  !!id,
  });

  const [form, setForm]         = useState<PmTaskFormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof PmTaskFormState>(key: K, val: PmTaskFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  useEffect(() => {
    if (!form.priority && priorities.length > 0) set('priority', priorities[0].value);
    if (!form.status && statuses.length > 0) set('status', statuses[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorities, statuses]);

  const goBack = () => navigate(ROUTES.PROJECT_MANAGER.DETAILS(id));
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const teamItems:     ComboboxItem[] = team.map(m => ({ id: m.id, label: m.name, detail: m.jobTitle }));
  const phaseItems:    ComboboxItem[] = (project?.phases ?? []).map(p => ({ id: String(p.id), label: p.name }));
  const priorityItems: ComboboxItem[] = priorities.map(p => ({
    id:    p.value,
    label: translateProjectLookup(p.value, p.label, isAr, p.labelAr),
  }));
  const statusItems: ComboboxItem[] = statuses.map(s => ({
    id:    s.value,
    label: translateProjectLookup(s.value, s.label, isAr, s.labelAr),
  }));

  const isValid = !!(form.title.trim() && form.assigneeId && form.priority && form.status && form.dueDate && form.phaseId);

  async function handleAdd() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await pmTaskApi.create(id, {
        title:           form.title.trim(),
        description:     form.description.trim() || undefined,
        employee_id:     form.assigneeId,
        priority:        form.priority,
        due_date:        form.dueDate,
        estimated_hours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        phase_id:        Number(form.phaseId),
        status:          form.status,
      });
      invalidateTasks();
      toast.success(isAr ? 'تمت إضافة المهمة' : 'Task added');
      goBack();
    } catch {
      toast.error(isAr ? 'فشل إضافة المهمة' : 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'إضافة مهمة' : 'Add Task'}
        subtitle={
          project?.name
            ? (isAr ? `مشروع: ${project.name}` : `Project: ${project.name}`)
            : (isAr ? 'أضف مهمة جديدة للمشروع' : 'Add a new task to the project')
        }
        start={
          <Button
            variant="ghost"
            type="button"
            onClick={goBack}
            className="p-2"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </Button>
        }
      />

      <Card padding="lg">
        <PmTaskFormFields
          form={form}
          set={set}
          teamItems={teamItems}
          phaseItems={phaseItems}
          priorityItems={priorityItems}
          statusItems={statusItems}
          isAr={isAr}
        />

        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-gray-700/60">
          <Button
            variant="primary"
            disabled={!isValid || submitting}
            onClick={handleAdd}
            startIcon={<Check size={16} />}
          >
            {submitting
              ? (isAr ? 'جاري الحفظ...' : 'Saving…')
              : (isAr ? 'إضافة مهمة' : 'Add Task')}
          </Button>
          <Button variant="secondary" onClick={goBack} startIcon={<X size={15} />}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      </Card>

    </div>
  );
}

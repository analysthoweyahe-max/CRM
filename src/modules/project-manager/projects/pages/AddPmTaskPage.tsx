import { useState, useEffect, useMemo } from 'react';
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
import { pmProjectLookupsApi, pmProjectTeamApi, pmProjectsApi } from '../api/project.api';
import type { PmAvailableMember, PmProjectTeamMember, PmProjectPhase } from '../types/project.types';
import { pmTaskApi, normalizePmTaskPriority } from '../../tasks/api/task.api';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { PmTaskFormFields, type PmTaskFormState } from '../components/PmTaskFormFields';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { extractApiError } from '@/shared/utils/error.utils';

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

  const projectTypeId = project?.projectTypeId;

  const { data: assignees = [] } = useQuery({
    queryKey: ['pm-project-lookups', 'employees', projectTypeId],
    queryFn: async () => {
      const res = await pmProjectLookupsApi.employees({ project_type_id: projectTypeId! });
      return toApiArray<PmAvailableMember>(res.data.data);
    },
    enabled: !!projectTypeId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['pm-project', id, 'team'],
    queryFn: async () => {
      const res = await pmProjectTeamApi.list(id, { per_page: 100 });
      return toApiArray<PmProjectTeamMember>(res.data.data);
    },
    enabled: !!id,
  });

  const { data: projectPhases = [], isError: phasesError } = useQuery({
    queryKey: ['pm-project', id, 'phases'],
    queryFn:  async () => {
      const res = await pmProjectsApi.phases(id);
      return toApiArray<PmProjectPhase>(res.data.data);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (phasesError) {
      toast.error(isAr ? 'فشل تحميل مراحل المشروع' : 'Failed to load project phases');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phasesError]);

  const teamMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const member of teamMembers) ids.add(member.id);
    for (const member of project?.teamMembers ?? []) ids.add(member.id);
    return ids;
  }, [teamMembers, project?.teamMembers]);

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

  const teamItems:     ComboboxItem[] = assignees.map(m => ({ id: m.id, label: m.name, detail: m.jobTitle }));
  const phases = projectPhases.length > 0 ? projectPhases : (project?.phases ?? []);
  const phaseItems:    ComboboxItem[] = phases.map(p => ({ id: String(p.id), label: p.name }));
  const priorityItems: ComboboxItem[] = priorities.map(p => ({
    id:    p.value,
    label: translateProjectLookup(p.value, p.label, isAr, p.labelAr),
  }));
  const statusItems: ComboboxItem[] = statuses.map(s => ({
    id:    s.value,
    label: translateProjectLookup(s.value, s.label, isAr, s.labelAr),
  }));

  const isValid = !!(form.title.trim() && form.assigneeId && form.priority && form.status && form.dueDate && form.phaseId);

  async function ensureAssigneeOnTeam(assigneeId: string) {
    if (teamMemberIds.has(assigneeId)) return;

    const selected = assignees.find(m => m.id === assigneeId);
    const projectRole =
      selected?.jobTitle?.trim()
      || selected?.projectRole?.trim()
      || (isAr ? 'عضو الفريق' : 'Team Member');

    await pmProjectTeamApi.addMember(id, { employee_id: assigneeId, project_role: projectRole });
  }

  async function handleAdd() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await ensureAssigneeOnTeam(form.assigneeId);

      await pmTaskApi.create(id, {
        title:           form.title.trim(),
        description:     form.description.trim() || undefined,
        employeeId:      form.assigneeId,
        priority:        normalizePmTaskPriority(form.priority),
        dueDate:         form.dueDate,
        estimatedHours:  form.estimatedHours ? Number(form.estimatedHours) : undefined,
        phaseId:         Number(form.phaseId),
        status:          form.status,
      });
      invalidateTasks();
      toast.success(isAr ? 'تمت إضافة المهمة' : 'Task added');
      goBack();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'فشل إضافة المهمة' : 'Failed to add task'));
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

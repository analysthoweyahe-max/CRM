import { useState }                        from 'react';
import { useMutation, useQueryClient }      from '@tanstack/react-query';
import { campaignApi }                      from '../api/campaign.api';
import type { AddSeoTaskForm }              from './AddSeoTaskModal.types';

const INITIAL: AddSeoTaskForm = {
  title:          '',
  phase:          '',
  description:    '',
  assignee:       '',
  priority:       'medium',
  dueDate:        '',
  estimatedHours: '',
  targetKeyword:  '',
  targetUrl:      '',
};

export function useAddSeoTask(
  campaignId: string,
  prefillUrl: string,
  onClose:    () => void,
) {
  const queryClient = useQueryClient();
  const [form,      setForm]     = useState<AddSeoTaskForm>({ ...INITIAL, targetUrl: prefillUrl });
  const [apiError,  setApiError] = useState<string | null>(null);

  function set<K extends keyof AddSeoTaskForm>(key: K, val: AddSeoTaskForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setApiError(null);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title:            form.title.trim(),
        phase:            form.phase.trim(),
        employee_ids:     [form.assignee],
        description:      form.description.trim() || undefined,
        priority:         form.priority || undefined,
        due_date:         form.dueDate            || undefined,
        estimated_hours:  form.estimatedHours ? Number(form.estimatedHours) : undefined,
        target_keyword:   form.targetKeyword.trim() || undefined,
        target_url:       form.targetUrl.trim()     || undefined,
      };
      return campaignApi.createTask(campaignId, payload);
    },

    onSuccess: () => {
      /* Refetch so the kanban shows the task with a fully populated assignee name
         — the create response itself doesn't return a resolved assignee. */
      queryClient.refetchQueries({ queryKey: ['campaign-tasks', campaignId] });

      setForm({ ...INITIAL, targetUrl: prefillUrl });
      onClose();
    },

    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'حدث خطأ أثناء إضافة المهمة';
      setApiError(msg);
    },
  });

  return {
    form,
    apiError,
    set,
    isValid:   !!form.title.trim() && !!form.assignee && !!form.phase.trim(),
    isSaving:  mutation.isPending,
    handleAdd: () => mutation.mutate(),
  };
}

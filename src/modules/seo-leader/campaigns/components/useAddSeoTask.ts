import { useState }                        from 'react';
import { useMutation, useQueryClient }      from '@tanstack/react-query';
import { campaignApi }                      from '../api/campaign.api';
import type { SeoTask }                     from '../api/campaign.api';
import type { AddSeoTaskForm }              from './AddSeoTaskModal.types';

const INITIAL: AddSeoTaskForm = {
  title:          '',
  description:    '',
  assignee:       '',
  priority:       'medium',
  dueDate:        '',
  estimatedHours: '',
  stage:          '',
  targetKeyword:  '',
  targetUrl:      '',
};

export function useAddSeoTask(
  campaignId: string,
  prefillUrl: string,
  onClose:    () => void,
  onCreated?: (task: SeoTask) => void,
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
        description:      form.description.trim() || undefined,
        assignee:         form.assignee           || undefined,
        priority:         form.priority,
        due_date:         form.dueDate            || undefined,
        estimated_hours:  form.estimatedHours ? Number(form.estimatedHours) : undefined,
        stage:            form.stage              || undefined,
        target_keyword:   form.targetKeyword.trim() || undefined,
        target_url:       form.targetUrl.trim()     || undefined,
        status:           'pending' as const,
      };
      return campaignApi.createTask(campaignId, payload);
    },

    onSuccess: (response) => {
      /* Immediately show the task in the kanban via callback */
      const newTask = response?.data?.data;
      if (newTask) onCreated?.(newTask);

      /* Also force a background refetch so the list is in sync */
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
    isValid:   !!form.title.trim(),
    isSaving:  mutation.isPending,
    handleAdd: () => mutation.mutate(),
  };
}

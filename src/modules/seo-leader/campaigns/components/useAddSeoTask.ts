import { useState }                        from 'react';
import { useMutation, useQueryClient }      from '@tanstack/react-query';
import { campaignApi }                      from '../api/campaign.api';
import type { AddSeoTaskForm }              from './AddSeoTaskModal.types';
import { normalizeImportantLinks, validateImportantLinks } from '@/shared/utils/importantLinks.utils';
import { invalidateSeoMemberHomeTasks } from '@/shared/modules/my-tasks/utils/invalidateHomeTasks.utils';

const INITIAL: AddSeoTaskForm = {
  title:            '',
  phase:            '',
  description:      '',
  assignees:        [],
  priority:         'medium',
  dueDate:          '',
  estimatedHours:   '',
  estimatedMinutes: '',
  targetKeyword:    '',
  targetUrl:        '',
  importantLinks:   [],
};

export function useAddSeoTask(
  campaignId: string,
  prefillUrl: string,
  onClose:    () => void,
  isAr:       boolean,
) {
  const queryClient = useQueryClient();
  const [form,      setForm]     = useState<AddSeoTaskForm>({ ...INITIAL, targetUrl: prefillUrl });
  const [files,     setFiles]    = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError,  setApiError] = useState<string | null>(null);
  const [touched, setTouched]           = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function set<K extends keyof AddSeoTaskForm>(key: K, val: AddSeoTaskForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setTouched(prev => (prev[key] ? prev : { ...prev, [key]: true }));
    setApiError(null);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const importantLinks = normalizeImportantLinks(form.importantLinks);
      const payload = {
        title:            form.title.trim(),
        phase:            form.phase.trim(),
        employee_ids:     form.assignees,
        description:      form.description.trim() || undefined,
        priority:         form.priority || undefined,
        due_date:         form.dueDate            || undefined,
        estimated_hours:  form.estimatedHours ? Number(form.estimatedHours) : undefined,
        estimated_minutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
        target_keyword:   form.targetKeyword.trim() || undefined,
        target_url:       form.targetUrl.trim()     || undefined,
        ...(importantLinks.length ? { importantLinks } : {}),
      };
      return campaignApi.createTask(campaignId, payload, files.length ? files : undefined);
    },

    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['campaign-tasks', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['seo-member-project'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      invalidateSeoMemberHomeTasks(queryClient);

      setForm({ ...INITIAL, targetUrl: prefillUrl });
      setFiles([]);
      setFileError(null);
      setTouched({});
      setSubmitAttempted(false);
      onClose();
    },

    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'حدث خطأ أثناء إضافة المهمة';
      setApiError(msg);
    },
  });

  const fieldErrors: Record<string, string> = {};
  if (!form.title.trim())  fieldErrors.title    = isAr ? 'عنوان المهمة مطلوب' : 'Task title is required';
  if (form.assignees.length === 0) fieldErrors.assignees = isAr ? 'اختر مسؤولاً واحداً على الأقل' : 'Select at least one assignee';
  if (!form.phase.trim())  fieldErrors.phase    = isAr ? 'المرحلة مطلوبة' : 'Phase is required';
  const linksError = validateImportantLinks(form.importantLinks, isAr);
  if (linksError) fieldErrors.importantLinks = linksError;

  const isValid = Object.keys(fieldErrors).length === 0;

  const errors: Record<string, string> = {};
  for (const key of Object.keys(fieldErrors)) {
    if (touched[key] || submitAttempted) errors[key] = fieldErrors[key];
  }

  return {
    form,
    files,
    setFiles,
    fileError,
    setFileError,
    apiError,
    set,
    isValid,
    errors,
    isSaving:  mutation.isPending,
    handleAdd: () => {
      setSubmitAttempted(true);
      if (!isValid || mutation.isPending) return;
      mutation.mutate();
    },
  };
}

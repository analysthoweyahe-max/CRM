import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import {
  useTemplateList, useCreateTemplate, useUpdateTemplate, useDeleteTemplate,
} from './useProjectTemplates';
import type { TemplateModule } from '../api/projectTemplate.api';
import type { PmProjectTemplate, PmTemplatePayload } from '../types/template.types';

export function useTemplatesPage(isAr: boolean, module: TemplateModule = 'pm') {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useTemplateList(module, {
    search: search.trim() || undefined,
    page,
    per_page: 15,
  });
  const { mutate: create, isPending: creating } = useCreateTemplate(module);
  const { mutate: update, isPending: updating } = useUpdateTemplate(module);
  const { mutate: remove, isPending: deleting } = useDeleteTemplate(module);

  const [showAdd, setShowAdd]           = useState(false);
  const [editing, setEditing]           = useState<PmProjectTemplate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PmProjectTemplate | null>(null);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function submitAdd(payload: PmTemplatePayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء القالب' : 'Template created');
        setShowAdd(false);
        setFieldErrors({});
      },
      onError: (err) => {
        const apiFieldErrors = extractApiFieldErrors(err);
        if (Object.keys(apiFieldErrors).length) {
          setFieldErrors(apiFieldErrors);
          return;
        }
        toast.error(extractApiError(err));
      },
    });
  }

  function submitEdit(payload: PmTemplatePayload) {
    if (!editing) return;
    update({ uuid: editing.uuid, payload }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث القالب' : 'Template updated');
        setEditing(null);
        setFieldErrors({});
      },
      onError: (err) => {
        const apiFieldErrors = extractApiFieldErrors(err);
        if (Object.keys(apiFieldErrors).length) {
          setFieldErrors(apiFieldErrors);
          return;
        }
        toast.error(extractApiError(err));
      },
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.uuid, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف القالب' : 'Template deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    search, setSearch,
    page, setPage,
    templates: data?.items ?? [],
    lastPage:  data?.lastPage ?? 1,
    total:     data?.total ?? 0,
    isLoading,
    showAdd, openAdd: () => { setFieldErrors({}); setShowAdd(true); }, closeAdd: () => { setShowAdd(false); setFieldErrors({}); },
    submitAdd, creating,
    editing, openEdit: (t: PmProjectTemplate) => { setFieldErrors({}); setEditing(t); }, closeEdit: () => { setEditing(null); setFieldErrors({}); },
    submitEdit, updating,
    fieldErrors, clearFieldError,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}

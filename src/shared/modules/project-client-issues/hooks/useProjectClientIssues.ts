import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectClientIssueApi } from '../api/projectClientIssue.api';
import {
  clientIssueResourceKey,
  defaultClientIssueCapabilities,
  normalizeClientIssueList,
} from '../utils/clientIssue.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import type {
  ClientIssue,
  ClientIssueStatus,
  CreateClientIssuePayload,
  ProjectClientIssuePortal,
  UpdateClientIssuePayload,
} from '../types/projectClientIssue.types';

function queryKey(portal: ProjectClientIssuePortal, projectId: string) {
  return ['project-client-issues', portal, projectId] as const;
}

function resolveFlag(issueFlag: boolean | undefined, capabilityFlag: boolean): boolean {
  return issueFlag !== undefined ? issueFlag : capabilityFlag;
}

export function useProjectClientIssues(
  portal: ProjectClientIssuePortal,
  projectId: string,
  isAr: boolean,
) {
  const qc = useQueryClient();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ClientIssueStatus>>({});
  const portalDefaults = defaultClientIssueCapabilities(portal);

  const listQuery = useQuery({
    queryKey: queryKey(portal, projectId),
    queryFn: async () => {
      const res = await projectClientIssueApi.list(portal, projectId);
      const body = res.data as unknown as Record<string, unknown>;
      // Pass full envelope so top-level `capabilities` is not dropped when
      // unwrapping `data`.
      return normalizeClientIssueList(body.data ?? body, portal, body.capabilities);
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  // seo-member / managers: if list fails or capabilities omitted → still can create
  const capabilities = listQuery.data?.capabilities ?? portalDefaults;

  const issues = useMemo(() => {
    const raw = listQuery.data?.data ?? [];
    return raw.map(issue => {
      const key = String(issue.id);
      const override = statusOverrides[key];
      return override ? { ...issue, status: override } : issue;
    });
  }, [listQuery.data?.data, statusOverrides]);

  function invalidate() {
    qc.invalidateQueries({ queryKey: queryKey(portal, projectId) });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateClientIssuePayload) =>
      projectClientIssueApi.create(portal, projectId, payload).then(r => r.data.data),
    onSuccess: () => {
      toast.success(isAr ? 'تم إضافة المشكلة' : 'Issue added');
      invalidate();
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر إضافة المشكلة' : 'Failed to add issue'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ issue, payload }: { issue: ClientIssue; payload: UpdateClientIssuePayload }) =>
      projectClientIssueApi
        .update(portal, projectId, clientIssueResourceKey(issue), payload)
        .then(r => r.data.data),
    onSuccess: () => {
      toast.success(isAr ? 'تم تحديث المشكلة' : 'Issue updated');
      invalidate();
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث المشكلة' : 'Failed to update issue'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (issue: ClientIssue) =>
      projectClientIssueApi.remove(portal, projectId, clientIssueResourceKey(issue)),
    onSuccess: () => {
      toast.success(isAr ? 'تم حذف المشكلة' : 'Issue deleted');
      invalidate();
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر حذف المشكلة' : 'Failed to delete issue'));
    },
  });

  async function updateStatus(issue: ClientIssue, status: ClientIssueStatus) {
    const issueKey = String(issue.id);
    setStatusOverrides(prev => ({ ...prev, [issueKey]: status }));
    try {
      await projectClientIssueApi.updateStatus(
        portal,
        projectId,
        clientIssueResourceKey(issue),
        { status },
      );
      setStatusOverrides(prev => {
        const next = { ...prev };
        delete next[issueKey];
        return next;
      });
      invalidate();
    } catch (err) {
      setStatusOverrides(prev => {
        const next = { ...prev };
        delete next[issueKey];
        return next;
      });
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث الحالة' : 'Failed to update status'));
    }
  }

  async function uploadImage(issue: ClientIssue, file: File) {
    try {
      await projectClientIssueApi.uploadImage(portal, projectId, clientIssueResourceKey(issue), file);
      toast.success(isAr ? 'تم رفع الصورة' : 'Image uploaded');
      invalidate();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر رفع الصورة' : 'Failed to upload image'));
    }
  }

  async function uploadFile(issue: ClientIssue, file: File) {
    try {
      await projectClientIssueApi.uploadFile(portal, projectId, clientIssueResourceKey(issue), file);
      toast.success(isAr ? 'تم رفع الملف' : 'File uploaded');
      invalidate();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر رفع الملف' : 'Failed to upload file'));
    }
  }

  async function removeAttachment(issue: ClientIssue, attachmentId: number) {
    try {
      await projectClientIssueApi.removeAttachment(
        portal,
        projectId,
        clientIssueResourceKey(issue),
        attachmentId,
      );
      toast.success(isAr ? 'تم حذف المرفق' : 'Attachment removed');
      invalidate();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر حذف المرفق' : 'Failed to remove attachment'));
    }
  }

  function canEditIssue(issue: ClientIssue): boolean {
    return resolveFlag(issue.canEdit, capabilities.canEdit);
  }

  function canDeleteIssue(issue: ClientIssue): boolean {
    return resolveFlag(issue.canDelete, capabilities.canDelete);
  }

  function canUpdateIssueStatus(issue: ClientIssue): boolean {
    return resolveFlag(issue.canUpdateStatus, capabilities.canUpdateStatus);
  }

  const hasDraggableIssues = issues.some(canUpdateIssueStatus);

  return {
    issues,
    capabilities,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    createIssue: createMutation.mutateAsync,
    updateIssue: (issue: ClientIssue, payload: UpdateClientIssuePayload) =>
      updateMutation.mutateAsync({ issue, payload }),
    deleteIssue: (issue: ClientIssue) => deleteMutation.mutateAsync(issue),
    updateStatus,
    uploadImage,
    uploadFile,
    removeAttachment,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    canEditIssue,
    canDeleteIssue,
    canUpdateIssueStatus,
    hasDraggableIssues,
  };
}

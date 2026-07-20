import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { KanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { useProjectClientIssues } from '../hooks/useProjectClientIssues';
import { buildClientIssueColumns } from '../utils/clientIssue.utils';
import { ClientIssueKanbanCard } from './ClientIssueKanbanCard';
import { ClientIssueFormModal } from './ClientIssueFormModal';
import { ClientIssueDetailDrawer } from './ClientIssueDetailDrawer';
import { DeleteClientIssueModal } from './DeleteClientIssueModal';
import type { ClientIssue, CreateClientIssuePayload, ProjectClientIssuePortal } from '../types/projectClientIssue.types';

interface Props {
  projectId: string;
  portal:    ProjectClientIssuePortal;
  isAr:      boolean;
}

export function ProjectClientIssuesTab({ projectId, portal, isAr }: Props) {
  const {
    issues,
    capabilities,
    isLoading,
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
    uploadImage,
    uploadFile,
    removeAttachment,
    isCreating,
    isUpdating,
    isDeleting,
    canEditIssue,
    canDeleteIssue,
    canUpdateIssueStatus,
    hasDraggableIssues,
  } = useProjectClientIssues(portal, projectId, isAr);

  const [selected, setSelected]         = useState<ClientIssue | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState<ClientIssue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientIssue | null>(null);

  const columns = useMemo(() => buildClientIssueColumns(issues, isAr), [issues, isAr]);

  const selectedFromList = selected
    ? issues.find(i => i.id === selected.id) ?? selected
    : null;

  async function handleCreate(
    payload: CreateClientIssuePayload,
    image?: File | null,
    file?: File | null,
  ) {
    const created = await createIssue(payload);
    if (image) await uploadImage(created, image);
    if (file) await uploadFile(created, file);
  }

  async function handleUpdate(
    payload: CreateClientIssuePayload,
    image?: File | null,
    file?: File | null,
  ) {
    if (!editing) return;
    await updateIssue(editing, payload);
    if (image) await uploadImage(editing, image);
    if (file) await uploadFile(editing, file);
    setEditing(null);
    setSelected(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteIssue(deleteTarget);
    setDeleteTarget(null);
    setSelected(null);
  }

  function openEdit(issue: ClientIssue) {
    setEditing(issue);
    setFormOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 min-w-62.5 h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!capabilities.canView) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'لا تملك صلاحية عرض تحديثات العميل' : 'You do not have permission to view client issues'}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {capabilities.canCreate && (
        <div className="flex justify-start">
          <Button
            variant="primary"
            startIcon={<Plus size={16} />}
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            {isAr ? 'إضافة مشكلة' : 'Add Issue'}
          </Button>
        </div>
      )}

      <KanbanBoard
        columns={columns}
        isAr={isAr}
        getId={issue => String(issue.id)}
        renderCard={issue => (
          <ClientIssueKanbanCard
            issue={issue}
            isAr={isAr}
            onOpen={setSelected}
            onDelete={canDeleteIssue(issue) ? setDeleteTarget : undefined}
          />
        )}
        onDrop={(id, statusKey) => {
          const issue = issues.find(i => String(i.id) === id);
          if (!issue || !canUpdateIssueStatus(issue)) return;
          void updateStatus(issue, statusKey as ClientIssue['status']);
        }}
        draggable={hasDraggableIssues}
        isItemDraggable={issue => canUpdateIssueStatus(issue)}
        emptyLabel={isAr ? 'لا توجد مشاكل' : 'No issues'}
      />

      <ClientIssueDetailDrawer
        issue={selectedFromList}
        allIssues={issues}
        isAr={isAr}
        canEdit={selectedFromList ? canEditIssue(selectedFromList) : false}
        canDelete={selectedFromList ? canDeleteIssue(selectedFromList) : false}
        canUpdateStatus={selectedFromList ? canUpdateIssueStatus(selectedFromList) : false}
        onClose={() => setSelected(null)}
        onEdit={() => selectedFromList && openEdit(selectedFromList)}
        onDelete={() => selectedFromList && setDeleteTarget(selectedFromList)}
        onStatusChange={status => {
          if (!selectedFromList) return;
          void updateStatus(selectedFromList, status);
        }}
        onUploadImage={(file) => selectedFromList && uploadImage(selectedFromList, file)}
        onUploadFile={(file) => selectedFromList && uploadFile(selectedFromList, file)}
        onRemoveAttachment={(attachmentId) =>
          selectedFromList && removeAttachment(selectedFromList, attachmentId)}
      />

      <ClientIssueFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        initial={editing}
        isLoading={isCreating || isUpdating}
        isAr={isAr}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <DeleteClientIssueModal
        open={!!deleteTarget}
        isAr={isAr}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

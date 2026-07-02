import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pmClientUpdatesApi } from '../api/clientUpdates.api';

export function useProjectClientUpdates(projectId: string) {
  const query = useQuery({
    queryKey: ['pm-client-updates', projectId],
    queryFn:  () => pmClientUpdatesApi.list(projectId).then(r => r.data.data.data),
  });

  return { phases: query.data ?? [], isLoading: query.isLoading };
}

export function usePhaseMessages(projectId: string, phaseId: number, enabled: boolean, isAr: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pm-phase-messages', projectId, phaseId],
    queryFn:  () => pmClientUpdatesApi.getMessages(projectId, phaseId).then(r => r.data.data.data),
    enabled,
  });

  async function send(body: string) {
    try {
      await pmClientUpdatesApi.sendMessage(projectId, phaseId, body);
      toast.success(isAr ? 'تم إرسال الرسالة' : 'Message sent');
      queryClient.invalidateQueries({ queryKey: ['pm-phase-messages', projectId, phaseId] });
    } catch {
      toast.error(isAr ? 'فشل إرسال الرسالة' : 'Failed to send message');
    }
  }

  async function uploadFile(file: File) {
    try {
      await pmClientUpdatesApi.uploadAttachment(projectId, phaseId, file);
      toast.success(isAr ? 'تم رفع الملف' : 'File uploaded');
      queryClient.invalidateQueries({ queryKey: ['pm-client-updates', projectId] });
    } catch {
      toast.error(isAr ? 'فشل رفع الملف' : 'Failed to upload file');
    }
  }

  return { messages: query.data ?? [], isLoading: query.isLoading, send, uploadFile };
}

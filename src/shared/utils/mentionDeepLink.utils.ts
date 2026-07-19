import type { SeoComment } from '@/modules/seo-leader/campaigns/api/campaign.api';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';

function extractComments(raw: unknown): SeoComment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as SeoComment[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as SeoComment[];
  return [];
}

function commentTreeHasId(comments: SeoComment[], commentId: string): boolean {
  for (const c of comments) {
    if (String(c.id) === commentId) return true;
    if (c.replies?.length && commentTreeHasId(c.replies, commentId)) return true;
  }
  return false;
}

/** Find which project task owns a SEO task comment (for mention deep-links). */
export async function findSeoTaskIdForComment(
  projectId: string,
  taskKeys: string[],
  commentId: string,
): Promise<string | null> {
  const target = String(commentId);
  if (!projectId || !target || taskKeys.length === 0) return null;

  const concurrency = 5;
  for (let i = 0; i < taskKeys.length; i += concurrency) {
    const batch = taskKeys.slice(i, i + concurrency);
    const found = await Promise.all(
      batch.map(async (taskKey) => {
        try {
          const res = await campaignApi.getComments(projectId, taskKey);
          const comments = extractComments(res.data.data);
          return commentTreeHasId(comments, target) ? taskKey : null;
        } catch {
          return null;
        }
      }),
    );
    const match = found.find(Boolean);
    if (match) return match;
  }
  return null;
}

export function isSeoTaskCommentContext(contextType: string | null | undefined): boolean {
  return /task.?comment|seotaskcomment/i.test(String(contextType ?? ''));
}

/** Scroll to and briefly highlight a comment element tagged with data-comment-id. */
export function highlightCommentById(commentId: string | null | undefined, ttlMs = 2200): void {
  if (!commentId || typeof document === 'undefined') return;
  const key = String(commentId);
  const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(key)
    : key.replace(/["\\]/g, '\\$&');
  const el = document.querySelector<HTMLElement>(`[data-comment-id="${escaped}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('ring-2', 'ring-[#A0CD39]', 'ring-offset-2', 'dark:ring-offset-gray-900');
  window.setTimeout(() => {
    el.classList.remove('ring-2', 'ring-[#A0CD39]', 'ring-offset-2', 'dark:ring-offset-gray-900');
  }, ttlMs);
}

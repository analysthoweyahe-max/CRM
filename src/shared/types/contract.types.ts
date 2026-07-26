export interface ContractFile {
  fileName:   string;
  mimeType:   string;
  size:       number;
  url:        string;
  uploadedAt: string;
}

export function normalizeContractFile(raw: unknown): ContractFile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!r.url) return null;

  return {
    fileName:   String(r.fileName ?? r.name ?? 'contract'),
    mimeType:   String(r.mimeType ?? r.type ?? 'application/octet-stream'),
    size:       Number(r.size ?? 0),
    url:        String(r.url ?? ''),
    uploadedAt: String(r.uploadedAt ?? r.createdAt ?? ''),
  };
}

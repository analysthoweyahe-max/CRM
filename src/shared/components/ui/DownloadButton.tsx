import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { downloadFile } from '@/shared/utils/fileDownload.utils';

interface Props {
  url:  string;
  name: string;
}

export function DownloadButton({ url, name }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try { await downloadFile(url, name); }
    finally { setLoading(false); }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#709028]
                 hover:bg-[#D8EBAE]/40 flex items-center justify-center transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : <Download size={14} />}
    </button>
  );
}

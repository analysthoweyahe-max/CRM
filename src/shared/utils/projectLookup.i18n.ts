const LOOKUP_LABELS: Record<string, { ar: string; en: string }> = {
  /* ── Statuses ───────────────────────────────────── */
  not_started:  { ar: 'لم يبدأ',       en: 'Not Started'  },
  in_progress:  { ar: 'قيد التنفيذ',   en: 'In Progress'  },
  completed:    { ar: 'مكتمل',         en: 'Completed'    },
  on_hold:      { ar: 'معلق',          en: 'On Hold'      },
  paused:       { ar: 'متوقف',         en: 'Paused'       },
  draft:        { ar: 'مسودة',         en: 'Draft'        },
  archived:     { ar: 'مؤرشف',         en: 'Archived'     },
  pending:      { ar: 'قيد الانتظار',  en: 'Pending'      },
  cancelled:    { ar: 'ملغي',          en: 'Cancelled'    },
  active:       { ar: 'نشط',           en: 'Active'       },
  inactive:     { ar: 'غير نشط',       en: 'Inactive'     },

  /* ── Task priorities ──────────────────────────── */
  urgent:       { ar: 'عاجلة',         en: 'Urgent'       },
  high:         { ar: 'عالية',         en: 'High'         },
  medium:       { ar: 'متوسطة',        en: 'Medium'       },
  normal:       { ar: 'متوسطة',        en: 'Normal'       },
  low:          { ar: 'منخفضة',        en: 'Low'          },

  /* ── Task statuses ────────────────────────────── */
  needs_review: { ar: 'مراجعة',        en: 'Needs Review' },
  in_review:    { ar: 'قيد المراجعة',  en: 'In Review'    },
  review:       { ar: 'مراجعة',        en: 'Review'       },
  done:         { ar: 'مكتمل',         en: 'Done'         },

  /* ── Project / campaign types ─────────────────── */
  seo:              { ar: 'تحسين محركات البحث', en: 'SEO'              },
  technical_seo:    { ar: 'SEO تقني',             en: 'Technical SEO'    },
  local_seo:        { ar: 'SEO محلي',             en: 'Local SEO'        },
  on_page:          { ar: 'SEO داخل الصفحة',      en: 'On-Page SEO'      },
  off_page:         { ar: 'SEO خارج الصفحة',      en: 'Off-Page SEO'     },
  content:          { ar: 'محتوى',                en: 'Content'          },
  ecommerce:        { ar: 'تجارة إلكترونية',      en: 'E-commerce'       },
  web:              { ar: 'موقع ويب',             en: 'Website'          },
  website:          { ar: 'موقع ويب',             en: 'Website'          },
  web_app:          { ar: 'تطبيق ويب',            en: 'Web App'          },
  mobile:           { ar: 'تطبيق جوال',           en: 'Mobile App'       },
  mobile_app:       { ar: 'تطبيق جوال',           en: 'Mobile App'       },
  desktop:          { ar: 'تطبيق سطح مكتب',       en: 'Desktop App'      },
  api:              { ar: 'واجهة برمجة',          en: 'API'              },
  internal:         { ar: 'داخلي',                en: 'Internal'         },
  maintenance:      { ar: 'صيانة',                en: 'Maintenance'      },
};

const LABEL_AR: Record<string, string> = Object.fromEntries(
  Object.values(LOOKUP_LABELS).map(({ en, ar }) => [en, ar]),
);

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

/** Translate PM/SEO lookup option labels when the API returns English only. */
export function translateProjectLookup(
  value: string | null | undefined,
  label: string | null | undefined,
  isAr: boolean,
  labelAr?: string | null,
): string {
  const safeLabel = label ?? '';
  if (!isAr) return safeLabel;
  if (labelAr?.trim()) return labelAr.trim();

  const byValue = LOOKUP_LABELS[normalizeKey(value)]?.ar;
  if (byValue) return byValue;

  const byLabel = LABEL_AR[safeLabel.trim()];
  if (byLabel) return byLabel;

  return safeLabel;
}

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
  normal:       { ar: 'عادية',         en: 'Normal'       },
  low:          { ar: 'منخفضة',        en: 'Low'          },

  /* ── Task statuses ────────────────────────────── */
  needs_review: { ar: 'مراجعة',        en: 'Needs Review' },
  in_review:    { ar: 'قيد المراجعة',  en: 'In Review'    },
  review:       { ar: 'مراجعة',        en: 'Review'       },
  done:         { ar: 'مكتمل',         en: 'Done'         },
  blocked:      { ar: 'محظورة',        en: 'Blocked'      },

  /* ── Client issue statuses ──────────────────── */
  open_issues:    { ar: 'مشاكل قائمة',        en: 'Open Issues'    },
  sent_to_client: { ar: 'تم إرسالها للعميل', en: 'Sent to Client' },
  under_review:   { ar: 'قيد المراجعة',      en: 'Under Review'   },
  resolved:       { ar: 'تم الحل',           en: 'Resolved'       },
  rejected:       { ar: 'تم الرفض',          en: 'Rejected'       },

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

const LABEL_EN: Record<string, string> = Object.fromEntries(
  Object.values(LOOKUP_LABELS).map(({ en, ar }) => [ar, en]),
);

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Localize PM/SEO lookup option labels.
 * APIs often return Arabic-only `label` — map by value for EN, and prefer the
 * API Arabic label (or labelAr) for AR so medium/normal stay distinct.
 */
export function translateProjectLookup(
  value: string | null | undefined,
  label: string | null | undefined,
  isAr: boolean,
  labelAr?: string | null,
): string {
  const safeLabel = (label ?? '').trim();
  const mapped = LOOKUP_LABELS[normalizeKey(value)];

  if (isAr) {
    if (labelAr?.trim()) return labelAr.trim();
    // Prefer API Arabic when present (SEO: medium=متوسطة, normal=عادية;
    // PM: normal=متوسطة — different product meaning, trust the wire label).
    if (safeLabel && hasArabic(safeLabel)) return safeLabel;
    if (mapped?.ar) return mapped.ar;
    const byEnLabel = LABEL_AR[safeLabel];
    if (byEnLabel) return byEnLabel;
    return safeLabel;
  }

  if (mapped?.en) return mapped.en;
  if (safeLabel && !hasArabic(safeLabel)) return safeLabel;
  const byArLabel = LABEL_EN[safeLabel];
  if (byArLabel) return byArLabel;
  return safeLabel;
}

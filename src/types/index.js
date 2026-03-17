// Book status enum
export const BOOK_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  QA: 'qa',
  DESIGN: 'design',
  READY: 'ready',
  PUBLISHED: 'published',
};

// Chapter status enum
export const CHAPTER_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  GENERATED: 'generated',
  QA_PENDING: 'qa_pending',
  QA_PASSED: 'qa_passed',
  QA_FAILED: 'qa_failed',
  DESIGN_READY: 'design_ready',
};

// Certification tracks
export const CERT_TRACKS = [
  { id: 'FNP', label: 'Family NP', color: '#1A6B6B', bg: '#E3F2F2' },
  { id: 'PMHNP', label: 'Psych-Mental Health NP', color: '#7B3F9E', bg: '#F3E8FF' },
  { id: 'AGPCNP', label: 'Adult-Gero Primary Care NP', color: '#C9A84C', bg: '#F9F3E3' },
  { id: 'WHNP', label: "Women's Health NP", color: '#C0444A', bg: '#FBE8E9' },
  { id: 'AGACNP', label: 'Adult-Gero Acute Care NP', color: '#2D6A8F', bg: '#E3F0F8' },
  { id: 'PNP', label: 'Pediatric NP', color: '#4A7C59', bg: '#E8F2EB' },
  { id: 'ANP', label: 'Adult NP', color: '#8B5E3C', bg: '#F5EDE4' },
];

export const getTrackInfo = (trackId) =>
  CERT_TRACKS.find(t => t.id === trackId) || CERT_TRACKS[0];

export const getStatusBadge = (status) => {
  const map = {
    draft: { label: 'Draft', cls: 'badge-gray' },
    generating: { label: 'Generating', cls: 'badge-gold' },
    qa: { label: 'In QA', cls: 'badge-blue' },
    design: { label: 'Design', cls: 'badge-blue' },
    ready: { label: 'Ready', cls: 'badge-green' },
    published: { label: 'Published', cls: 'badge-green' },
    pending: { label: 'Pending', cls: 'badge-gray' },
    generated: { label: 'Generated', cls: 'badge-blue' },
    qa_pending: { label: 'QA Pending', cls: 'badge-gold' },
    qa_passed: { label: 'QA Passed', cls: 'badge-green' },
    qa_failed: { label: 'QA Failed', cls: 'badge-rose' },
    design_ready: { label: 'Design Ready', cls: 'badge-green' },
  };
  return map[status] || { label: status, cls: 'badge-gray' };
};

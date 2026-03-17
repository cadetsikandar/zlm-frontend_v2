export const MOCK_STATS = {
  totalBooks: 28,
  totalChapters: 420,
  generatedChapters: 7,
  qaPassedChapters: 0,
  publishedBooks: 0,
  totalWords: 21450,
  booksInProgress: 1,
  completionPercent: 2,
};

export const MOCK_BOOKS = [
  // FNP
  { id: '1', title: 'FNP Certification Essentials: Volume 1', certificationTrack: 'FNP', trackNumber: 1, status: 'generating', chaptersTotal: 15, chaptersGenerated: 7, githubBranch: 'track-fnp-book-1' },
  { id: '2', title: 'FNP Certification Essentials: Volume 2', certificationTrack: 'FNP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '3', title: 'FNP Certification Essentials: Volume 3', certificationTrack: 'FNP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '4', title: 'FNP Certification Essentials: Volume 4', certificationTrack: 'FNP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  // PMHNP
  { id: '5', title: 'Neuroscience & Foundations of Psychiatric Practice', certificationTrack: 'PMHNP', trackNumber: 1, status: 'draft', chaptersTotal: 13, chaptersGenerated: 0, githubBranch: null },
  { id: '6', title: 'Psychiatric Assessment & Diagnostic Management', certificationTrack: 'PMHNP', trackNumber: 2, status: 'draft', chaptersTotal: 11, chaptersGenerated: 0, githubBranch: null },
  { id: '7', title: 'Therapeutic Modalities & Addiction Medicine', certificationTrack: 'PMHNP', trackNumber: 3, status: 'draft', chaptersTotal: 10, chaptersGenerated: 0, githubBranch: null },
  { id: '8', title: 'Crisis Intervention & Clinical Practicum Integration', certificationTrack: 'PMHNP', trackNumber: 4, status: 'draft', chaptersTotal: 9, chaptersGenerated: 0, githubBranch: null },
  // AGPCNP
  { id: '9', title: 'Adult-Gero Primary Care NP: Volume 1', certificationTrack: 'AGPCNP', trackNumber: 1, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '10', title: 'Adult-Gero Primary Care NP: Volume 2', certificationTrack: 'AGPCNP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '11', title: 'Adult-Gero Primary Care NP: Volume 3', certificationTrack: 'AGPCNP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '12', title: 'Adult-Gero Primary Care NP: Volume 4', certificationTrack: 'AGPCNP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  // WHNP
  { id: '13', title: "Women's Health NP: Volume 1", certificationTrack: 'WHNP', trackNumber: 1, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '14', title: "Women's Health NP: Volume 2", certificationTrack: 'WHNP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '15', title: "Women's Health NP: Volume 3", certificationTrack: 'WHNP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '16', title: "Women's Health NP: Volume 4", certificationTrack: 'WHNP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  // AGACNP
  { id: '17', title: 'Adult-Gero Acute Care NP: Volume 1', certificationTrack: 'AGACNP', trackNumber: 1, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '18', title: 'Adult-Gero Acute Care NP: Volume 2', certificationTrack: 'AGACNP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '19', title: 'Adult-Gero Acute Care NP: Volume 3', certificationTrack: 'AGACNP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '20', title: 'Adult-Gero Acute Care NP: Volume 4', certificationTrack: 'AGACNP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  // PNP
  { id: '21', title: 'Pediatric NP: Volume 1', certificationTrack: 'PNP', trackNumber: 1, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '22', title: 'Pediatric NP: Volume 2', certificationTrack: 'PNP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '23', title: 'Pediatric NP: Volume 3', certificationTrack: 'PNP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '24', title: 'Pediatric NP: Volume 4', certificationTrack: 'PNP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  // ANP
  { id: '25', title: 'Adult NP: Volume 1', certificationTrack: 'ANP', trackNumber: 1, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '26', title: 'Adult NP: Volume 2', certificationTrack: 'ANP', trackNumber: 2, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '27', title: 'Adult NP: Volume 3', certificationTrack: 'ANP', trackNumber: 3, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
  { id: '28', title: 'Adult NP: Volume 4', certificationTrack: 'ANP', trackNumber: 4, status: 'draft', chaptersTotal: 15, chaptersGenerated: 0, githubBranch: null },
];

export const MOCK_CHAPTERS = [
  { id: 'c1', bookId: '1', chapterNumber: 1, title: 'Foundations of Advanced Practice Nursing', wordCount: 1910, status: 'qa_passed', githubCommitSha: 'a14ac172' },
  { id: 'c2', bookId: '1', chapterNumber: 2, title: 'Advanced Health Assessment', wordCount: 2052, status: 'qa_passed', githubCommitSha: 'ff27134b' },
  { id: 'c3', bookId: '1', chapterNumber: 3, title: 'Advanced Physiology and Pathophysiology', wordCount: 2597, status: 'generated', githubCommitSha: '571750ca' },
  { id: 'c4', bookId: '1', chapterNumber: 4, title: 'Pharmacotherapeutics for Advanced Practice', wordCount: 2879, status: 'generated', githubCommitSha: '64ee617e' },
  { id: 'c5', bookId: '1', chapterNumber: 5, title: 'Primary Care in Family Health', wordCount: 3080, status: 'generated', githubCommitSha: 'e65a8a12' },
  { id: 'c6', bookId: '1', chapterNumber: 6, title: 'Healthcare Informatics', wordCount: 3254, status: 'generated', githubCommitSha: '63935b16' },
  { id: 'c7', bookId: '1', chapterNumber: 7, title: 'Evidence-Based Practice', wordCount: 3329, status: 'generated', githubCommitSha: '878a7cdf' },
  { id: 'c8', bookId: '1', chapterNumber: 8, title: 'Population Health and Epidemiology', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c9', bookId: '1', chapterNumber: 9, title: 'Healthcare Policy and Advocacy', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c10', bookId: '1', chapterNumber: 10, title: 'Professional Role Development', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c11', bookId: '1', chapterNumber: 11, title: 'Urgent and Emergent Care', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c12', bookId: '1', chapterNumber: 12, title: 'Mental Health in Primary Care', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c13', bookId: '1', chapterNumber: 13, title: 'Chronic Disease Management', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c14', bookId: '1', chapterNumber: 14, title: 'Advanced Clinical Procedures', wordCount: 0, status: 'pending', githubCommitSha: null },
  { id: 'c15', bookId: '1', chapterNumber: 15, title: 'FNP Practice Management', wordCount: 0, status: 'pending', githubCommitSha: null },
];

export const MOCK_ACTIVITY = [
  { id: 1, action: 'Chapter 7 committed to GitHub', book: 'FNP Book 1', time: '2 min ago', type: 'commit' },
  { id: 2, action: 'Chapter 7 generated — 3,329 words', book: 'FNP Book 1', time: '5 min ago', type: 'generate' },
  { id: 3, action: 'Chapter 6 generated — 3,254 words', book: 'FNP Book 1', time: '12 min ago', type: 'generate' },
  { id: 4, action: 'Chapter 5 generated — 3,080 words', book: 'FNP Book 1', time: '18 min ago', type: 'generate' },
  { id: 5, action: 'Prompt updated — CHAPTER v2', book: 'System', time: '1 hr ago', type: 'prompt' },
];

export const MOCK_PROMPTS = [
  { id: 'p1', name: 'TOC Generator', type: 'toc', version: 2, isActive: true, createdBy: 'DevRolin', updatedAt: '2026-02-28' },
  { id: 'p2', name: 'Chapter Part 1', type: 'chapter', version: 3, isActive: true, createdBy: 'DevRolin', updatedAt: '2026-02-28' },
  { id: 'p3', name: 'Chapter Part 2', type: 'chapter', version: 3, isActive: true, createdBy: 'DevRolin', updatedAt: '2026-02-28' },
  { id: 'p4', name: 'Terminology Generator', type: 'terminology', version: 1, isActive: true, createdBy: 'DevRolin', updatedAt: '2026-02-27' },
  { id: 'p5', name: 'QA Audit Engine', type: 'qa', version: 1, isActive: true, createdBy: 'DevRolin', updatedAt: '2026-02-27' },
];

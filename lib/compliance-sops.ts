/**
 * Maps each compliance requirement to its authoritative SOP URL.
 *
 * Items without a URL render as plain text in the UI (no tap target).
 * Add a URL here when a new SOP gets approved. No code redeploy needed
 * to update an existing SOP. The URL points at a Google Doc or PDF that
 * Victoria can edit in place and every tech sees the latest version.
 *
 * Last reviewed: 2026-05-11. Three compliance items are intentionally
 * absent pending L10 sign-off on May 12 (Safe Driving & Vehicle Conduct,
 * Drug Screening Compliance, PACE Sales Training Proficiency). Add their
 * URLs here once approved.
 *
 * Source of truth folder: SHS SOPs in Google Drive
 * (id 1KQzcH6JhNF4rPMh4yQDdqjNQyNRo_S8x).
 */
export const COMPLIANCE_SOP_URLS: Record<string, string> = {
    vanCleanliness:
        'https://drive.google.com/file/d/1ln9U_TtENvSmE07psS3GqhpyloPp8EX0/view',
    paperworkSubmitted:
        'https://drive.google.com/file/d/1KjvFQyBVS9LTolTv6FiG1hsBmaeCozKM/view',
    estimateFollowups:
        'https://drive.google.com/file/d/1NGR_iYZSMqLXjSY2fGayrZUXoocvVyM_/view',
    zeroCallbacks:
        'https://drive.google.com/file/d/1kf4254f8XHNFIzANg62wmyaxmEgyrhQP/view',
    noComplaints:
        'https://drive.google.com/file/d/1NGR_iYZSMqLXjSY2fGayrZUXoocvVyM_/view',
    noBadDriving:
        'https://docs.google.com/document/d/1S_YdWzm7Jo_pOvVKMVbXkoRaRZQMbGwYIqBccPyE_fw/edit',
    drugScreening:
        'https://docs.google.com/document/d/1elZozdsRsY52Pqc5AH1Jsc37M-Nl4ngthe-awpkfBzw/edit',
    noOshaViolations:
        'https://drive.google.com/file/d/1n4V3iiyCubjmJO9LTsMZ8DjhdJau-qEg/view',
    paceTraining:
        'https://docs.google.com/document/d/1MrwbqTEjDNRsbhJjB6eo7WRY8a2XKzF50ClVKGfuKsI/edit',
    dressCode:
        'https://docs.google.com/document/d/1p9r6QYeXiQqhrjUWOjgfk5seMR9YF20OwmjfE_cm--Y/edit',
};

/**
 * Returns the SOP URL for a compliance requirement, or null if no SOP
 * has been approved yet. UI should render the label as plain text when
 * this returns null.
 */
export function getSopUrl(key: string): string | null {
    return COMPLIANCE_SOP_URLS[key] ?? null;
}

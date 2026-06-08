# SHS App — Mini-Spec: Bugs + History Page

**Date:** Tuesday, May 19, 2026
**Source:** SHS Tech Training session, 8:00 to 9:00 AM, May 19, 2026 (Gemini-recorded transcript)
**Reporter:** Marshall Snider
**Confirmed in-room by:** Victoria Williams, tech team
**Owner for fix:** App dev

---

## Summary

Three items surfaced during this morning's Tuesday training. Two are bugs. One is a missing feature you already agreed to add. All three live in the existing SHS tech app (the Next.js build in this folder).

Ranked by leverage (highest first):

1. Add History page — high leverage, low pain, already verbally committed in the room.
2. Compliance status bug — trust risk. Techs and Victoria use this signal daily.
3. Leaderboard bug — visible and irritating but cosmetic.

Both bugs share a likely root cause: stale session state. A sign-out / sign-in clears them. That points at client-side state caching or a stale fetch on initial load, not a data integrity issue. Fixing the underlying refresh logic probably resolves both at once.

---

## Item 1 — Add History Page (feature, not bug)

**What's missing:** Techs cannot view their performance from prior weeks. Current app only shows current-week data.

**What was requested in the meeting:** Add a History page accessible from the bottom of the app interface so the team can review past results.

**Why it matters:** Without history, the leaderboard is a one-week scoreboard. With history, it becomes a trend story — techs see their own arc, Victoria can coach off pattern instead of moment, and the data already in the system finally earns its keep.

**Suggested scope for v1:**
- New bottom-nav tab labeled "History."
- Shows the tech's own results for the prior 8 to 12 weeks.
- Same metrics shown on the current weekly view (PACE numbers, membership / maintenance plan sales, average ticket, conversion, compliance status).
- Sort by week, most recent first.
- No comparison view in v1. Just "here's what your weeks looked like." Comparison and trend lines can come in v2.

**Open question:** Should leaders (Victoria, Don) see all techs' history from this page, or stay scoped to the leaderboard view? Recommend: keep tech-self for v1, build leader history into the existing leaderboard later.

---

## Item 2 — Compliance Status Bug (bug, trust risk)

**Symptom:** Compliance status displays as "failed" or "awaiting review" when the tech is actually compliant. Observed live during the training.

**Workaround that works:** Sign out, sign back in. After re-auth, status displays correctly.

**Likely cause:** Stale client-side state. Compliance fetch on app load is either cached, returning a default ("awaiting review") before the real fetch resolves, or not re-running after a compliance status change on the back end. The fact that a full session refresh resolves it points at session-scoped state, not a database write issue.

**Why this is a trust risk:** This is the bar techs and Victoria watch to know who's ride-along ready. A false "failed" calls competence into question and a false "awaiting review" delays scheduling. The status has to be accurate by sight, no workarounds.

**Suggested fix paths (for the dev to evaluate):**
- Force a fresh fetch on app foreground / window focus.
- Move compliance state out of any long-lived client cache, fetch on every Dashboard mount.
- Add a manual refresh control on the compliance card as a safety net for users.

**Repro to verify the fix:**
- Tech is non-compliant → admin marks them compliant in the back end → tech opens the app cold → status should read "Compliant" without a sign-out cycle.

---

## Item 3 — Leaderboard Bug (bug, cosmetic)

**Symptom:** Leaderboard is not showing all team members. Observed live during the training.

**Workaround:** Same sign-out / sign-in clears it (per the in-meeting observation).

**Likely cause:** Same root as the compliance bug — stale fetch or a filter applied at the wrong layer (active vs. inactive techs, scoped to the viewing user, pagination cutoff that hides the bottom of the list).

**Suggested fix paths:**
- Audit the leaderboard query — confirm filter logic includes every active tech, not just the viewer's peer group.
- Confirm the fetch runs on focus, not just on initial mount.
- Add a count badge ("Showing X of Y techs") so a missing tech is visible to the user immediately.

**Repro to verify the fix:**
- All active techs are present on the leaderboard from a cold app open, no sign-out cycle required.

---

## Recommended sequence for the dev

1. Triage the shared root cause behind Items 2 and 3. One state-refresh fix probably knocks down both.
2. Ship Item 1 (History page) as a parallel work stream. It's additive and doesn't touch the state logic.
3. Smoke test all three together before pushing to the techs. Have Victoria spot-check on her device.

---

## Carry-forward

- Confirm with Don that the dev has bandwidth this week. If not, prioritize Item 2 (compliance bug) for next-up because of the trust risk.
- Once the history page is live, queue a brief tech app refresher into a future Tuesday training opener so the team actually finds and uses it.
- Log all three items into `shs-operating-state` as open loops, mark closed when each ships.

---

*Built from the May 19, 2026 SHS Tech Training session transcript. Source: Gemini meeting notes, doc ID 1DNtgkFuYXZx1Pk4Cf6CmDKERkzgimbmkfBCbp-E3Qbk.*

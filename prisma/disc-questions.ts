// DISC (personality) questions: phase 'DISC' with topic 'NN-q1' / 'NN-q2' so the
// 12 scenarios stay paired and in order. Kept separate from the PACE, FULL, and
// OBJECTION pools by phase, so they never appear in those quizzes.
// The explanation column stores a JSON map of per-option feedback lines; the DISC
// server actions decode it and show the line for the option the tech selected.
const DISC_TYPE_OPTIONS = {
    optionA: 'D — Dominance',
    optionB: 'I — Influence',
    optionC: 'S — Steadiness',
    optionD: 'C — Conscientiousness',
};

function discTypeFb(correct: 'A' | 'B' | 'C' | 'D', right: string, wrong: string): string {
    const m: Record<string, string> = { A: wrong, B: wrong, C: wrong, D: wrong };
    m[correct] = right;
    return JSON.stringify(m);
}

const DISC_Q1 = 'What personality type is this?';
const DISC_Q2 = "What's the best way to make your offer to this customer?";

const DISC_SCENARIOS = [
    `Scenario 1 — Panel replacement. The door swings open before you finish knocking. Firm handshake, strong eye contact. "Appreciate you coming. How long is this gonna take? The panel keeps tripping — just tell me what it needs so it stops." He keeps checking his watch.`,
    `Scenario 2 — Recurring breaker trips. She meets you at the door, all business. "What's the bottom line to stop this breaker from tripping? Skip the backstory — is it worth fixing or do I just replace the panel?" She cuts you off when you start explaining the circuit history.`,
    `Scenario 3 — EV charger install. "If the panel can handle it, do it. If not, tell me what it takes. Can you get the charger in this week or not?" He barely looks up from his phone, wants the job scoped and you gone.`,
    `Scenario 4 — Recessed lighting upgrade. Big smile, "Come on in! You want a water or anything?" She's chatty, asks how your day's going, tells you about the kitchen remodel she's planning and how she wants the whole place to glow. Lively, colorful house.`,
    `Scenario 5 — Outlet & USB modernization. He laughs about the old two-prong outlets — "Straight out of the seventies, right?" — and keeps steering the conversation to his home theater setup and the game last night. Friendly, animated, easily distracted.`,
    `Scenario 6 — Whole-home surge protection. "Oh man, electricity scares me!" — said with a grin. She's talkative, jokes about her "ancient" wiring, excited about finally getting the place protected and modern. Wants it to feel good, not technical.`,
    `Scenario 7 — Aging panel, safety concern. Calm and polite, a little reserved. Warms up as you talk. "I just want to make sure this won't become a problem. We've had enough surprises in this house — I want something I don't have to worry about." Comfortable, tidy, modest home.`,
    `Scenario 8 — GFCI / childproofing. Soft-spoken, thoughtful. "Is this safe for the kids? I don't want to worry about someone getting shocked near the bathroom or kitchen outlets." Asks about the warranty and whether you stand behind the work.`,
    `Scenario 9 — Panel upgrade, hesitant. Quiet, careful. "I want to do the right thing, I just don't want to rush into something this expensive." Asks about long-term safety and whether the new panel will last. Nervous about making the wrong call.`,
    `Scenario 10 — Diagnostic / flickering lights. Reserved, precise. "Before you recommend anything, can you show me the actual readings? I'd like to see what the voltage is doing at the panel." Tidy, minimalist home. Asks careful "what if" questions.`,
    `Scenario 11 — Aluminum wiring concern. "I read this house has aluminum wiring and I need to understand exactly what the risk is before I spend money on it." Methodical, a little skeptical. Wants the cause documented and the cost justified.`,
    `Scenario 12 — Code compliance / breaker. Polite but cautious. "Does this breaker meet code? Is there documentation? I'd want the manufacturer warranty in writing." Reads everything carefully before deciding.`,
];

export const DISC_QUESTIONS = [
    // --- Scenario 1 (D) ---
    { phase: 'DISC', topic: '01-q1', question: `${DISC_SCENARIOS[0]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'A', explanation: discTypeFb('A', `D (Dominance). Fast pace, task-focused, results-first, watching the clock. Classic D.`, `The clock-watching, the firm handshake, and "just tell me what it needs" are speed-and-results signals. That's a D, not a relationship or detail read.`) },
    { phase: 'DISC', topic: '01-q2', question: `${DISC_SCENARIOS[0]}\n\n${DISC_Q2}`,
        optionA: `Slow down, reassure him it'll be reliable for years, and tell him you'll always be a call away.`,
        optionB: `Give the bottom line first — the panel's overloaded, here's why it's tripping, here's the fix and a clear timeline — then offer two options so he stays in control.`,
        optionC: `Walk him through the full load calculation and the panel spec sheet before recommending anything.`,
        optionD: `Get excited about the upgrade and tell him a story about another happy customer.`,
        correct: 'B', explanation: JSON.stringify({
            A: `That's the S approach — too slow and soft for a D.`,
            B: `Correct: D's buy on confidence and control. Lead with results and let him choose.`,
            C: `That's the C approach — too much detail; he'll feel you're wasting his time.`,
            D: `That's the I approach — fluff to a D.`,
        }) },
    // --- Scenario 2 (D) ---
    { phase: 'DISC', topic: '02-q1', question: `${DISC_SCENARIOS[1]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'A', explanation: discTypeFb('A', `D (Dominance). Direct, impatient with detail, wants the bottom line. D.`, `"Skip the backstory" and cutting you off are impatience-with-process signals — a D wants results, fast.`) },
    { phase: 'DISC', topic: '02-q2', question: `${DISC_SCENARIOS[1]}\n\n${DISC_Q2}`,
        optionA: `Share the exact amperage readings and the panel's full circuit map so she can study it.`,
        optionB: `Connect over the house, keep it light, and tell her it'll be worry-free.`,
        optionC: `"Here's the problem, here's why the breaker keeps tripping, and here are two ways to fix it — one fast, one permanent." Keep it tight and confident.`,
        optionD: `Reassure her slowly that this is a safe, gentle, long-term fix and there's no rush.`,
        correct: 'C', explanation: JSON.stringify({
            A: `C approach — she just told you to skip detail.`,
            B: `I approach — she's not here to chat.`,
            C: `Correct: problem → cause → solution, options for control, no fluff.`,
            D: `S approach — too slow for a D.`,
        }) },
    // --- Scenario 3 (D) ---
    { phase: 'DISC', topic: '03-q1', question: `${DISC_SCENARIOS[2]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'A', explanation: discTypeFb('A', `D (Dominance). Decisive, deadline-driven, results-only. D.`, `"Can you get it in this week or not?" is a deadline-and-control signal. That's D.`) },
    { phase: 'DISC', topic: '03-q2', question: `${DISC_SCENARIOS[2]}\n\n${DISC_Q2}`,
        optionA: `State whether the panel supports the charger and the impact in one breath, give a firm timeline, and present a do-it-now vs. upgrade-and-do-it-right choice.`,
        optionB: `Pull up the load calculation and the NEC charger requirements and review them line by line.`,
        optionC: `Keep it friendly and upbeat, joke about gas prices, and paint the picture of a worry-free garage.`,
        optionD: `Slow down and gently reassure him this is a safe long-term investment for the family.`,
        correct: 'A', explanation: JSON.stringify({
            A: `Correct: concise, confident, control through options.`,
            B: `C approach — more detail than a D wants.`,
            C: `I approach — he wants speed, not banter.`,
            D: `S approach — too soft and slow.`,
        }) },
    // --- Scenario 4 (I) ---
    { phase: 'DISC', topic: '04-q1', question: `${DISC_SCENARIOS[3]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'B', explanation: discTypeFb('B', `I (Influence). Warm, talkative, relationship-first, expressive. I.`, `The greeting, the small talk, the personal questions — that's an I who connects before business.`) },
    { phase: 'DISC', topic: '04-q2', question: `${DISC_SCENARIOS[3]}\n\n${DISC_Q2}`,
        optionA: `Lay out the full wattage load and fixture spec sheet so she can evaluate.`,
        optionB: `Give the blunt bottom line and a timeline, no fluff.`,
        optionC: `Quietly reassure her it's reliable and take it slow with no pressure.`,
        optionD: `Bring energy, tie the new recessed lighting and dimmers to a warm, beautiful, welcoming home, and show a quick before/after photo.`,
        correct: 'D', explanation: JSON.stringify({
            A: `C approach — you'll overwhelm and bore her.`,
            B: `D approach — too cold; she wants connection.`,
            C: `S approach — fine instinct, but misses her need for energy and excitement.`,
            D: `Correct: I's buy on enthusiasm and lifestyle benefits.`,
        }) },
    // --- Scenario 5 (I) ---
    { phase: 'DISC', topic: '05-q1', question: `${DISC_SCENARIOS[4]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'B', explanation: discTypeFb('B', `I (Influence). Upbeat, jokes, jumps topics, people-first. I.`, `Laughing it off and chatting about the theater setup and the game are I signals — fun and connection over task.`) },
    { phase: 'DISC', topic: '05-q2', question: `${DISC_SCENARIOS[4]}\n\n${DISC_Q2}`,
        optionA: `Hand him the grounding requirements and walk the outlet spec line by line.`,
        optionB: `Keep it light, blend the chat with the benefit — "updating these outlets with USB built right in means everything charges fast so you can enjoy that theater setup."`,
        optionC: `Cut the chatter, give him the bottom line, and push the timeline.`,
        optionD: `Slow way down and stress long-term reliability and ongoing support.`,
        correct: 'B', explanation: JSON.stringify({
            A: `C approach — too heavy for an I.`,
            B: `Correct: link benefits to enjoyment, stay positive, gently steer back.`,
            C: `D approach — too blunt; he'll feel the connection drop.`,
            D: `S approach — misreads his energy.`,
        }) },
    // --- Scenario 6 (I) ---
    { phase: 'DISC', topic: '06-q1', question: `${DISC_SCENARIOS[5]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'B', explanation: discTypeFb('B', `I (Influence). Expressive, jokes, excited about the upgrade. I.`, `The humor and the excitement about feeling protected and modern are I signals — keep it light and positive.`) },
    { phase: 'DISC', topic: '06-q2', question: `${DISC_SCENARIOS[5]}\n\n${DISC_Q2}`,
        optionA: `Stay positive and reassuring, combine the excitement with the practical — "whole-home surge protection keeps all your electronics safe, no surprises, total peace of mind."`,
        optionB: `Present the joule ratings and clamping voltage specs up front.`,
        optionC: `Give a clipped problem-cause-solution and a hard deadline.`,
        optionD: `Take it slow, emphasize decades of reliability and that you'll always be available.`,
        correct: 'A', explanation: JSON.stringify({
            A: `Correct: blend enthusiasm with the benefit.`,
            B: `C approach — too technical for an I.`,
            C: `D approach — too cold.`,
            D: `S approach — misses her need for energy.`,
        }) },
    // --- Scenario 7 (S) ---
    { phase: 'DISC', topic: '07-q1', question: `${DISC_SCENARIOS[6]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'C', explanation: discTypeFb('C', `S (Steadiness). Calm, reserved, reliability-focused, conflict-averse. S.`, `"Something I don't have to worry about" and "enough surprises" are security signals — that's an S, not a fast or data-driven read.`) },
    { phase: 'DISC', topic: '07-q2', question: `${DISC_SCENARIOS[6]}\n\n${DISC_Q2}`,
        optionA: `Give the blunt bottom line, push urgency, and make her decide today.`,
        optionB: `Bring big energy and a fun story about another customer.`,
        optionC: `Be calm and reassuring, explain it step by step, and emphasize how a new panel prevents problems for the long haul — and that you're a call away.`,
        optionD: `Open with the full load calculation and breaker-by-breaker specs.`,
        correct: 'C', explanation: JSON.stringify({
            A: `D approach — pressure makes an S retreat.`,
            B: `I approach — too much; she wants steadiness.`,
            C: `Correct: S's buy on security, prevention, and support.`,
            D: `C approach — more detail than she needs to feel safe.`,
        }) },
    // --- Scenario 8 (S) ---
    { phase: 'DISC', topic: '08-q1', question: `${DISC_SCENARIOS[7]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'C', explanation: discTypeFb('C', `S (Steadiness). Family-safety focus, worried about harm, wants reassurance. S.`, `Concern for the kids and "don't want to worry" are S signals — security and peace of mind drive the decision.`) },
    { phase: 'DISC', topic: '08-q2', question: `${DISC_SCENARIOS[7]}\n\n${DISC_Q2}`,
        optionA: `Connect the fix to family safety and prevention — "GFCI outlets cut the power instantly if there's ever a fault, so the kids are protected near water" — and reassure her on the warranty.`,
        optionB: `Skip ahead to the bottom line and a same-day deadline.`,
        optionC: `Keep it breezy and upbeat with a story.`,
        optionD: `Walk her through the trip-current specs and grounding analysis first.`,
        correct: 'A', explanation: JSON.stringify({
            A: `Correct: tie it to safety and long-term peace of mind.`,
            B: `D approach — too rushed for an S.`,
            C: `I approach — she wants reassurance, not energy.`,
            D: `C approach — more data than she's asking for.`,
        }) },
    // --- Scenario 9 (S) ---
    { phase: 'DISC', topic: '09-q1', question: `${DISC_SCENARIOS[8]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'C', explanation: discTypeFb('C', `S (Steadiness). Cautious, reassurance-seeking, long-term safety focus. S.`, `"Don't want to rush" and nervousness about the wrong call are S signals — they need to feel safe and supported.`) },
    { phase: 'DISC', topic: '09-q2', question: `${DISC_SCENARIOS[8]}\n\n${DISC_Q2}`,
        optionA: `Push hard on urgency and get a yes today.`,
        optionB: `Lead with code citations and thermal imaging data.`,
        optionC: `Get excited and breeze past his hesitation with positivity.`,
        optionD: `Slow down, emphasize ongoing protection and that this panel upgrade lasts for decades, and let him feel supported, not pressured.`,
        correct: 'D', explanation: JSON.stringify({
            A: `D approach — pressure backfires with an S.`,
            B: `C approach — more detail than he needs to feel safe.`,
            C: `I approach — dismisses the reassurance he needs.`,
            D: `Correct: steady guidance, long-term peace of mind.`,
        }) },
    // --- Scenario 10 (C) ---
    { phase: 'DISC', topic: '10-q1', question: `${DISC_SCENARIOS[9]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'D', explanation: discTypeFb('D', `C (Conscientiousness). Wants data, precise, reserved, methodical. C.`, `"Show me the readings" and the "what if" questions are C signals — accuracy and proof drive trust.`) },
    { phase: 'DISC', topic: '10-q2', question: `${DISC_SCENARIOS[9]}\n\n${DISC_Q2}`,
        optionA: `Skip the numbers and give a confident bottom-line recommendation.`,
        optionB: `Show the measurement — "you've got a loose neutral; voltage is swinging outside the safe range, which is why the lights flicker" — and present options with clear pros and cons.`,
        optionC: `Bring energy and a feel-good story about a brighter home.`,
        optionD: `Reassure him gently and focus on peace of mind without the data.`,
        correct: 'B', explanation: JSON.stringify({
            A: `D approach — a C wants the evidence, not just your word.`,
            B: `Correct: C's buy on data and precision.`,
            C: `I approach — too light; he wants facts.`,
            D: `S approach — warmth is fine, but he's asking for proof.`,
        }) },
    // --- Scenario 11 (C) ---
    { phase: 'DISC', topic: '11-q1', question: `${DISC_SCENARIOS[10]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'D', explanation: discTypeFb('D', `C (Conscientiousness). Wants the precise risk, skeptical, needs justification. C.`, `"Understand exactly what the risk is" and needing cost justification are C signals — give them the data.`) },
    { phase: 'DISC', topic: '11-q2', question: `${DISC_SCENARIOS[10]}\n\n${DISC_Q2}`,
        optionA: `Give the facts and the cause — "aluminum expands and contracts, loosening connections over time, which is a documented fire risk; here's what the inspection found" — then lay out solutions with cost and prevention.`,
        optionB: `Tell her not to worry and that you'll take good care of her.`,
        optionC: `Give the quick bottom line and push to close today.`,
        optionD: `Keep it upbeat and tell a quick story to move things along.`,
        correct: 'A', explanation: JSON.stringify({
            A: `Correct: facts, exact cause, documented options.`,
            B: `S approach — reassurance without the proof she's asking for.`,
            C: `D approach — a C won't be rushed.`,
            D: `I approach — she wants evidence, not energy.`,
        }) },
    // --- Scenario 12 (C) ---
    { phase: 'DISC', topic: '12-q1', question: `${DISC_SCENARIOS[11]}\n\n${DISC_Q1}`, ...DISC_TYPE_OPTIONS, correct: 'D', explanation: discTypeFb('D', `C (Conscientiousness). Code, documentation, warranty in writing — precise and thorough. C.`, `Asking about code, documentation, and written warranty are textbook C signals — proof earns the trust.`) },
    { phase: 'DISC', topic: '12-q2', question: `${DISC_SCENARIOS[11]}\n\n${DISC_Q2}`,
        optionA: `Give a confident one-liner and a same-day timeline.`,
        optionB: `Lighten it up with humor and a customer story.`,
        optionC: `Reference the standard — "this breaker doesn't meet NEC code; replacing it brings it into compliance" — and back it with the thermal image, lifespan rating, and written warranty.`,
        optionD: `Reassure him it's safe and you'll be there if anything comes up, no data needed.`,
        correct: 'C', explanation: JSON.stringify({
            A: `D approach — he wants the proof, not just speed.`,
            B: `I approach — too casual for a C.`,
            C: `Correct: compliance, evidence, documentation.`,
            D: `S approach — warmth without the documentation he's requesting.`,
        }) },
];

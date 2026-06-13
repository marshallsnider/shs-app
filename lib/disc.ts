// DISC library: lesson metadata + reading content.
// CLIENT-SAFE. Contains no quiz answers. Quiz questions live in the DB
// (seeded from prisma/seed.ts) and are served via server actions only.

export type DiscBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'say'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] };

export interface DiscLesson {
  slug: string;
  title: string;
  order: number;
  reading: DiscBlock[];
}

export const DISC_SCENARIO_COUNT = 12;
export const DISC_QUESTION_COUNT = 24;

export const DISC_LESSONS: DiscLesson[] = [
  {
    slug: 'intro',
    title: 'Introduction to DISC',
    order: 1,
    reading: [
      { kind: 'h', text: 'What DISC is' },
      { kind: 'p', text: 'DISC is a simple map of how people prefer to interact. It sorts behavior into four patterns: D, I, S, and C. It is not about labeling people or putting them in a box. It is about reading tendencies fast so you can communicate in a way the customer actually hears.' },
      { kind: 'h', text: 'Why it matters on a service call' },
      { kind: 'p', text: 'You are not just fixing equipment. The customer is making an emotional decision about their home, their safety, and their money. The same explanation lands completely differently depending on how you deliver it. Read the customer right and you cut down on confusion, hesitation, and pushback. Read them wrong and a great recommendation falls flat.' },
      { kind: 'h', text: 'The two questions that tell you almost everything' },
      { kind: 'p', text: 'You do not need to diagnose anyone. In the first minute at the door, ask yourself two things:' },
      { kind: 'list', items: [
        'Pace — Are they fast-paced or more deliberate and slow?',
        'Focus — Are they focused on the task, or on people and connection?',
      ] },
      { kind: 'p', text: 'Those two answers place them on the map:' },
      { kind: 'table', headers: ['', 'Task-focused', 'People-focused'], rows: [
        ['Fast-paced', 'D — Dominance', 'I — Influence'],
        ['Slow-paced', 'C — Conscientiousness', 'S — Steadiness'],
      ] },
      { kind: 'p', text: 'A third quick read helps: are they expressive (lots of energy, talk, emotion) or reserved (quiet, measured, holds back)? Expressive points toward I and S-leaning warmth; reserved points toward D’s bluntness and C’s precision.' },
      { kind: 'h', text: 'Bottom line' },
      { kind: 'p', text: 'Treat DISC like a toolbox. You do not need every tool at once, just the right one for the person in front of you. The faster you spot the style, the faster you build trust.' },
    ],
  },
  {
    slug: 'd',
    title: 'The D Personality — Dominance',
    order: 2,
    reading: [
      { kind: 'h', text: 'Mindset' },
      { kind: 'say', text: '"Just tell me what it needs and how fast you can do it."' },
      { kind: 'p', text: 'D stands for Dominance. Fast-paced, results-focused, decisive, competitive. Values efficiency, control, and getting it done.' },
      { kind: 'h', text: 'Core traits' },
      { kind: 'list', items: [
        'Direct and to the point',
        'Impatient with small talk',
        'Makes quick decisions',
        'Can come across as blunt or demanding',
      ] },
      { kind: 'h', text: 'Read them at the door' },
      { kind: 'list', items: [
        'Strong handshake, intense eye contact, upright posture, quick movements',
        'Asks "How long will this take?" almost immediately',
        'Speaks in short, declarative statements',
        'Focused on the end result, not the process',
      ] },
      { kind: 'h', text: 'They say things like' },
      { kind: 'say', text: '"What’s the bottom line?" • "Skip it, just tell me if it’s worth fixing." • "Can you finish today or not?"' },
      { kind: 'h', text: 'How to communicate' },
      { kind: 'list', items: [
        'Get to the point fast',
        'Show competence — they respect skill and confidence',
        'Lead with results, timelines, and impact',
        'Skip the small talk; stand your ground politely',
      ] },
      { kind: 'h', text: 'How to sell / make the offer' },
      { kind: 'list', items: [
        'Frame it problem → cause → solution, in that order, quickly',
        'Present solutions, not just a "fix"',
        'Use urgency tied to control: "If we do this today, you avoid downtime tomorrow."',
        'Offer two clear options so they feel in command of the decision',
        'Confidence wins over detail every time',
      ] },
      { kind: 'h', text: 'Avoid' },
      { kind: 'p', text: 'Over-explaining, long technical history, hesitation, too much small talk.' },
    ],
  },
  {
    slug: 'i',
    title: 'The I Personality — Influence',
    order: 3,
    reading: [
      { kind: 'h', text: 'Mindset' },
      { kind: 'say', text: '"I want to enjoy this interaction and feel good about my choice."' },
      { kind: 'p', text: 'I stands for Influence. Outgoing, optimistic, people-oriented. Thrives on conversation and connection. Motivated by recognition, approval, and excitement.' },
      { kind: 'h', text: 'Core traits' },
      { kind: 'list', items: [
        'Talkative and expressive',
        'Relationship-first, business-second',
        'Energetic and optimistic',
        'Can get distracted or jump between topics',
      ] },
      { kind: 'h', text: 'Read them at the door' },
      { kind: 'list', items: [
        'Warm greeting, big smile, often a handshake or a touch on the arm',
        'Open body language; may stand close',
        'Engages in small talk before any business',
        'Asks personal questions about you',
        'Space may feel lively, colorful, personalized',
      ] },
      { kind: 'h', text: 'They say things like' },
      { kind: 'say', text: '"Come on in!" • "Oh I love that." • "That’s amazing." • lots of stories.' },
      { kind: 'h', text: 'How to communicate' },
      { kind: 'list', items: [
        'Lead with connection, then get to the point',
        'Stay upbeat and positive',
        'Use stories and simple visuals, not heavy data',
        'Keep them gently on track by linking back to benefits',
      ] },
      { kind: 'h', text: 'How to sell / make the offer' },
      { kind: 'list', items: [
        'Bring enthusiasm to the recommendation',
        'Paint the picture: comfort, peace of mind, enjoyment, lifestyle',
        'Keep it light — don’t drown them in numbers',
        'Reinforce with a quick photo or example',
        'Make the buying decision feel exciting and rewarding',
      ] },
      { kind: 'h', text: 'Avoid' },
      { kind: 'p', text: 'Heavy technical detail, a flat or rushed tone, making it feel like a transaction.' },
    ],
  },
  {
    slug: 's',
    title: 'The S Personality — Steadiness',
    order: 4,
    reading: [
      { kind: 'h', text: 'Mindset' },
      { kind: 'say', text: '"I want to feel safe, secure, and supported in this decision."' },
      { kind: 'p', text: 'S stands for Steadiness. Calm, cooperative, dependable, loyal. Thrives on stability and security. Motivated by peace, consistency, and avoiding conflict.' },
      { kind: 'h', text: 'Core traits' },
      { kind: 'list', items: [
        'Calm and patient',
        'Avoids confrontation and pressure',
        'Values reliability over flash',
        'Slower, more thoughtful decisions',
      ] },
      { kind: 'h', text: 'Read them at the door' },
      { kind: 'list', items: [
        'Calm, polite, welcoming but a little reserved',
        'May avoid eye contact at first, warms up as trust builds',
        'More reserved body language than a D or an I',
        'Asks about long-term reliability, not quick fixes',
        'Home often feels comfortable, organized, modest',
      ] },
      { kind: 'h', text: 'They say things like' },
      { kind: 'say', text: '"Will this keep happening?" • "I just want it reliable." • "I want to make sure it’s safe for my family."' },
      { kind: 'h', text: 'How to communicate' },
      { kind: 'list', items: [
        'Be calm, patient, and reassuring',
        'Go step by step: problem → cause → solution',
        'Never rush or pressure them',
        'Emphasize safety, reliability, and peace of mind',
      ] },
      { kind: 'h', text: 'How to sell / make the offer' },
      { kind: 'list', items: [
        'Lead with peace of mind and long-term reliability',
        'Show how the solution prevents future problems',
        'Present steady, logical steps rather than flashy upgrades',
        'Reassure them you’ll be there: "I’ll be here if you need me."',
        'Guide them gently to the best fit instead of pushing',
      ] },
      { kind: 'h', text: 'Avoid' },
      { kind: 'p', text: 'High-pressure tactics, rushing, drastic "rip it all out" framing, hard urgency.' },
    ],
  },
  {
    slug: 'c',
    title: 'The C Personality — Conscientiousness',
    order: 5,
    reading: [
      { kind: 'h', text: 'Mindset' },
      { kind: 'say', text: '"I want to make the right decision with the right information."' },
      { kind: 'p', text: 'C stands for Conscientiousness. Logical, detail-oriented, systematic. Motivated by accuracy, quality, and data. Thrives on structure and dislikes being wrong.' },
      { kind: 'h', text: 'Core traits' },
      { kind: 'list', items: [
        'Analytical and precise',
        'Cautious and thorough',
        'Slower to trust, but commits strongly once convinced',
        'Dislikes vague answers',
      ] },
      { kind: 'h', text: 'Read them at the door' },
      { kind: 'list', items: [
        'Polite but reserved, not overly warm',
        'Asks detailed, technical, or "what if" questions',
        'Home looks tidy, organized, minimalist',
        'Wants to see reports, documentation, or double-check details',
      ] },
      { kind: 'h', text: 'They say things like' },
      { kind: 'say', text: '"Can you show me the numbers?" • "Why exactly did this happen?" • "Does this meet code?"' },
      { kind: 'h', text: 'How to communicate' },
      { kind: 'list', items: [
        'Be factual, detailed, and precise',
        'Back everything with data, tests, or documentation',
        'Use exact figures — "the pressure is 95 PSI," not "the pressure’s high"',
        'Give them time; don’t rush the decision',
      ] },
      { kind: 'h', text: 'How to sell / make the offer' },
      { kind: 'list', items: [
        'Lead with accuracy, safety, and compliance',
        'Show how the recommendation meets standards or code',
        'Support it with data, warranties, and guarantees',
        'Present multiple solutions with clear pros and cons',
        'Earn confidence through facts, never pressure',
      ] },
      { kind: 'h', text: 'Avoid' },
      { kind: 'p', text: 'Winging it, vague claims, pushiness, rushing them to decide.' },
    ],
  },
];

// Module summary screen copy (shown on the results screen).
export const DISC_SUMMARY_HEAD = 'You just practiced reading the room.';
export const DISC_SUMMARY_BODY =
  'Every customer is sending signals in the first minute. Pace tells you fast or slow. Focus tells you task or people. Put those together and you know whether you’re talking to a D, an I, an S, or a C — and once you know that, you know how to make the offer land.';

export const DISC_CHEAT_SHEET: { type: string; line: string }[] = [
  { type: 'D', line: 'bottom line, options, control.' },
  { type: 'I', line: 'energy, benefits, keep it light.' },
  { type: 'S', line: 'reassurance, reliability, no pressure.' },
  { type: 'C', line: 'data, proof, documentation.' },
];

export const DISC_SUMMARY_FOOT =
  'Pass mark: 80%. Miss it, review the profiles and run it again.';

export const DISC_SLUGS = DISC_LESSONS.map((l) => l.slug);

export function getDiscLesson(slug: string): DiscLesson | undefined {
  return DISC_LESSONS.find((l) => l.slug === slug);
}

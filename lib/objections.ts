// Objection library: lesson metadata + reading content.
// CLIENT-SAFE. Contains no quiz answers. Quiz questions live in the DB
// (seeded from prisma/seed.ts) and are served via server actions only.

export type Block =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'say'; text: string }
  | { kind: 'list'; items: string[] };

export interface ObjectionModule {
  slug: string;
  title: string;
  order: number;
  reading: Block[];
}

export const OBJECTION_MODULES: ObjectionModule[] = [
  {
    slug: 'price',
    title: 'Why Is Your Price So High?',
    order: 1,
    reading: [
      { kind: 'h', text: 'A price objection is a trust gap, not a money gap' },
      { kind: 'p', text: 'When a customer says "why is your price so high," they are almost never saying they can\'t afford it. They don\'t yet see the full value. Usually they\'re comparing you to a DIY video, a buddy who "knows a guy," or a lowball quote. Your job isn\'t to defend a number. It\'s to close a trust gap.' },
      { kind: 'h', text: 'The method: NEPQ' },
      { kind: 'p', text: 'People don\'t argue with their own conclusions. Instead of telling them your price is fair, you ask a calm, curious question and let them work it out.' },
      { kind: 'h', text: 'The one question that does the work' },
      { kind: 'say', text: '"I hear you. When you say that, what are you comparing it to?"' },
      { kind: 'p', text: 'That tells you everything. A $25 breaker online? They don\'t know the install is the critical part. Another company\'s quote? Find out if it includes the same fix and warranty, or just a patch.' },
      { kind: 'h', text: 'Address it: Empathy, Education, Concern' },
      { kind: 'list', items: ['Empathy: "I get it."', 'Education: "Here\'s what\'s actually happening" — then show the thermal image or photo.', 'Concern: "Here\'s what happens if we leave it."'] },
      { kind: 'p', text: 'Offer more than one solution so they stay in control, and remember financing. They don\'t have to pay the whole thing today.' },
    ],
  },
  {
    slug: 'think',
    title: 'I Need to Think About It',
    order: 2,
    reading: [
      { kind: 'h', text: '"Think about it" is almost never literal' },
      { kind: 'p', text: 'They\'re rarely asking for time. Something\'s unsettled — they\'re not convinced, they don\'t fully trust the solution, or they\'re unsure on cost or urgency. It\'s a soft door closing. Your job is to gently hold it open.' },
      { kind: 'h', text: 'The one question that opens it back up' },
      { kind: 'say', text: '"Totally fair. Can I ask — what part do you feel you need to think more about?"' },
      { kind: 'p', text: 'Then narrow it: "Is it more about the cost, the timing, or trust in the fix?" Once they name it, you\'re no longer guessing.' },
      { kind: 'h', text: 'Address it: Empathy, Education, Concern' },
      { kind: 'p', text: '"I understand. The thermal scan shows this breaker overheating right now. Can I walk you through what happens if it fails during peak use?" You\'re not pushing. You\'re helping them see what they can\'t.' },
      { kind: 'h', text: 'Don\'t push, help them decide' },
      { kind: 'p', text: 'Stay calm, offer more than one solution. If they\'re genuinely leaving it: "Before I go, want me to walk you through the difference between these, so it\'s clear when you come back to it?"' },
    ],
  },
  {
    slug: 'spouse',
    title: 'I Need to Talk to My Spouse',
    order: 3,
    reading: [
      { kind: 'h', text: 'Respect the partnership, always' },
      { kind: 'p', text: 'This is the one where the wrong instinct does the most damage. Never push back on a customer wanting to talk to their partner. Telling someone they don\'t need to check with their spouse reads as disrespectful and costs you the trust you just built. The skill is equipping your customer to have a confident conversation when you\'re not in the room.' },
      { kind: 'h', text: 'The one question that draws it out' },
      { kind: 'say', text: '"Totally makes sense. Out of curiosity, what questions do you think your spouse will have?"' },
      { kind: 'p', text: 'This respects the partner and surfaces the real concern at once. Follow with: "If they were here right now, what would they ask me first — cost or the long-term safety?"' },
      { kind: 'h', text: 'Address it: equip them to present' },
      { kind: 'p', text: 'Your customer becomes your salesperson to an audience you\'ll never meet. So arm them: "The scan shows this overheating beyond safe limits. Can I send both of you the image and today\'s safety report, so it\'s easy to walk through together?" You can also offer a quick call with both of them.' },
    ],
  },
  {
    slug: 'quotes',
    title: 'I Want to Get Other Quotes',
    order: 4,
    reading: [
      { kind: 'h', text: 'Comparison shopping is about confidence, not price' },
      { kind: 'p', text: 'The instinct is to hear "your price is too high." Usually it\'s not. They want confidence they\'re making a smart decision and not overpaying. Your job isn\'t to talk them out of comparing — it\'s to make sure they compare the right things, and that you come out the obvious choice.' },
      { kind: 'h', text: 'The one question that frames the comparison' },
      { kind: 'say', text: '"Totally fair — when you look at other quotes, what\'s the most important thing you\'re hoping to compare?"' },
      { kind: 'p', text: 'Follow with: "lowest price, the warranty, or trust in the work?" Their answer points the comparison to where you win.' },
      { kind: 'h', text: 'Arm them to compare apples to apples' },
      { kind: 'p', text: 'Most cheap quotes skip the part that matters — they don\'t test, scan, or put a warranty in writing. "Here\'s the thermal scan showing this overheating. That way, when you compare, you\'ll know whether the other company even identified the same safety risk."' },
      { kind: 'h', text: 'The honest nudge' },
      { kind: 'p', text: '"If the other quote doesn\'t include a scan or a warranty, how will you know it\'s actually solving the same problem?" You\'re not knocking anyone. You\'re making sure they compare like for like.' },
    ],
  },
  {
    slug: 'wait',
    title: 'I Want to Wait',
    order: 5,
    reading: [
      { kind: 'h', text: 'Waiting is rarely about timing' },
      { kind: 'p', text: '"Wait" usually means "I\'m not fully convinced yet." Underneath it: fear of the wrong call, a cost they won\'t name, or just not seeing the risk clearly enough to feel urgency. Waiting feels safe. Your job is to gently make the real cost of waiting visible, then let them decide with eyes open.' },
      { kind: 'h', text: 'The one question that surfaces the real reason' },
      { kind: 'say', text: '"That\'s totally fair. When you say wait, what are you hoping will be different later on?"' },
      { kind: 'p', text: 'Follow with: "What would make you feel comfortable moving forward today versus waiting?"' },
      { kind: 'h', text: 'Make the cost of waiting visible' },
      { kind: 'p', text: '"The thermal scan shows this breaker overheating right now. Waiting raises the risk of real damage. Can I show you the code guideline for safe temperatures, so you can see where this sits?" You\'re not scaring them — you\'re showing what\'s already happening.' },
      { kind: 'h', text: 'Gentle, not pushy' },
      { kind: 'p', text: '"What do you feel is safer — handling it now, or hoping it holds until later?" Let them decide. Just make sure the risk is on the table first.' },
    ],
  },
  {
    slug: 'estimate',
    title: 'Can You Just Leave Me an Estimate?',
    order: 6,
    reading: [
      { kind: 'h', text: 'Lead with yes' },
      { kind: 'p', text: 'The old line was "we don\'t give estimates." Drop it. It backfires two ways: it contradicts our own marketing (the customer was told we\'d come give an estimate), and it\'s an easy out that ends the conversation instead of working it. So your first word is yes:' },
      { kind: 'say', text: '"Yeah, absolutely, I can get you an estimate."' },
      { kind: 'h', text: 'What makes ours different' },
      { kind: 'p', text: 'Right after the yes, add the two things most contractors can\'t:' },
      { kind: 'say', text: '"Couple things that make ours different. The number I give you is the number — it won\'t change once we start. And I\'m set up to take care of this today if you want it handled."' },
      { kind: 'h', text: 'Probe for the real reason' },
      { kind: 'say', text: '"Before I do, can I ask — what\'s keeping you from getting it taken care of today?"' },
      { kind: 'p', text: 'That answer is the real objection — spouse, price, comparing, or waiting. The estimate request was just the doorway.' },
      { kind: 'h', text: 'Never end on the estimate' },
      { kind: 'say', text: '"I\'ll get this to you, and I\'ll check back in. When\'s the best time for me to call — tomorrow or Thursday?"' },
      { kind: 'p', text: 'Now the customer expects your call, the price is locked, and you own the follow-up instead of waiting on them.' },
    ],
  },
];

export const OBJECTION_SLUGS = OBJECTION_MODULES.map((m) => m.slug);

export function getObjectionModule(slug: string): ObjectionModule | undefined {
  return OBJECTION_MODULES.find((m) => m.slug === slug);
}

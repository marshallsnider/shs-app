import prisma from '../lib/db';

const BADGES = [
    { code: 'FIRST_STEPS', name: 'First Steps', description: 'Complete your first job', icon: 'Star' },
    { code: 'MONEY_MAKER', name: 'Money Maker', description: 'Earn your first weekly bonus ($7k+)', icon: 'DollarSign' },
    { code: 'REVIEW_MASTER', name: 'Review Master', description: 'Get 5+ reviews in a single week', icon: 'Star' },
    { code: 'ON_FIRE', name: 'On Fire', description: '5 consecutive compliant weeks', icon: 'Flame' },
    { code: 'UNSTOPPABLE', name: 'Unstoppable', description: '10 consecutive compliant weeks', icon: 'Zap' },
    { code: 'HIGH_ROLLER', name: 'High Roller', description: 'Hit $13k+ in a single week', icon: 'Crown' },
    { code: 'MEMBERSHIP_PRO', name: 'Membership Pro', description: 'Sell 5+ memberships in a single week', icon: 'Users' },
    { code: 'PERFECT_WEEK', name: 'Perfect Week', description: '$7k+ Revenue AND 100% Compliance', icon: 'ShieldCheck' },
    // PACE Training badges
    { code: 'PACE_FIRST_QUIZ', name: 'First Step', description: 'Complete your first PACE quiz', icon: 'BookOpen' },
    { code: 'PACE_PREPARE_MASTER', name: 'Prepare Master', description: 'Master the Prepare phase', icon: 'BookOpen' },
    { code: 'PACE_ARRIVE_MASTER', name: 'Arrive Master', description: 'Master the Arrive phase', icon: 'MapPin' },
    { code: 'PACE_CONNECT_MASTER', name: 'Connect Master', description: 'Master the Connect phase', icon: 'MessageCircle' },
    { code: 'PACE_EXECUTE_MASTER', name: 'Execute Master', description: 'Master the Execute phase', icon: 'Wrench' },
    { code: 'PACE_CHAMPION', name: 'PACE Master', description: 'Master all 4 PACE phases', icon: 'Trophy' },
    { code: 'PACE_PERFECT_SCORE', name: 'Perfect Score', description: 'Score 100% on a Full PACE Quiz', icon: 'Target' },
    { code: 'PACE_CONSISTENT', name: 'Consistent', description: 'Complete quizzes 3 weeks in a row', icon: 'Flame' },
    { code: 'PACE_STARTER', name: 'PACE Starter', description: 'Pass all 4 phase quizzes in one week', icon: 'GraduationCap' },
];

const QUIZ_QUESTIONS = [
    // PREPARE Phase (8 questions)
    {
        phase: 'PREPARE',
        question: 'What is the first thing a tech should do before arriving at a call?',
        optionA: 'Call the customer to confirm the appointment',
        optionB: 'Clear your head: leave personal issues behind and reset mentally',
        optionC: 'Load the truck with all possible materials',
        optionD: "Review the customer's billing history",
        correct: 'B',
        explanation: 'The Prepare phase starts with mental readiness. Use the 3-question exercise: What am I upset about? What am I anxious about? What am I curious or excited about?',
    },
    {
        phase: 'PREPARE',
        question: "Where should a technician park when arriving at a customer's home?",
        optionA: 'In the driveway for easy equipment access',
        optionB: 'Around the corner out of sight',
        optionC: 'In clear view of the front of the home, parked straight, not blocking any vehicles',
        optionD: 'Wherever is most convenient to the job',
        correct: 'C',
        explanation: 'Parking in the driveway or blocking vehicles creates a bad first impression. Parking in clear view of the front communicates professionalism before the customer opens the door.',
    },
    {
        phase: 'PREPARE',
        question: 'When studying a call before arrival, what three things should you review?',
        optionA: 'Customer payment history, competitor pricing, weather conditions',
        optionB: 'Reason for call, potential causes of the issue, previous issues at the home',
        optionC: 'Truck inventory, drive time, lunch options',
        optionD: 'Technician schedule, customer DISC profile, company revenue goals',
        correct: 'B',
        explanation: 'Studying the call means understanding why you are going, what might be causing it, and what history the home has. This lets you arrive with a plan.',
    },
    {
        phase: 'PREPARE',
        question: 'Why does having all needed materials with you matter for closing?',
        optionA: 'It reduces drive time between calls',
        optionB: 'It impresses the customer with your truck size',
        optionC: 'Customers are more likely to approve solutions when you have everything on hand',
        optionD: 'It keeps your warehouse inventory accurate',
        correct: 'C',
        explanation: 'If you have to leave to get materials, the customer has time to reconsider, call competitors, or talk themselves out of the work. Having materials on the truck removes that friction.',
    },
    {
        phase: 'PREPARE',
        question: 'Which of the following is part of the appearance check in Prepare?',
        optionA: 'Making sure your phone is charged',
        optionB: 'Confirming the job is billable',
        optionC: 'Clean fingernails, professional appearance, extra uniforms available if needed',
        optionD: 'Reviewing the company price book',
        correct: 'C',
        explanation: 'Appearance communicates professionalism before you say a word. Dirty fingernails or a wrinkled uniform signals to the customer that attention to detail may be missing in your work too.',
    },
    {
        phase: 'PREPARE',
        question: 'The 3-question mental reset exercise asks: What am I upset about, what am I anxious about, and what?',
        optionA: 'What am I going to charge today?',
        optionB: 'What am I curious or excited about?',
        optionC: 'What did I forget to bring?',
        optionD: 'What went wrong on my last call?',
        correct: 'B',
        explanation: 'The third question shifts your mindset forward. It moves you from stress toward engagement, which directly affects how you show up at the door.',
    },
    {
        phase: 'PREPARE',
        question: 'What should you do if you do not have the equipment or materials you need for a call?',
        optionA: 'Proceed anyway and improvise on site',
        optionB: 'Skip that part of the inspection',
        optionC: 'Know where you can get it before you arrive: have a plan',
        optionD: 'Tell the customer you will need to reschedule',
        correct: 'C',
        explanation: 'Not having materials is not an excuse to leave or skip work. Knowing where to get what you need keeps the call moving and protects the close.',
    },
    {
        phase: 'PREPARE',
        question: 'What breathing technique is recommended during the mental reset in Prepare?',
        optionA: 'Rapid shallow breathing to stay alert',
        optionB: 'Holding your breath for 10 seconds',
        optionC: 'Deep belly breathing to shift from chest breathing',
        optionD: 'No specific breathing guidance is given',
        correct: 'C',
        explanation: 'Chest breathing is a stress response. Belly breathing signals the body to calm down. This is a practical tool for resetting between difficult calls.',
    },
    // ARRIVE Phase (7 questions)
    {
        phase: 'ARRIVE',
        question: "How should a technician knock on a customer's door?",
        optionA: 'Knock firmly on the center of the door',
        optionB: 'Ring the doorbell twice',
        optionC: 'Knock on the door jamb, not the door itself',
        optionD: 'Text the customer to let them know you are outside',
        correct: 'C',
        explanation: 'Babies may be sleeping, people may work nights, and dogs can react. Knocking on the door jamb is quieter and more professional. If there is a Ring doorbell, use it.',
    },
    {
        phase: 'ARRIVE',
        question: 'When giving your greeting at the door, where do you stand?',
        optionA: 'Directly in front of the door, close to the threshold',
        optionB: 'At the bottom of the porch steps',
        optionC: '3 feet back and at a 45-degree angle',
        optionD: 'Wherever feels natural in the moment',
        correct: 'C',
        explanation: 'Standing back and at an angle is non-threatening and respectful of personal space. It communicates that you are there to help, not to push into their home.',
    },
    {
        phase: 'ARRIVE',
        question: "The correct greeting sequence starts with confirming the customer's name. What comes immediately after?",
        optionA: 'Ask where the electrical panel is',
        optionB: 'Introduce yourself and your company, confirm your role as their technician today',
        optionC: 'Start unloading equipment from the truck',
        optionD: 'Ask about their budget for today',
        correct: 'B',
        explanation: 'The sequence is: confirm their name, introduce yourself, confirm your role, ask about parking, ask to come in, put on floor savers, ask them to tell you what is going on.',
    },
    {
        phase: 'ARRIVE',
        question: 'What is the floor saver statement communicating to the customer beyond just protecting the floor?',
        optionA: 'That you follow OSHA safety regulations',
        optionB: 'Respect for their property: it signals you treat their home as you would treat your own',
        optionC: 'That you are required to by company policy',
        optionD: 'That you have sensitive equipment to protect',
        correct: 'B',
        explanation: 'The floor savers are symbolic as much as functional. They tell the customer: I notice your home, I respect your space, I am not just here to do a job and leave.',
    },
    {
        phase: 'ARRIVE',
        question: 'Where should the initial assessment of the issue begin?',
        optionA: 'In the doorway while the customer is still greeting you',
        optionB: 'At the electrical panel first, regardless of the complaint',
        optionC: 'Directly at the source of the issue you were called for',
        optionD: 'In the kitchen, since most issues are in high-use areas',
        correct: 'C',
        explanation: 'Do not start assessing in the doorway. Do not rush to the panel. Go directly to the reason you were called. This shows you listened and respect the customer\'s time.',
    },
    {
        phase: 'ARRIVE',
        question: 'What should you do if the customer is rushing you during the Arrive phase?',
        optionA: 'Match their pace to keep them comfortable',
        optionB: 'Slow down and take control of the call professionally',
        optionC: 'Skip ahead to writing solutions to save time',
        optionD: 'Call Victoria to let her know the appointment may run short',
        correct: 'B',
        explanation: 'A rushed tech makes mistakes and misses revenue opportunities. You control the pace of the call. Slowing down is a professional skill, not a customer inconvenience.',
    },
    {
        phase: 'ARRIVE',
        question: "What is the purpose of asking 'Am I parked okay there?' while pointing to your truck?",
        optionA: 'To confirm you are not blocking traffic',
        optionB: 'To start a friendly conversation and draw their attention to your professional vehicle',
        optionC: 'Because company policy requires you to ask',
        optionD: 'To give the customer a chance to move their car if needed',
        correct: 'B',
        explanation: 'This question serves a dual purpose: it is a natural conversation opener and it draws the customer\'s eye to your truck, which reinforces brand presence at the start of the call.',
    },
    // CONNECT Phase (10 questions)
    {
        phase: 'CONNECT',
        question: 'What is the minimum number of relationship building questions you must ask in the Connect phase?',
        optionA: '2',
        optionB: '3',
        optionC: '5',
        optionD: '10',
        correct: 'C',
        explanation: 'A minimum of 5 relationship building questions is required. These questions are not small talk: each one has a strategic purpose that helps you understand the customer and set up the rest of the call.',
    },
    {
        phase: 'CONNECT',
        question: "When a customer says 'We just moved in 6 months ago,' what opportunity does this create?",
        optionA: 'An opportunity to offer a moving discount',
        optionB: 'An opportunity to educate them on their system since they are new to it',
        optionC: 'A signal that they are unlikely to buy anything today',
        optionD: 'A reason to skip the relationship building questions',
        correct: 'B',
        explanation: "Newer residents often do not know the history or condition of the home's electrical system. This opens the door to education, which builds trust and identifies additional service opportunities.",
    },
    {
        phase: 'CONNECT',
        question: "'Who discovered the issue?' reveals what strategic information?",
        optionA: 'Whose name to put on the invoice',
        optionB: "The customer's daily lifestyle and whether another decision-maker needs to be involved",
        optionC: 'How long the issue has existed',
        optionD: 'Whether the issue is covered under warranty',
        correct: 'B',
        explanation: 'Knowing who discovered the issue tells you about the household dynamic and whether another party needs to be part of the conversation, ideally before money is on the table.',
    },
    {
        phase: 'CONNECT',
        question: 'What is the recommended response when a customer says they have never done regular maintenance on their system?',
        optionA: 'Tell them they should have: it is required',
        optionB: 'Move on quickly to avoid making them feel bad',
        optionC: 'Use it as an opportunity to introduce the maintenance plan and show your expertise',
        optionD: "Give them a discount for today's call to make up for it",
        correct: 'C',
        explanation: '99% of customers will say they did not know maintenance was necessary. This is your first and best natural opening to introduce the Club Membership: show the benefits physically, but do not discuss discounts yet.',
    },
    {
        phase: 'CONNECT',
        question: 'A customer says they already got two other estimates. What is the correct response?',
        optionA: "Immediately offer to beat the competitor's price",
        optionB: 'Ask why they are looking for the price to change and explain the value of upfront pricing',
        optionC: 'Thank them for the comparison shopping and proceed normally',
        optionD: 'Call the office to ask how to handle it',
        correct: 'B',
        explanation: "Getting multiple estimates signals price-shopping. The question 'Why are you looking for the price to change later?' reframes the conversation and opens the door to discussing the value of flat-rate, upfront pricing.",
    },
    {
        phase: 'CONNECT',
        question: 'What does the LISTEN acronym stand for in the Connect phase?',
        optionA: 'Look, Inquire, Summarize, Teach, Engage, Narrate',
        optionB: 'Look interested and get interested, Involve yourself, Stay on target, Test understanding, Evaluate the message, Neutralize your feelings',
        optionC: 'Listen, Interpret, Solve, Talk, Execute, Note',
        optionD: 'Learn, Investigate, Share, Trust, Empathize, Navigate',
        correct: 'B',
        explanation: 'LISTEN is a six-part active listening framework used throughout the Connect phase. It is the discipline behind the relationship building questions: it is not enough to ask the questions, you have to actually hear the answers.',
    },
    {
        phase: 'CONNECT',
        question: 'When should you physically open and show the Club Membership benefits?',
        optionA: 'At the end of the call when presenting solutions',
        optionB: 'During the first trust statement',
        optionC: 'During the relationship building questions, specifically when maintenance comes up',
        optionD: 'Only if the customer directly asks about it',
        correct: 'C',
        explanation: 'The Club Membership has three natural introduction points in a call. The first is during Connect, when maintenance comes up. Show the benefits physically at this point, but do not discuss percentage discounts yet.',
    },
    {
        phase: 'CONNECT',
        question: 'The company trust statement ends with what phrase?',
        optionA: 'We are the best in the business.',
        optionB: '100% Satisfaction, Guaranteed!',
        optionC: "We will match any competitor's price.",
        optionD: 'Your safety is our top priority.',
        correct: 'B',
        explanation: 'We provide you with up-front pricing so no matter how long it takes, you know exactly what to expect before any work begins. 100% Satisfaction, Guaranteed! This statement must be delivered consistently on every call.',
    },
    {
        phase: 'CONNECT',
        question: 'In the Job Explanation, what is the correct phrase to close the explanation and transition to the assessment?',
        optionA: "Let's get started.",
        optionB: "I'll head down to the panel first.",
        optionC: 'Before I begin my assessment, can you show me where the heart of the system is?',
        optionD: 'You can wait here while I check things out.',
        correct: 'C',
        explanation: "'Heart of the system' is intentional language: it is more relatable than 'electrical panel' and positions the panel as the center of the home's safety, which reinforces the value of the full assessment.",
    },
    {
        phase: 'CONNECT',
        question: "What is the purpose of asking 'Are there any rooms in the home you do not want me to go in?'",
        optionA: 'To limit the scope of the inspection and save time',
        optionB: "To respect the customer's privacy and establish trust before entering their space",
        optionC: 'To comply with company liability policy',
        optionD: 'To find out where to avoid installing new equipment',
        correct: 'B',
        explanation: 'This question is not about limiting access: it is about establishing consent. Customers feel more comfortable allowing a full assessment when you have asked permission first.',
    },
    // EXECUTE Phase (8 questions)
    {
        phase: 'EXECUTE',
        question: 'When presenting the summary to the customer, where should the technician be?',
        optionA: 'Standing at the electrical panel',
        optionB: 'Seated at the table with the customer',
        optionC: 'In the kitchen where the work was done',
        optionD: 'At the front door to respect their time',
        correct: 'B',
        explanation: 'Sitting down signals that this is a conversation, not a transaction. It slows the call down intentionally and puts you at the same level as the customer, which is where trust and decisions happen.',
    },
    {
        phase: 'EXECUTE',
        question: 'What must always be line item #1 in every solution tier?',
        optionA: 'The Club Membership',
        optionB: 'Safety upgrades found during inspection',
        optionC: 'The reason for the call',
        optionD: 'The most profitable repair',
        correct: 'C',
        explanation: 'Every solution must start with the reason the customer called you. This confirms you heard them and that what they care about is being addressed, before anything else is added.',
    },
    {
        phase: 'EXECUTE',
        question: 'The three solution tiers are Upgrade, Prevent, and Replace. Which tier represents a like-for-like replacement?',
        optionA: 'Upgrade',
        optionB: 'Prevent',
        optionC: 'Replace',
        optionD: 'There is no like-for-like tier: all solutions should be upgrades',
        correct: 'C',
        explanation: 'Replace is the baseline: it solves the immediate problem with a direct replacement. Upgrade adds the most advanced solution. Prevent is optimally sized for reliability and low maintenance cost.',
    },
    {
        phase: 'EXECUTE',
        question: "When should you close with 'Which solution would you like for me to do for you today?' and what do you do immediately after?",
        optionA: 'Say it, then explain the payment options',
        optionB: 'Say it, then wait silently for the customer to respond: do not say anything else',
        optionC: 'Say it, then summarize the most popular choice to guide them',
        optionD: 'Say it, then step outside to give them privacy',
        correct: 'B',
        explanation: 'After the close question, silence is your most powerful tool. Filling the silence with more talking undermines the close. Wait. Let the customer decide.',
    },
    {
        phase: 'EXECUTE',
        question: "A customer says 'I need to talk to my spouse.' What is the first response?",
        optionA: 'Leave the solutions and offer to follow up in a week',
        optionB: 'Respect their process and schedule a callback',
        optionC: "'Perfect: can we give them a call right now so we can go over the solutions together?'",
        optionD: 'Ask if they have a power of attorney',
        correct: 'C',
        explanation: 'The goal is to get the other decision-maker on the call now, while you are there. Leaving and coming back is a significant drop in close probability. If they say they cannot reach them, then move to the backup responses.',
    },
    {
        phase: 'EXECUTE',
        question: "A customer says 'Can you leave me an estimate?' What is the correct response?",
        optionA: 'Leave a printed estimate and your business card',
        optionB: 'Tell them you do not give estimates and explain why upfront pricing protects them',
        optionC: 'Email them the estimate later that day',
        optionD: 'Offer to come back when the other decision-maker is home',
        correct: 'B',
        explanation: 'SHS does not give estimates because estimates are subject to change. The correct response explains that upfront pricing means they know exactly what they are paying before any work begins, which is a benefit, not a limitation.',
    },
    {
        phase: 'EXECUTE',
        question: "A customer asks 'Why is your price so high?' What is the first question you ask back?",
        optionA: "'Compared to what?'",
        optionB: "'Would you like to discuss financing options?'",
        optionC: "'Which solution do you believe is too high?'",
        optionD: "'I understand: let me see what I can do.'",
        correct: 'C',
        explanation: "You need to know which solution they are reacting to before you can respond. Asking 'which solution' narrows the objection and tells you where more information is needed. If they say all of them, then ask what they are comparing the price to.",
    },
    {
        phase: 'EXECUTE',
        question: 'When in the call is the Club Membership introduced for the third and final time?',
        optionA: 'At the very end, after solutions are accepted',
        optionB: 'During the summary write-up',
        optionC: 'When presenting the solutions, at the same time as the three tiers',
        optionD: 'Only if the customer brings it up',
        correct: 'C',
        explanation: 'The Club Membership has three introduction points: during relationship building (when maintenance comes up), during the trust statements, and again when presenting solutions, where the discount is finally discussed. All three touches are required.',
    },
];

// --- Objection (Sales) questions ---
// phase 'OBJECTION' with a topic slug. Kept separate from PACE phase/FULL pools.
const OBJECTION_QUESTIONS = [
    // PRICE
    { phase: 'OBJECTION', topic: 'price', question: `When a customer says "your price is too high," what is usually really going on?`, optionA: `They genuinely cannot afford the work`, optionB: `There is a trust or value gap, not a money problem`, optionC: `They are trying to insult you`, optionD: `They have already decided to go with someone else`, correct: 'B', explanation: `A price objection is usually a trust gap. They do not yet see the full value.` },
    { phase: 'OBJECTION', topic: 'price', question: `What is NEPQ built on?`, optionA: `Pushing hard until the customer says yes`, optionB: `Asking curious, empathetic questions so the customer reaches their own conclusion`, optionC: `Always being the lowest price in the room`, optionD: `Avoiding objections by talking fast`, correct: 'B', explanation: `People do not argue with their own conclusions. You ask, they realize it themselves.` },
    { phase: 'OBJECTION', topic: 'price', question: `A customer says your price is too high. What is the best first response?`, optionA: `"When you say that, what are you comparing it to?"`, optionB: `"Our quality justifies the price."`, optionC: `"I can knock some money off."`, optionD: `"Most customers say that at first."`, correct: 'A', explanation: `Find out what they are comparing to before you answer. You cannot close the gap until you know what it is.` },
    { phase: 'OBJECTION', topic: 'price', question: `What are the three steps of the NEPQ formula for addressing an objection?`, optionA: `Deny, Defend, Discount`, optionB: `Empathy, Education, Concern`, optionC: `Greet, Quote, Leave`, optionD: `Listen, Lecture, Lower the price`, correct: 'B', explanation: `Empathy, Education with evidence, then the Concern of leaving it.` },
    { phase: 'OBJECTION', topic: 'price', question: `A customer says another company quoted them less. What is the best move?`, optionA: `Tell them the other company cuts corners`, optionB: `Immediately match the lower price`, optionC: `Ask whether that quote included the same fix and warranty, or just a patch`, optionD: `Tell them you cannot compete on price`, correct: 'C', explanation: `Get them comparing apples to apples without bad-mouthing anyone or caving on price.` },
    // THINK
    { phase: 'OBJECTION', topic: 'think', question: `When a customer says "I need to think about it," what is usually really happening?`, optionA: `They need a few days to genuinely think`, optionB: `They are hesitating because something feels unsettled (cost, trust, or urgency)`, optionC: `They are about to say yes`, optionD: `They want you to lower the price`, correct: 'B', explanation: `It is a soft objection. Something is unresolved, and your job is to find out what.` },
    { phase: 'OBJECTION', topic: 'think', question: `What is the best first response to "I need to think about it"?`, optionA: `"Take all the time you need."`, optionB: `"Can I ask, what part do you feel you need to think more about?"`, optionC: `"Most people regret waiting."`, optionD: `"I'll just leave the quote."`, correct: 'B', explanation: `Ask what they are weighing. It turns a vague stall into a concern you can address.` },
    { phase: 'OBJECTION', topic: 'think', question: `Which three steps make up the NEPQ formula for addressing the hesitation?`, optionA: `Empathy, Education, Concern`, optionB: `Push, Pressure, Discount`, optionC: `Greet, Quote, Leave`, optionD: `Agree, Wait, Hope`, correct: 'A', explanation: `Empathy, then education with evidence, then the concern of waiting.` },
    { phase: 'OBJECTION', topic: 'think', question: `A customer is still hesitating after you have answered their question. What is the right move?`, optionA: `Keep pushing until they commit`, optionB: `Stay calm, offer more than one solution, and let them choose`, optionC: `Drop the price to force a decision`, optionD: `Pack up and leave without another word`, correct: 'B', explanation: `Multiple solutions lower pressure and keep them in control.` },
    { phase: 'OBJECTION', topic: 'think', question: `A customer says "I'll call you if I decide." What is the best response?`, optionA: `Offer to walk them through the differences between solutions before you go`, optionB: `Tell them people who say that rarely call`, optionC: `Just agree and leave`, optionD: `Sign them up for a solution anyway`, correct: 'A', explanation: `Equip them for the decision. It keeps the door open without pressure.` },
    // SPOUSE
    { phase: 'OBJECTION', topic: 'spouse', question: `What is the most important rule when a customer wants to talk to their spouse?`, optionA: `Convince them they can decide on their own`, optionB: `Never push back on the partner; respect the decision`, optionC: `Tell them the price goes up if they wait`, optionD: `Leave immediately`, correct: 'B', explanation: `Pushing past the spouse destroys trust. Respect it every time.` },
    { phase: 'OBJECTION', topic: 'spouse', question: `What does the spouse objection often really mean?`, optionA: `The customer is definitely not interested`, optionB: `Sometimes it's literal, but often it's "I'm not confident enough yet"`, optionC: `The price is too high`, optionD: `They want a second technician`, correct: 'B', explanation: `Sometimes real, sometimes a polite hesitation. A question tells you which.` },
    { phase: 'OBJECTION', topic: 'spouse', question: `What is a strong draw-out question for the spouse objection?`, optionA: `"Why can't you just decide now?"`, optionB: `"Out of curiosity, what questions do you think your spouse will have?"`, optionC: `"Do you usually let them make the decisions?"`, optionD: `"Can we skip that step?"`, correct: 'B', explanation: `It respects the partner and surfaces the real concern at once.` },
    { phase: 'OBJECTION', topic: 'spouse', question: `How do you best help a customer who needs to talk it over with their spouse?`, optionA: `Equip them with the reports, photos, and readings to present it`, optionB: `Tell them what to say to win the argument`, optionC: `Refuse to leave any documentation`, optionD: `Pressure them to sign before they leave the room`, correct: 'A', explanation: `Your customer becomes the presenter. Arm them with evidence they can show.` },
    { phase: 'OBJECTION', topic: 'spouse', question: `A customer says, "We always make these decisions together." Best response?`, optionA: `"Someone has to make the call eventually."`, optionB: `"Want me to send you both today's safety report so it's easy to review together?"`, optionC: `"Most couples just go with the tech's recommendation."`, optionD: `"I'll leave it with you then."`, correct: 'B', explanation: `Support how they decide and give them the tool to do it well.` },
    // QUOTES
    { phase: 'OBJECTION', topic: 'quotes', question: `When a customer wants other quotes, what are they usually really after?`, optionA: `The lowest possible price, period`, optionB: `Confidence that they are making a smart decision`, optionC: `A reason to never call you back`, optionD: `A free second inspection`, correct: 'B', explanation: `Comparison shopping is about confidence, not just price.` },
    { phase: 'OBJECTION', topic: 'quotes', question: `What is a good draw-out question for the other-quotes objection?`, optionA: `"Why don't you trust me?"`, optionB: `"When you look at other quotes, what's the most important thing you're hoping to compare?"`, optionC: `"Do you really have time for that?"`, optionD: `"Can you just decide now?"`, correct: 'B', explanation: `It surfaces what they value and points the comparison where you are strong.` },
    { phase: 'OBJECTION', topic: 'quotes', question: `What is the best way to handle a customer who wants to compare quotes?`, optionA: `Tell them the other companies are dishonest`, optionB: `Give them the scan, photos, and warranty so they compare apples to apples`, optionC: `Immediately offer the lowest price`, optionD: `Tell them not to bother`, correct: 'B', explanation: `Arm them with evidence so the comparison favors real value.` },
    { phase: 'OBJECTION', topic: 'quotes', question: `Which question makes the gap clear without pressure?`, optionA: `"If the other quote doesn't include a scan or warranty, how will you know it's solving the same problem?"`, optionB: `"Why would you go anywhere else?"`, optionC: `"Don't you think I know more than them?"`, optionD: `"Are you always this difficult?"`, correct: 'A', explanation: `A fair, curious question highlights what cheaper quotes leave out.` },
    { phase: 'OBJECTION', topic: 'quotes', question: `What should the customer end up comparing?`, optionA: `Only the bottom-line price`, optionB: `Total value: the fix, the warranty, and whether the same issue was identified`, optionC: `Which tech was friendliest`, optionD: `How fast each company can come out`, correct: 'B', explanation: `Value, not just the top number, is the honest comparison.` },
    // WAIT
    { phase: 'OBJECTION', topic: 'wait', question: `When a customer says "I want to wait," what is it usually about?`, optionA: `Genuinely just timing`, optionB: `Hesitation: fear, cost, or not seeing the urgency`, optionC: `A firm no`, optionD: `Wanting a different technician`, correct: 'B', explanation: `Waiting is rarely about the calendar. It is "I'm not convinced yet."` },
    { phase: 'OBJECTION', topic: 'wait', question: `What is a strong draw-out question for the wait objection?`, optionA: `"Why are you stalling?"`, optionB: `"When you say wait, what are you hoping will be different later on?"`, optionC: `"Don't you care about your home?"`, optionD: `"Can we just get this signed?"`, correct: 'B', explanation: `Calm and curious, it gets the real reason said out loud.` },
    { phase: 'OBJECTION', topic: 'wait', question: `How do you address a customer who wants to wait?`, optionA: `Pressure them with a deadline`, optionB: `Make the cost of waiting visible with evidence, calmly`, optionC: `Tell them they're being careless`, optionD: `Drop the price until they say yes`, correct: 'B', explanation: `Show them the risk that is already there: empathy, education, concern.` },
    { phase: 'OBJECTION', topic: 'wait', question: `What tone should you keep when handling the wait objection?`, optionA: `Urgent and firm`, optionB: `Gentle and curious, letting them decide`, optionC: `Disappointed`, optionD: `Indifferent`, correct: 'B', explanation: `Light and helpful. Make the risk visible, then let them choose.` },
    { phase: 'OBJECTION', topic: 'wait', question: `A customer says they'll wait until it fails. Best response?`, optionA: `"That's a mistake."`, optionB: `"Would it help to see the cost difference between handling it now and an emergency call when it fails?"`, optionC: `"Don't say I didn't warn you."`, optionD: `"Okay, here's my card."`, correct: 'B', explanation: `A calm question makes the cost of waiting visible and keeps them in control.` },
    // ESTIMATE
    { phase: 'OBJECTION', topic: 'estimate', question: `A customer asks for an estimate. What is the best first response?`, optionA: `"We don't give estimates."`, optionB: `"Yeah, absolutely, I can get you an estimate."`, optionC: `"Estimates aren't really our thing."`, optionD: `"I'd have to charge for that."`, correct: 'B', explanation: `Lead with yes. Refusing contradicts our own marketing and makes the tech look dishonest.` },
    { phase: 'OBJECTION', topic: 'estimate', question: `Why do we no longer say "we don't do estimates"?`, optionA: `It's too formal`, optionB: `It contradicts our marketing and is an easy out for the tech`, optionC: `Customers don't understand it`, optionD: `It takes too long to say`, correct: 'B', explanation: `Our front end promises an estimate, and the line lets the tech bail instead of working it.` },
    { phase: 'OBJECTION', topic: 'estimate', question: `What two things should you add right after agreeing to the estimate?`, optionA: `That it's firm and won't change, and that you can do the work today`, optionB: `That prices may rise and you're very busy`, optionC: `That you need a deposit and a signature`, optionD: `That other companies charge more`, correct: 'A', explanation: `A firm price plus the same-day option separates SHS from a soft quote and a vanishing contractor.` },
    { phase: 'OBJECTION', topic: 'estimate', question: `Before handing over the estimate, what should you ask?`, optionA: `"What's keeping you from getting it taken care of today?"`, optionB: `"Are you going to actually call me back?"`, optionC: `"Do you have the money for this?"`, optionD: `Nothing, just hand it over`, correct: 'A', explanation: `It surfaces the real objection hiding behind the estimate request.` },
    { phase: 'OBJECTION', topic: 'estimate', question: `What is the one rule that defines the estimate objection?`, optionA: `Always get a signature before leaving`, optionB: `Never end on the estimate; always end on a follow-up you own`, optionC: `Never give an estimate in writing`, optionD: `Always offer a discount to close`, correct: 'B', explanation: `A scheduled follow-up you control is what makes you different from every contractor who hands over a number and waits.` },
];

import { DISC_QUESTIONS } from './disc-questions';

async function main() {
    console.log('Seeding badges...');
    for (const b of BADGES) {
        await prisma.badge.upsert({
            where: { code: b.code },
            update: {},
            create: b,
        });
    }

    // Seed a demo technician if none exists
    const demoTech = await prisma.technician.upsert({
        where: { employeeId: 'DEMO-001' },
        update: {},
        create: {
            name: 'Marshall Snider',
            employeeId: 'DEMO-001',
            avatar: 'MS',
            startDate: new Date(),
            isActive: true,
            currentStreak: 0,
        },
    });
    console.log('Demo tech ensured:', demoTech.name);

    // Seed quiz questions
    console.log('Seeding quiz questions...');
    const existingCount = await prisma.quizQuestion.count();
    if (existingCount === 0) {
        await prisma.quizQuestion.createMany({
            data: QUIZ_QUESTIONS,
        });
        console.log(`Seeded ${QUIZ_QUESTIONS.length} quiz questions.`);
    } else {
        console.log(`Quiz questions already exist (${existingCount}), skipping.`);
    }

    // Seed objection (Sales) questions, independent of the PACE skip logic above
    console.log('Seeding objection questions...');
    const objCount = await prisma.quizQuestion.count({ where: { phase: 'OBJECTION' } });
    if (objCount === 0) {
        await prisma.quizQuestion.createMany({
            data: OBJECTION_QUESTIONS,
        });
        console.log(`Seeded ${OBJECTION_QUESTIONS.length} objection questions.`);
    } else {
        console.log(`Objection questions already exist (${objCount}), skipping.`);
    }

    // Seed DISC questions, additive only: INSERT when none exist, never delete/reset
    console.log('Seeding DISC questions...');
    const discCount = await prisma.quizQuestion.count({ where: { phase: 'DISC' } });
    if (discCount === 0) {
        await prisma.quizQuestion.createMany({
            data: DISC_QUESTIONS,
        });
        console.log(`Seeded ${DISC_QUESTIONS.length} DISC questions.`);
    } else {
        console.log(`DISC questions already exist (${discCount}), skipping.`);
    }

    // Seed phase mastery rows for all active technicians
    console.log('Seeding phase mastery rows...');
    const techs = await prisma.technician.findMany({ where: { isActive: true } });
    const phases = ['PREPARE', 'ARRIVE', 'CONNECT', 'EXECUTE'];
    for (const tech of techs) {
        for (const phase of phases) {
            await prisma.phaseMastery.upsert({
                where: {
                    technicianId_phase: {
                        technicianId: tech.id,
                        phase,
                    },
                },
                update: {},
                create: {
                    technicianId: tech.id,
                    phase,
                },
            });
        }
    }
    console.log(`Phase mastery rows seeded for ${techs.length} technicians.`);

    console.log('Seed complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

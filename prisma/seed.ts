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

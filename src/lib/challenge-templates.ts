import { ChallengeTemplate } from "./types";

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: "7-day-hustle",
    name: "7 Day Hustle",
    dayCount: 7,
    suggestedCategories: ["Quick Start", "Sprint", "Focus"],
    description: "One week intensive focus on a specific goal",
    defaultTitle: "7 Day Hustle",
    defaultDescription: "A 7-day sprint to build momentum and breakthrough barriers on your most important goal.",
    defaultStartDate: new Date().toISOString().split('T')[0],
    motivationalStatement: {
      title: "7 Day Hustle",
      statement: "I'm committing to 7 days of focused, intensive work on my most important goal. This sprint will cut through distractions, build unstoppable momentum, and prove to myself that I can achieve anything when I channel my energy with laser focus. Every day I show up is evidence of my commitment to growth.",
      why: "Sometimes breakthrough requires intensity. I need this focused sprint to break through barriers, overcome perfectionism, and build unshakeable confidence in my ability to execute. This hustle will create a new baseline for what I believe is possible in my life.",
      collaboration: "I won't hustle in isolation. I'll share my daily progress with my accountability partner, celebrate small wins with my support network, and ask for specific help when I hit obstacles. My success depends on staying connected while I push forward."
    },
    rewards: [
      {
        title: "Momentum reward",
        value: "Day 3",
        description: "Special coffee or tea treat to celebrate breaking through the initial resistance and establishing momentum",
        status: "Planned"
      },
      {
        title: "Progress celebration",
        value: "Day 5",
        description: "Mid-sprint reward: favorite meal or small purchase to acknowledge sustained effort",
        status: "Planned"
      },
      {
        title: "Sprint completion",
        value: "Day 7",
        description: "Victory celebration: nice dinner or meaningful experience to honor completing the full 7-day hustle",
        status: "Planned"
      }
    ]
  },
  {
    id: "30-day-habit-builder",
    name: "30 Day Habit Builder",
    dayCount: 30,
    suggestedCategories: ["Habit Formation", "Consistency", "Daily Practice"],
    description: "Build a new habit or break an old one over 30 days",
    defaultTitle: "30 Day Habit Builder",
    defaultDescription: "A 30-day commitment to consistent daily action that builds lasting habits and transforms your life.",
    defaultStartDate: new Date().toISOString().split('T')[0],
    motivationalStatement: {
      title: "30 Day Habit Builder",
      statement: "I'm committing to 30 days of consistent daily action to build a habit that will transform my life. I understand that excellence is not an act but a habit, and these 30 days are my investment in becoming the person I want to be. Every single day I show up, I'm rewiring my brain and strengthening my character. Small daily actions compound into extraordinary results.",
      why: "Habits are the invisible architecture of my life. They determine my outcomes more than my intentions ever will. By committing to 30 days of consistent action, I'm building the neural pathways for long-term success and creating the foundation for the person I'm becoming. This challenge is how I take control of my automatic behaviors.",
      collaboration: "I won't build this habit alone. I'll track my progress daily, share weekly updates with my support network, and invite accountability from people who care about my growth. I'll also celebrate small wins with others and lean on my community when motivation wavers."
    },
    rewards: [
      {
        title: "Foundation reward",
        value: "Week 1",
        description: "Small meaningful reward to celebrate establishing the foundation and completing 7 consecutive days",
        status: "Planned"
      },
      {
        title: "Momentum milestone",
        value: "Week 2",
        description: "Mid-challenge celebration: favorite activity or purchase to honor crossing the halfway point with consistency",
        status: "Planned"
      },
      {
        title: "Strength marker",
        value: "Week 3",
        description: "Recognition reward for pushing through the challenging middle phase and proving commitment",
        status: "Planned"
      },
      {
        title: "Habit mastery",
        value: "Day 30",
        description: "Major celebration for completing the full 30-day transformation: special experience or significant reward",
        status: "Planned"
      }
    ]
  },
  {
    id: "100-day-challenge",
    name: "100 Day Challenge",
    dayCount: 100,
    suggestedCategories: ["Long-term", "Transformation", "Mastery"],
    description: "Deep transformation over 100 days of consistent effort",
    defaultTitle: "100 Day Challenge",
    defaultDescription: "A 100-day journey of deep transformation through consistent daily effort and unwavering commitment.",
    defaultStartDate: new Date().toISOString().split('T')[0],
    motivationalStatement: {
      title: "100 Day Challenge",
      statement: "I'm committing to 100 days of focused, intentional effort to achieve a major life transformation. This is not just a challenge—it's a proving ground for my character, discipline, and capability. Over these 100 days, I will show up consistently, push through resistance, and emerge as a fundamentally different person. This challenge will demonstrate that I can accomplish anything I set my mind to with sustained effort.",
      why: "100 days is the perfect balance: long enough to see profound transformation and build unshakeable discipline, yet short enough to maintain focus and momentum. I'm ready to prove to myself that I can commit to something meaningful and see it through to completion. This challenge will become the foundation for everything I build afterward.",
      collaboration: "I recognize that transformation happens in community, not isolation. I'll share my journey regularly with my support network, seek guidance from mentors, and offer encouragement to others on their own growth paths. I'll document my progress, celebrate milestones with people who matter to me, and ask for help when I need it most."
    },
    rewards: [
      {
        title: "Quarter milestone foundation",
        value: "Day 25",
        description: "Meaningful reward to celebrate establishing the foundation and completing the first 25% of this transformation journey",
        status: "Planned"
      },
      {
        title: "Halfway transformation",
        value: "Day 50",
        description: "Significant celebration for reaching the halfway point: special experience or substantial reward to honor sustained commitment",
        status: "Planned"
      },
      {
        title: "Three-quarter mastery",
        value: "Day 75",
        description: "Recognition reward for pushing through the challenging middle phase and proving your commitment to long-term growth",
        status: "Planned"
      },
      {
        title: "Complete transformation",
        value: "Day 100",
        description: "Ultimate celebration for completing the full 100-day transformation: major reward or life-changing experience to honor this achievement",
        status: "Planned"
      }
    ]
  },
  {
    id: "100k-euro-challenge",
    name: "€100,000 Challenge",
    dayCount: 365,
    suggestedCategories: ["Business", "Revenue", "Growth"],
    description: "Build towards €100,000 in revenue or value creation over one year",
    isDefault: true,
    defaultTitle: "€100,000 Challenge",
    defaultDescription: "A 365 day challenge to support financial security and creative freedom.",
    defaultStartDate: "2025-09-01",
    motivationalStatement: {
      title: "€100,000 Challenge",
      statement: "I've earned six figures before. I've built versatile skills across filmmaking (directing, writing, producing, editing, color grading), performance(acting, voice work, dance), and teaching (dance and acting). I've expanded my knowledge by deepening my financial literacy so I can tell money stories with empathy and clarity. This challenge is how I restore financial peace and turn my craft into a steady engine. I will show up every day, do the next right small thing, and let compounding do the rest.",
      why: "I want to provide stability for my family. I want to regain sovereignty over my income. This challenge commits me to a disciplined, measured practice that channels my ideas, knowledge, skills, and experience into stored energy—allocated across multiple stores of value—to provide for our present needs and our future selves.",
      collaboration: "I won't do this alone. I will deliberately partner with complementary people—producers, editors, teachers, mentors, and clients—and treat modern AI systems as teammates and force multipliers. I'll ask for help early, trade value, and share upside."
    },
    rewards: [
      {
        title: "e-ink tablet",
        value: "€10,000", 
        description: "e-ink tablet (for the family; cap €400–€600)",
        status: "Planned"
      },
      {
        title: "$1,000 face 10-year U.S. Treasury",
        value: "€20,000",
        description: "buy $1,000 face 10-year U.S. Treasury (then every +€7,250 thereafter, repeat until $11,000 total)",
        status: "Planned"
      },
      {
        title: "1 oz Gold",
        value: "€50,000",
        description: "1 oz Gold —2014 Mexican Libertad",
        status: "Planned"
      },
      {
        title: "16-day family trip to Tenerife",
        value: "€100,000",
        description: "16-day family trip to Tenerife",
        status: "Planned"
      }
    ]
  }
];
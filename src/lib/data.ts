/* ─── Dummy data store for the entire platform ─── */

// ─── Types ───
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials
  role: "subscriber" | "admin";
  subscription: {
    plan: "monthly" | "yearly";
    status: "active" | "inactive" | "lapsed";
    renewalDate: string;
    startDate: string;
    price: number;
  };
  charityId: string;
  charityPercentage: number; // minimum 10
  scores: Score[];
  winnings: Winning[];
}

export interface Score {
  id: string;
  value: number; // 1-45 Stableford
  date: string; // ISO date
}

export interface Charity {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  raised: number;
  supporters: number;
  featured: boolean;
  image: string; // emoji for demo
  events: CharityEvent[];
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface DrawResult {
  id: string;
  month: string;
  date: string;
  drawnNumbers: number[];
  status: "published" | "pending" | "simulated";
  prizePool: {
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
  winners: {
    userId: string;
    matchType: 3 | 4 | 5;
    prize: number;
    paymentStatus: "pending" | "paid";
    verified: boolean;
    proofUploaded: boolean;
  }[];
}

export interface Winning {
  drawId: string;
  matchType: 3 | 4 | 5;
  prize: number;
  paymentStatus: "pending" | "paid";
}

export interface Notification {
  id: string;
  type: "draw" | "winner" | "subscription" | "charity" | "system";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// ─── Dummy Charities ───
export const charities: Charity[] = [
  {
    id: "ch1",
    name: "Youth Shelter Network",
    category: "Homelessness",
    description:
      "Providing safe spaces and support for young people facing homelessness across the UK.",
    longDescription:
      "Youth Shelter Network has been at the forefront of tackling youth homelessness since 2015. We provide emergency accommodation, counselling services, life skills training, and job placement support to help young people aged 16-25 rebuild their lives. With shelters in 12 cities across the UK, we've helped over 4,000 young people find stable housing and employment.",
    raised: 12480,
    supporters: 342,
    featured: true,
    image: "🏠",
    events: [
      { id: "e1", title: "Charity Golf Day", date: "2026-05-15", location: "St Andrews" },
      { id: "e2", title: "Fundraising Gala", date: "2026-06-20", location: "London" },
    ],
  },
  {
    id: "ch2",
    name: "Green Future Trust",
    category: "Environment",
    description:
      "Planting trees, restoring habitats, and educating communities about sustainable living.",
    longDescription:
      "Green Future Trust is dedicated to environmental conservation through active reforestation, habitat restoration, and community education programmes. Since our founding in 2018, we've planted over 500,000 trees, restored 2,000 acres of natural habitat, and educated 50,000 students about sustainability. Our golf-course ecology programme also helps courses become certified wildlife habitats.",
    raised: 9210,
    supporters: 218,
    featured: false,
    image: "🌱",
    events: [
      { id: "e3", title: "Tree Planting Day", date: "2026-04-22", location: "Edinburgh" },
    ],
  },
  {
    id: "ch3",
    name: "Hope & Play Foundation",
    category: "Children",
    description:
      "Bringing play, sport, and joy to children in underserved communities through organised events.",
    longDescription:
      "Hope & Play Foundation believes every child deserves the chance to play. We organise sports days, provide equipment, and run after-school programmes in underserved communities across England, Scotland, and Wales. Our junior golf initiative has introduced over 3,000 children to the sport, with many going on to join local clubs and compete at regional levels.",
    raised: 15600,
    supporters: 467,
    featured: true,
    image: "⛳",
    events: [
      { id: "e4", title: "Junior Golf Tournament", date: "2026-07-10", location: "Manchester" },
      { id: "e5", title: "Sports Day Festival", date: "2026-08-05", location: "Cardiff" },
    ],
  },
  {
    id: "ch4",
    name: "Mind Matters UK",
    category: "Mental Health",
    description:
      "Offering free counselling, helplines, and peer-support groups for adults experiencing anxiety and depression.",
    longDescription:
      "Mind Matters UK provides free and accessible mental health support to adults across the United Kingdom. Our services include 24/7 helplines, online counselling, peer-support groups, and workplace wellbeing programmes. We also run 'Golf & Wellbeing' sessions that combine gentle exercise with therapeutic conversation in the open air.",
    raised: 8340,
    supporters: 195,
    featured: false,
    image: "💚",
    events: [
      { id: "e6", title: "Wellbeing Walk", date: "2026-05-30", location: "Birmingham" },
    ],
  },
  {
    id: "ch5",
    name: "Golf for Good",
    category: "Sport & Inclusion",
    description:
      "Making golf accessible to disabled and disadvantaged communities through free coaching and equipment loans.",
    longDescription:
      "Golf for Good is on a mission to make golf truly inclusive. We provide free coaching, adaptive equipment, and sponsored memberships to disabled and disadvantaged individuals. Our adaptive golf programme serves 1,200 participants annually across 30 partner courses. We believe the mental and physical benefits of golf should be available to everyone, regardless of ability or background.",
    raised: 6720,
    supporters: 134,
    featured: true,
    image: "🏌️",
    events: [
      { id: "e7", title: "Inclusive Golf Open", date: "2026-06-15", location: "Glasgow" },
      { id: "e8", title: "Equipment Drive", date: "2026-04-10", location: "Bristol" },
    ],
  },
  {
    id: "ch6",
    name: "Ocean Guardians",
    category: "Environment",
    description:
      "Protecting marine ecosystems through cleanup operations, research, and coastal conservation projects.",
    longDescription:
      "Ocean Guardians works to protect our marine environment through coastal cleanup operations, marine research, and conservation advocacy. We organise over 200 beach cleanups annually, removing an estimated 50 tonnes of waste from UK coastlines. Our educational programmes reach 20,000 students each year, inspiring the next generation of ocean protectors.",
    raised: 4850,
    supporters: 98,
    featured: false,
    image: "🌊",
    events: [
      { id: "e9", title: "Beach Cleanup Day", date: "2026-05-01", location: "Cornwall" },
    ],
  },
];

// ─── Dummy Users ───
export const users: User[] = [
  {
    id: "u1",
    name: "James Watson",
    email: "james@example.com",
    avatar: "JW",
    role: "subscriber",
    subscription: {
      plan: "monthly",
      status: "active",
      renewalDate: "2026-04-15",
      startDate: "2025-06-15",
      price: 9.99,
    },
    charityId: "ch1",
    charityPercentage: 15,
    scores: [
      { id: "s1", value: 38, date: "2026-03-20" },
      { id: "s2", value: 32, date: "2026-03-12" },
      { id: "s3", value: 41, date: "2026-02-28" },
      { id: "s4", value: 29, date: "2026-02-15" },
      { id: "s5", value: 35, date: "2026-01-30" },
    ],
    winnings: [
      { drawId: "d2", matchType: 3, prize: 45, paymentStatus: "paid" },
      { drawId: "d3", matchType: 4, prize: 184, paymentStatus: "pending" },
    ],
  },
  {
    id: "u2",
    name: "Sarah Langley",
    email: "sarah@example.com",
    avatar: "SL",
    role: "subscriber",
    subscription: {
      plan: "yearly",
      status: "active",
      renewalDate: "2027-01-10",
      startDate: "2026-01-10",
      price: 89.99,
    },
    charityId: "ch3",
    charityPercentage: 20,
    scores: [
      { id: "s6", value: 42, date: "2026-03-18" },
      { id: "s7", value: 36, date: "2026-03-05" },
      { id: "s8", value: 28, date: "2026-02-20" },
      { id: "s9", value: 33, date: "2026-02-01" },
      { id: "s10", value: 39, date: "2026-01-15" },
    ],
    winnings: [
      { drawId: "d1", matchType: 3, prize: 52, paymentStatus: "paid" },
    ],
  },
  {
    id: "u3",
    name: "Mike Turner",
    email: "mike@example.com",
    avatar: "MT",
    role: "subscriber",
    subscription: {
      plan: "monthly",
      status: "lapsed",
      renewalDate: "2026-03-01",
      startDate: "2025-09-01",
      price: 9.99,
    },
    charityId: "ch2",
    charityPercentage: 10,
    scores: [
      { id: "s11", value: 25, date: "2026-02-10" },
      { id: "s12", value: 31, date: "2026-01-22" },
      { id: "s13", value: 37, date: "2025-12-18" },
    ],
    winnings: [],
  },
  {
    id: "u4",
    name: "Emily Clarke",
    email: "emily@example.com",
    avatar: "EC",
    role: "subscriber",
    subscription: {
      plan: "yearly",
      status: "active",
      renewalDate: "2026-11-20",
      startDate: "2025-11-20",
      price: 89.99,
    },
    charityId: "ch5",
    charityPercentage: 12,
    scores: [
      { id: "s14", value: 44, date: "2026-03-22" },
      { id: "s15", value: 40, date: "2026-03-10" },
      { id: "s16", value: 35, date: "2026-02-25" },
      { id: "s17", value: 38, date: "2026-02-12" },
      { id: "s18", value: 30, date: "2026-01-28" },
    ],
    winnings: [
      { drawId: "d3", matchType: 5, prize: 1920, paymentStatus: "pending" },
    ],
  },
  {
    id: "u5",
    name: "Alex Rivera",
    email: "alex@example.com",
    avatar: "AR",
    role: "subscriber",
    subscription: {
      plan: "monthly",
      status: "active",
      renewalDate: "2026-04-05",
      startDate: "2025-10-05",
      price: 9.99,
    },
    charityId: "ch4",
    charityPercentage: 10,
    scores: [
      { id: "s19", value: 33, date: "2026-03-15" },
      { id: "s20", value: 27, date: "2026-03-03" },
      { id: "s21", value: 40, date: "2026-02-18" },
      { id: "s22", value: 36, date: "2026-02-02" },
      { id: "s23", value: 31, date: "2026-01-20" },
    ],
    winnings: [],
  },
];

// ─── Dummy Draws ───
export const draws: DrawResult[] = [
  {
    id: "d1",
    month: "January 2026",
    date: "2026-01-31",
    drawnNumbers: [28, 33, 39, 42, 36],
    status: "published",
    prizePool: { fiveMatch: 1920, fourMatch: 1680, threeMatch: 1200 },
    winners: [
      {
        userId: "u2",
        matchType: 3,
        prize: 52,
        paymentStatus: "paid",
        verified: true,
        proofUploaded: true,
      },
    ],
  },
  {
    id: "d2",
    month: "February 2026",
    date: "2026-02-28",
    drawnNumbers: [32, 38, 29, 41, 35],
    status: "published",
    prizePool: { fiveMatch: 1920, fourMatch: 1680, threeMatch: 1200 },
    winners: [
      {
        userId: "u1",
        matchType: 3,
        prize: 45,
        paymentStatus: "paid",
        verified: true,
        proofUploaded: true,
      },
    ],
  },
  {
    id: "d3",
    month: "March 2026",
    date: "2026-03-31",
    drawnNumbers: [44, 40, 35, 38, 30],
    status: "pending",
    prizePool: { fiveMatch: 1920, fourMatch: 1680, threeMatch: 1200 },
    winners: [
      {
        userId: "u1",
        matchType: 4,
        prize: 184,
        paymentStatus: "pending",
        verified: false,
        proofUploaded: false,
      },
      {
        userId: "u4",
        matchType: 5,
        prize: 1920,
        paymentStatus: "pending",
        verified: false,
        proofUploaded: false,
      },
    ],
  },
];

// ─── Platform Stats ───
export const platformStats = {
  totalUsers: 1247,
  activeSubscribers: 1089,
  totalPrizePool: 4820,
  totalCharityContributions: 52310,
  monthlyRevenue: 10891,
  monthlyPlanPrice: 9.99,
  yearlyPlanPrice: 89.99,
};

// ─── Notifications (for demo) ───
export const notifications: Notification[] = [
  {
    id: "n1",
    type: "draw",
    title: "April Draw Coming Soon",
    message: "The April 2026 draw will take place on April 30th. Make sure your scores are up to date!",
    date: "2026-03-24",
    read: false,
  },
  {
    id: "n2",
    type: "winner",
    title: "March Draw — You Matched 4!",
    message: "Congratulations! You matched 4 numbers in the March draw and won £184. Upload your proof to claim.",
    date: "2026-03-31",
    read: false,
  },
  {
    id: "n3",
    type: "subscription",
    title: "Subscription Renewed",
    message: "Your monthly subscription has been renewed. £9.99 charged to your payment method.",
    date: "2026-03-15",
    read: true,
  },
  {
    id: "n4",
    type: "charity",
    title: "Youth Shelter Network Update",
    message: "Your chosen charity just reached £12,000 in total donations from Softly Golf members!",
    date: "2026-03-10",
    read: true,
  },
];

// ─── Prize Pool Distribution Constants ───
export const PRIZE_DISTRIBUTION = {
  fiveMatch: 0.4,   // 40%
  fourMatch: 0.35,  // 35%
  threeMatch: 0.25, // 25%
} as const;

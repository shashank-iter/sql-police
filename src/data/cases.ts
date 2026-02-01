/* ───────────────────────────────────────────
   CASE DATA  —  Static, serialisable definitions.
   No functions live here — everything in this file
   is safe to pass from a server component to a
   client component as a prop.

   Validation logic lives in src/data/validators.ts
   (a "use client" module, never serialised).
   ─────────────────────────────────────────── */

// ── Types ────────────────────────────────────
export interface CaseMission {
  id: string;
  title: string;
  briefing: string;
  hint: string;
  requiredColumns: string[];
  minRows: number;
  points: number;
}

export interface CaseData {
  id: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: number;
  totalPoints: number;
  storyIntro: string;
  schema: string;
  seedData: string;
  missions: CaseMission[];
  victoryMessage: string;
}

// ─────────────────────────────────────────────
// CASE 001  —  "The Midnight Theft at Harrington Manor"
// ─────────────────────────────────────────────
const case001: CaseData = {
  id: "the-midnight-theft",
  title: "The Midnight Theft",
  summary:
    "A priceless diamond vanished from Harrington Manor at midnight. Five suspects, one locked room — and a database full of clues.",
  difficulty: "Rookie",
  estimatedMinutes: 20,
  totalPoints: 500,

  storyIntro: `
It's 2:47 AM when the call comes in.

Harrington Manor — the oldest estate in the district — has been robbed.
The "Celestine Diamond," valued at $4.2 million, was stolen from the
locked study between 11:00 PM and 1:00 AM.

Lord Harrington hosted an evening gala. Five guests were present.
Security logged everyone's movements, and the household staff recorded
access events. The manor's smart-lock system kept a detailed trail.

Your job: interrogate the database. Find the thief.

The evidence has already been loaded into the system.
Work through each objective to build your case.
  `.trim(),

  schema: `
CREATE TABLE guests (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  relation    TEXT,
  arrival_time TEXT,
  departure_time TEXT
);

CREATE TABLE access_log (
  id          INTEGER PRIMARY KEY,
  guest_id    INTEGER NOT NULL,
  room        TEXT    NOT NULL,
  entered_at  TEXT    NOT NULL,
  exited_at   TEXT,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);

CREATE TABLE staff (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  on_duty_from TEXT   NOT NULL,
  on_duty_to   TEXT   NOT NULL
);

CREATE TABLE items (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  location    TEXT    NOT NULL,
  value_usd   REAL,
  stolen      INTEGER NOT NULL DEFAULT 0
);
  `.trim(),

  seedData: `
INSERT INTO guests VALUES (1, 'Victoria Ashworth',  'Sister',            '18:30', '23:45');
INSERT INTO guests VALUES (2, 'Marcus Thorne',      'Business Partner',  '18:45', NULL);
INSERT INTO guests VALUES (3, 'Elaine Dufresne',    'Neighbour',         '19:00', '00:30');
INSERT INTO guests VALUES (4, 'David Calloway',     'Old College Friend','19:15', NULL);
INSERT INTO guests VALUES (5, 'Priya Mehta',        'Art Advisor',       '18:50', '23:50');

INSERT INTO access_log VALUES ( 1,  1, 'Ballroom', '19:00', '22:30');
INSERT INTO access_log VALUES ( 2,  1, 'Kitchen',  '22:35', '22:50');
INSERT INTO access_log VALUES ( 3,  1, 'Study',    '22:55', '23:40');
INSERT INTO access_log VALUES ( 4,  2, 'Ballroom', '19:00', '21:00');
INSERT INTO access_log VALUES ( 5,  2, 'Library',  '21:05', '22:00');
INSERT INTO access_log VALUES ( 6,  2, 'Study',    '22:10', '22:40');
INSERT INTO access_log VALUES ( 7,  2, 'Ballroom', '22:45', '00:15');
INSERT INTO access_log VALUES ( 8,  2, 'Study',    '00:20', '00:55');
INSERT INTO access_log VALUES ( 9,  3, 'Ballroom', '19:00', '23:00');
INSERT INTO access_log VALUES (10,  3, 'Kitchen',  '23:05', '00:25');
INSERT INTO access_log VALUES (11,  4, 'Ballroom', '19:00', '20:30');
INSERT INTO access_log VALUES (12,  4, 'Garden',   '20:35', '22:50');
INSERT INTO access_log VALUES (13,  4, 'Library',  '01:10', '01:45');
INSERT INTO access_log VALUES (14,  5, 'Ballroom', '19:00', '23:00');
INSERT INTO access_log VALUES (15,  5, 'Garden',   '23:05', '23:45');

INSERT INTO staff VALUES (1, 'Edmund (Butler)',   'Butler',   '17:00', '03:00');
INSERT INTO staff VALUES (2, 'Rosa (Cook)',       'Cook',     '15:00', '23:00');
INSERT INTO staff VALUES (3, 'George (Gardener)', 'Gardener', '06:00', '21:00');

INSERT INTO items VALUES (1, 'Celestine Diamond',        'Study',    4200000, 1);
INSERT INTO items VALUES (2, 'Harrington Signet Ring',   'Study',      85000, 0);
INSERT INTO items VALUES (3, 'Ming Vase',                'Library',   320000, 0);
INSERT INTO items VALUES (4, 'Impressionist Painting',   'Ballroom',  750000, 0);
  `.trim(),

  missions: [
    {
      id: "identify-stolen",
      title: "Identify the Stolen Item",
      briefing:
        "The first step in any investigation: confirm exactly what was taken. Query the items table to find every item that has been marked as stolen.",
      hint: "Look at the `stolen` column. A value of 1 means the item is missing.",
      requiredColumns: ["name", "location", "value_usd"],
      minRows: 1,
      points: 50,
    },
    {
      id: "study-access",
      title: "Who Entered the Study?",
      briefing:
        "The diamond was in the Study. Cross-reference the access_log with the guests table to find every person who entered the Study, along with the times they were there.",
      hint: "JOIN access_log with guests on guest_id = id, then filter where room = 'Study'.",
      requiredColumns: ["name", "entered_at", "exited_at"],
      minRows: 1,
      points: 100,
    },
    {
      id: "midnight-window",
      title: "The Midnight Window",
      briefing:
        "The theft occurred between 23:00 and 01:00. Find every guest who was in the Study during that window. Be careful: times wrap around midnight — '00:20' is AFTER '23:00' in real life, but SQLite compares these as plain strings, so '00:20' sorts BEFORE '23:00'. You need to account for that wrap.",
      hint: "A time is inside the 23:00–01:00 window if it is >= '23:00' OR <= '01:00'. Apply that to both columns: (entered_at >= '23:00' OR entered_at <= '01:00') AND (exited_at IS NULL OR exited_at >= '23:00' OR exited_at <= '01:00'). JOIN with guests and filter room = 'Study'.",
      requiredColumns: ["name", "entered_at"],
      minRows: 1,
      points: 150,
    },
    {
      id: "motive-check",
      title: "Establish Motive",
      briefing:
        "Not everyone has reason to steal. Marcus is Lord Harrington's Business Partner — that's motive. But let's be thorough: list all guests who were still on the premises past midnight (departure_time IS NULL or > '00:00') along with their relationship to Harrington.",
      hint: "Select name, relation, departure_time from guests where departure_time IS NULL OR departure_time > '00:00'.",
      requiredColumns: ["name", "relation"],
      minRows: 1,
      points: 100,
    },
    {
      id: "final-verdict",
      title: "Final Verdict — Name the Culprit",
      briefing: `The evidence points to one person. Write a query that combines everything:
  • The suspect must have accessed the Study during the theft window (23:00–01:00). Remember the midnight wrap from the previous objective.
  • The suspect must still have been on the premises (departure_time IS NULL or after 01:00).
  • Return their name, relation, and the time(s) they were in the Study.

Who stole the Celestine Diamond?`,
      hint: "JOIN guests with access_log. room = 'Study'. For the time window: (entered_at >= '23:00' OR entered_at <= '01:00') AND (exited_at IS NULL OR exited_at >= '23:00' OR exited_at <= '01:00'). Then AND (departure_time IS NULL OR departure_time > '01:00'). The answer is one person.",
      requiredColumns: ["name"],
      minRows: 1,
      points: 100,
    },
  ],

  victoryMessage: `
🏆  CASE CLOSED  🏆

Marcus Thorne — Lord Harrington's business partner — is the culprit.

He attended the gala casually, left the Ballroom at 00:15,
re-entered the Study at 00:20 (when the hall was nearly empty),
and exited at 00:55 with the Celestine Diamond.

He never left the manor — likely waiting for a window to smuggle
the gem out at dawn.

Motive: a failed business deal worth millions. The diamond was
his "insurance policy."

Excellent detective work. The district thanks you.
  `.trim(),
};

// ─── Future cases (stubs) ─────────────────────
const case002: CaseData = {
  id: "the-vanishing-heir",
  title: "The Vanishing Heir",
  summary:
    "Lord Pemberton's eldest son disappeared three days before inheriting the estate. The family secrets are buried deep in the records.",
  difficulty: "Detective",
  estimatedMinutes: 35,
  totalPoints: 900,
  storyIntro: "Coming soon…",
  schema: "",
  seedData: "",
  missions: [],
  victoryMessage: "",
};

const case003: CaseData = {
  id: "poison-at-parliament",
  title: "Poison at Parliament",
  summary:
    "A senator collapsed during a state dinner. Toxicology points to something deliberate. Dozens of suspects, complex supply chains — and a ticking clock.",
  difficulty: "Inspector",
  estimatedMinutes: 60,
  totalPoints: 1500,
  storyIntro: "Coming soon…",
  schema: "",
  seedData: "",
  missions: [],
  victoryMessage: "",
};

// ─── Exports ──────────────────────────────────
export const cases: CaseData[] = [case001, case002, case003];

export function getCaseById(id: string): CaseData | undefined {
  return cases.find((c) => c.id === id);
}

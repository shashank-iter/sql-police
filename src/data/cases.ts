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

// ─────────────────────────────────────────────
// CASE 002  —  "The Vanishing Heir"
// ─────────────────────────────────────────────
const case002: CaseData = {
  id: "the-vanishing-heir",
  title: "The Vanishing Heir",
  summary:
    "Lord Pemberton's eldest son disappeared three days before inheriting the estate. The family secrets are buried deep in the records.",
  difficulty: "Detective",
  estimatedMinutes: 35,
  totalPoints: 900,

  storyIntro: `
Lord Pemberton — patriarch of one of Britain's oldest estates — died
suddenly on March 15th. His will stipulated that the entire fortune
would pass to his eldest son, Edmund Pemberton, on March 18th.

Edmund never showed up to claim his inheritance.

On March 21st, a groundskeeper found Edmund's car abandoned at the edge
of the estate forest, doors open, keys in the ignition. No body. No note.
No trace.

The estate lawyer has frozen the inheritance pending an investigation.
Four other heirs stand to gain if Edmund is declared legally dead: his
younger brother Marcus, his two sisters (Victoria and Elaine), and his
estranged cousin, David.

Your task: interrogate the financial records, the family tree, and the
timeline of events. Find out what happened to Edmund — and who benefits most.
  `.trim(),

  schema: `
CREATE TABLE heirs (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  relation    TEXT    NOT NULL,
  birth_year  INTEGER,
  inheritance_share REAL  -- percentage if Edmund is removed
);

CREATE TABLE financial_records (
  id          INTEGER PRIMARY KEY,
  heir_id     INTEGER NOT NULL,
  account_type TEXT   NOT NULL,  -- 'checking', 'savings', 'investment', 'debt'
  balance     REAL    NOT NULL,  -- negative for debts
  last_updated TEXT   NOT NULL,  -- YYYY-MM-DD
  FOREIGN KEY (heir_id) REFERENCES heirs(id)
);

CREATE TABLE communications (
  id          INTEGER PRIMARY KEY,
  sender_id   INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  sent_date   TEXT    NOT NULL,  -- YYYY-MM-DD
  subject     TEXT    NOT NULL,
  FOREIGN KEY (sender_id) REFERENCES heirs(id),
  FOREIGN KEY (recipient_id) REFERENCES heirs(id)
);

CREATE TABLE sightings (
  id          INTEGER PRIMARY KEY,
  person_id   INTEGER NOT NULL,
  location    TEXT    NOT NULL,
  sighted_date TEXT   NOT NULL,  -- YYYY-MM-DD
  witness     TEXT    NOT NULL,
  FOREIGN KEY (person_id) REFERENCES heirs(id)
);
  `.trim(),

  seedData: `
-- Edmund is id=1, the vanished heir
INSERT INTO heirs VALUES (1, 'Edmund Pemberton',  'Eldest Son',   1985, 0);
INSERT INTO heirs VALUES (2, 'Marcus Pemberton',  'Younger Son',  1988, 40);
INSERT INTO heirs VALUES (3, 'Victoria Ashford',  'Eldest Daughter', 1983, 25);
INSERT INTO heirs VALUES (4, 'Elaine Calloway',   'Younger Daughter', 1990, 25);
INSERT INTO heirs VALUES (5, 'David Pemberton',   'Cousin',       1982, 10);

-- Financial records — who's desperate?
INSERT INTO financial_records VALUES (1, 1, 'checking',    125000, '2024-03-10');
INSERT INTO financial_records VALUES (2, 1, 'investment',  850000, '2024-03-10');
INSERT INTO financial_records VALUES (3, 2, 'checking',     12000, '2024-03-12');
INSERT INTO financial_records VALUES (4, 2, 'debt',       -320000, '2024-03-12');  -- Marcus owes 320k
INSERT INTO financial_records VALUES (5, 2, 'savings',      45000, '2024-03-12');
INSERT INTO financial_records VALUES (6, 3, 'checking',    180000, '2024-03-14');
INSERT INTO financial_records VALUES (7, 3, 'investment',  620000, '2024-03-14');
INSERT INTO financial_records VALUES (8, 4, 'checking',     85000, '2024-03-13');
INSERT INTO financial_records VALUES (9, 4, 'debt',        -95000, '2024-03-13');
INSERT INTO financial_records VALUES (10, 5, 'checking',    15000, '2024-03-11');
INSERT INTO financial_records VALUES (11, 5, 'debt',      -480000, '2024-03-11');  -- David owes 480k

-- Communications — who was in contact with Edmund before he vanished?
INSERT INTO communications VALUES (1, 2, 1, '2024-03-12', 'About the inheritance');
INSERT INTO communications VALUES (2, 5, 1, '2024-03-13', 'Urgent: need to talk');
INSERT INTO communications VALUES (3, 1, 3, '2024-03-14', 'Family dinner plans');
INSERT INTO communications VALUES (4, 5, 1, '2024-03-15', 'Meet me at the estate tonight');
INSERT INTO communications VALUES (5, 2, 5, '2024-03-16', 'Did you see Edmund?');
INSERT INTO communications VALUES (6, 4, 1, '2024-03-10', 'Congratulations on the inheritance');

-- Sightings — who was seen where, and when?
INSERT INTO sightings VALUES (1, 1, 'Estate Main House',  '2024-03-15', 'Butler');
INSERT INTO sightings VALUES (2, 1, 'Estate Forest Edge', '2024-03-15', 'Groundskeeper');
INSERT INTO sightings VALUES (3, 5, 'Estate Forest Edge', '2024-03-15', 'Groundskeeper');
INSERT INTO sightings VALUES (4, 2, 'London',             '2024-03-15', 'Hotel Staff');
INSERT INTO sightings VALUES (5, 5, 'Estate Main House',  '2024-03-16', 'Cook');
INSERT INTO sightings VALUES (6, 3, 'Estate Main House',  '2024-03-17', 'Lawyer');
  `.trim(),

  missions: [
    {
      id: "identify-heirs",
      title: "Identify the Heirs",
      briefing:
        "Start by listing every person who stands to inherit if Edmund is removed. Show their name, relation, and inheritance share.",
      hint: "SELECT name, relation, inheritance_share FROM heirs WHERE inheritance_share > 0. Order by inheritance_share DESC to see who gains the most.",
      requiredColumns: ["name", "inheritance_share"],
      minRows: 4,
      points: 100,
    },
    {
      id: "financial-desperation",
      title: "Financial Desperation",
      briefing:
        "Money is a powerful motive. Calculate each heir's NET WORTH (sum of all their balances across all accounts, including debts as negatives). Who's in the worst financial position?",
      hint: "Use SUM() and GROUP BY. SELECT heir_id, SUM(balance) as net_worth FROM financial_records GROUP BY heir_id. JOIN with heirs to get names. Order by net_worth ASC to find who's most desperate.",
      requiredColumns: ["name", "net_worth"],
      minRows: 5,
      points: 150,
    },
    {
      id: "last-contact",
      title: "Last Contact",
      briefing:
        "Find every person who sent a message to Edmund (recipient_id = 1) in the 5 days before he vanished (March 10–15). Show the sender's name, date, and subject.",
      hint: "SELECT sender.name, c.sent_date, c.subject FROM communications c JOIN heirs sender ON c.sender_id = sender.id WHERE c.recipient_id = 1 AND c.sent_date BETWEEN '2024-03-10' AND '2024-03-15'. Order by sent_date DESC.",
      requiredColumns: ["name", "sent_date", "subject"],
      minRows: 2,
      points: 150,
    },
    {
      id: "forest-sighting",
      title: "The Forest Sighting",
      briefing:
        "Edmund's car was found at the Estate Forest Edge. Find everyone who was sighted at that exact location on March 15th (the day he vanished). Include the witness name.",
      hint: "SELECT h.name, s.sighted_date, s.witness FROM sightings s JOIN heirs h ON s.person_id = h.id WHERE s.location = 'Estate Forest Edge' AND s.sighted_date = '2024-03-15'.",
      requiredColumns: ["name", "witness"],
      minRows: 2,
      points: 200,
    },
    {
      id: "motive-matrix",
      title: "Motive Matrix",
      briefing:
        "Combine financial desperation with inheritance gain. Find heirs who: (1) have a net worth BELOW zero (in debt), AND (2) would inherit at least 10% if Edmund is gone. These are the prime suspects.",
      hint: "Use a subquery or CTE. First calculate net worth per heir (SUM balance GROUP BY heir_id). Then JOIN with heirs table and filter: net_worth < 0 AND inheritance_share >= 10.",
      requiredColumns: ["name", "net_worth", "inheritance_share"],
      minRows: 1,
      points: 200,
    },
    {
      id: "final-suspect",
      title: "Final Suspect",
      briefing: `
Put it all together. Find the ONE person who satisfies ALL conditions:
  • Net worth below zero (in debt)
  • Would inherit at least 10%
  • Sent a message to Edmund between March 13–15
  • Was sighted at Estate Forest Edge on March 15th

Return their name, net worth, inheritance share, and the date they were at the forest.
      `,
      hint: "Build a query that JOINs: (1) heirs with net_worth subquery, (2) communications (sender_id), (3) sightings (person_id). Filter on all four conditions. Only one person matches.",
      requiredColumns: ["name"],
      minRows: 1,
      points: 100,
    },
  ],

  victoryMessage: `
🏆  CASE SOLVED  🏆

David Pemberton — Edmund's cousin — orchestrated the disappearance.

Financial records show David was drowning in debt: £480,000 owed, with
only £15,000 in liquid assets. If Edmund inherited and then died or
vanished, David would claim 10% of a £12 million estate — £1.2 million.

The timeline is damning:
  • March 13: David sent Edmund "Urgent: need to talk"
  • March 15: David sent "Meet me at the estate tonight"
  • March 15, evening: Groundskeeper saw BOTH Edmund and David at the
    forest edge — where Edmund's abandoned car was later found.

David was the last person confirmed with Edmund at the exact location
of the disappearance. With motive (debt + inheritance), opportunity
(lured Edmund to the forest), and physical presence at the scene, the
case is closed.

Authorities have issued an arrest warrant.
  `.trim(),
};

// ─────────────────────────────────────────────
// CASE 003  —  "Poison at Parliament"
// ─────────────────────────────────────────────
const case003: CaseData = {
  id: "poison-at-parliament",
  title: "Poison at Parliament",
  summary:
    "A senator collapsed during a state dinner. Toxicology points to something deliberate. Dozens of suspects, complex supply chains — and a ticking clock.",
  difficulty: "Inspector",
  estimatedMinutes: 60,
  totalPoints: 1500,

  storyIntro: `
May 8th, 20:45. The annual Parliamentary State Dinner.

Senator Rebecca Harlow collapsed mid-speech, convulsing. Rushed to hospital.
Toxicology came back 6 hours later: Ricin poisoning — a lethal dose.

The source? Her wine glass. Only one glass was tainted. The killer knew
exactly which seat she'd occupy.

The catering was handled by "Sterling Events Ltd." — a company that sources
ingredients from multiple suppliers, employs a dozen staff, and has catered
Parliament events for 15 years without incident.

Your mission: trace the poisoned wine back through the supply chain.
Cross-reference staff access logs, supplier deliveries, financial transactions,
and personal vendettas. The killer is in this database. Find them before
they strike again.

Time is critical. The Prime Minister has authorized full access to all records.
  `.trim(),

  schema: `
CREATE TABLE staff (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL,  -- 'Chef', 'Server', 'Bartender', 'Manager', etc.
  hire_date   TEXT    NOT NULL,  -- YYYY-MM-DD
  security_clearance INTEGER     -- 1-5, higher = more access
);

CREATE TABLE suppliers (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  supplies    TEXT    NOT NULL,  -- what they provide
  reliability_rating REAL        -- 1.0 to 5.0
);

CREATE TABLE deliveries (
  id          INTEGER PRIMARY KEY,
  supplier_id INTEGER NOT NULL,
  item        TEXT    NOT NULL,
  delivered_datetime TEXT NOT NULL,  -- YYYY-MM-DD HH:MM
  received_by INTEGER NOT NULL,      -- staff.id
  batch_code  TEXT    NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (received_by) REFERENCES staff(id)
);

CREATE TABLE event_assignments (
  id          INTEGER PRIMARY KEY,
  staff_id    INTEGER NOT NULL,
  event_name  TEXT    NOT NULL,
  assignment  TEXT    NOT NULL,  -- specific duty
  shift_start TEXT    NOT NULL,  -- YYYY-MM-DD HH:MM
  shift_end   TEXT    NOT NULL,  -- YYYY-MM-DD HH:MM
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE TABLE financial_transactions (
  id          INTEGER PRIMARY KEY,
  staff_id    INTEGER NOT NULL,
  amount      REAL    NOT NULL,  -- negative = payment out, positive = payment in
  date        TEXT    NOT NULL,  -- YYYY-MM-DD
  description TEXT    NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE TABLE known_connections (
  id          INTEGER PRIMARY KEY,
  staff_id    INTEGER NOT NULL,
  connection_type TEXT NOT NULL,  -- 'family', 'political', 'financial'
  connected_to TEXT    NOT NULL,  -- name of external person/entity
  notes       TEXT,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
  `.trim(),

  seedData: `
-- Staff roster
INSERT INTO staff VALUES (1, 'Thomas Hargreaves', 'Head Chef',      '2010-03-12', 4);
INSERT INTO staff VALUES (2, 'Linda Morrison',    'Sous Chef',      '2015-06-01', 3);
INSERT INTO staff VALUES (3, 'Marcus Vale',       'Bartender',      '2018-11-22', 3);
INSERT INTO staff VALUES (4, 'Elena Vasquez',     'Wine Sommelier', '2012-08-15', 4);
INSERT INTO staff VALUES (5, 'Gregory Stone',     'Server',         '2020-01-10', 2);
INSERT INTO staff VALUES (6, 'Sarah Chen',        'Server',         '2019-05-18', 2);
INSERT INTO staff VALUES (7, 'David Kumar',       'Manager',        '2008-02-20', 5);
INSERT INTO staff VALUES (8, 'Rachel Owens',      'Logistics',      '2016-09-30', 3);

-- Suppliers
INSERT INTO suppliers VALUES (1, 'Bordeaux Vintners Ltd',    'Premium wines',        4.8);
INSERT INTO suppliers VALUES (2, 'Thames Valley Produce',    'Fresh vegetables',     4.5);
INSERT INTO suppliers VALUES (3, 'Coastal Seafood Imports',  'Seafood',              4.2);
INSERT INTO suppliers VALUES (4, 'Artisan Breads Co',        'Breads and pastries',  4.9);
INSERT INTO suppliers VALUES (5, 'Heritage Wine Merchants',  'Rare wines',           3.8);

-- Deliveries (May 8th, day of the event)
INSERT INTO deliveries VALUES (1, 1, 'Château Margaux 2015',  '2024-05-08 14:30', 8, 'BV-2024-MAY-001');
INSERT INTO deliveries VALUES (2, 2, 'Asparagus bundles',     '2024-05-08 10:15', 8, 'TVP-0508-A');
INSERT INTO deliveries VALUES (3, 3, 'Dover sole (12 units)', '2024-05-08 09:00', 8, 'CSI-MAY08-12');
INSERT INTO deliveries VALUES (4, 5, 'Barolo Riserva 2012',   '2024-05-08 16:45', 4, 'HWM-BAR-2012-R');  -- received by sommelier
INSERT INTO deliveries VALUES (5, 4, 'Sourdough loaves (20)', '2024-05-08 11:00', 8, 'ABC-MAY-20L');

-- Event assignments (Parliamentary Dinner, May 8th)
INSERT INTO event_assignments VALUES (1, 1, 'Parliamentary Dinner', 'Oversee kitchen',         '2024-05-08 16:00', '2024-05-08 23:00');
INSERT INTO event_assignments VALUES (2, 2, 'Parliamentary Dinner', 'Prepare mains',           '2024-05-08 16:00', '2024-05-08 22:00');
INSERT INTO event_assignments VALUES (3, 3, 'Parliamentary Dinner', 'Bar service',             '2024-05-08 18:30', '2024-05-08 23:30');
INSERT INTO event_assignments VALUES (4, 4, 'Parliamentary Dinner', 'Wine pairing & service',  '2024-05-08 18:00', '2024-05-08 22:30');
INSERT INTO event_assignments VALUES (5, 5, 'Parliamentary Dinner', 'Table service',           '2024-05-08 19:00', '2024-05-08 23:00');
INSERT INTO event_assignments VALUES (6, 6, 'Parliamentary Dinner', 'Table service',           '2024-05-08 19:00', '2024-05-08 23:00');
INSERT INTO event_assignments VALUES (7, 7, 'Parliamentary Dinner', 'Event coordination',      '2024-05-08 17:00', '2024-05-08 23:30');

-- Financial transactions (red flags?)
INSERT INTO financial_transactions VALUES (1, 1, 2500,   '2024-05-01', 'Monthly salary');
INSERT INTO financial_transactions VALUES (2, 3, 1800,   '2024-05-01', 'Monthly salary');
INSERT INTO financial_transactions VALUES (3, 4, 2200,   '2024-05-01', 'Monthly salary');
INSERT INTO financial_transactions VALUES (4, 4, -45000, '2024-04-15', 'Gambling debt payment');  -- Elena in debt
INSERT INTO financial_transactions VALUES (5, 4, 50000,  '2024-05-05', 'Anonymous deposit');      -- suspicious payment
INSERT INTO financial_transactions VALUES (6, 5, 1600,   '2024-05-01', 'Monthly salary');
INSERT INTO financial_transactions VALUES (7, 6, 1600,   '2024-05-01', 'Monthly salary');

-- Known connections (who has motive?)
INSERT INTO known_connections VALUES (1, 4, 'political', 'Senator Rebecca Harlow', 'Elena''s brother was convicted in a case prosecuted by Harlow 5 years ago');
INSERT INTO known_connections VALUES (2, 3, 'financial', 'Opposition Party Donor', 'Marcus received donations for personal projects');
INSERT INTO known_connections VALUES (3, 1, 'family',    'Chef Thomas'' nephew works at Bordeaux Vintners', 'No conflict noted');
  `.trim(),

  missions: [
    {
      id: "identify-staff",
      title: "Staff Roster",
      briefing:
        "Start by identifying everyone who worked the Parliamentary Dinner event on May 8th. List their name, role, and shift times.",
      hint: "SELECT s.name, s.role, e.shift_start, e.shift_end FROM event_assignments e JOIN staff s ON e.staff_id = s.id WHERE e.event_name = 'Parliamentary Dinner' ORDER BY e.shift_start.",
      requiredColumns: ["name", "role"],
      minRows: 7,
      points: 150,
    },
    {
      id: "wine-delivery",
      title: "Wine Deliveries",
      briefing:
        "The poison was in the wine. Find all wine deliveries that arrived on May 8th (the day of the event). Show the supplier name, item, delivery time, and who received it.",
      hint: "SELECT sup.name, d.item, d.delivered_datetime, staff.name as received_by FROM deliveries d JOIN suppliers sup ON d.supplier_id = sup.id JOIN staff ON d.received_by = staff.id WHERE d.item LIKE '%wine%' OR d.item LIKE '%Wine%' AND d.delivered_datetime LIKE '2024-05-08%'.",
      requiredColumns: ["name", "item", "received_by"],
      minRows: 2,
      points: 200,
    },
    {
      id: "sommelier-access",
      title: "Sommelier Access",
      briefing:
        "The wine sommelier has direct access to bottles and glasses. Find the sommelier's name, their security clearance level, and what wine delivery they personally received on May 8th.",
      hint: "SELECT s.name, s.security_clearance, d.item FROM staff s JOIN deliveries d ON d.received_by = s.id WHERE s.role = 'Wine Sommelier' AND d.delivered_datetime LIKE '2024-05-08%'.",
      requiredColumns: ["name", "item"],
      minRows: 1,
      points: 200,
    },
    {
      id: "suspicious-payment",
      title: "Suspicious Payment",
      briefing:
        "Follow the money. Find any staff member who received an unusually large payment (over £40,000) within 7 days before the event (May 1–8). Show their name, the amount, date, and description.",
      hint: "SELECT s.name, f.amount, f.date, f.description FROM financial_transactions f JOIN staff s ON f.staff_id = s.id WHERE f.amount > 40000 AND f.date BETWEEN '2024-05-01' AND '2024-05-08'.",
      requiredColumns: ["name", "amount"],
      minRows: 1,
      points: 250,
    },
    {
      id: "political-connection",
      title: "Political Connection",
      briefing:
        "Senator Harlow was the target. Find any staff member with a documented connection to her. Show their name, role, connection type, and the notes field.",
      hint: "SELECT s.name, s.role, k.connection_type, k.connected_to, k.notes FROM known_connections k JOIN staff s ON k.staff_id = s.id WHERE k.connected_to LIKE '%Harlow%'.",
      requiredColumns: ["name", "connection_type", "notes"],
      minRows: 1,
      points: 250,
    },
    {
      id: "debt-then-payment",
      title: "Debt, Then Payment",
      briefing:
        "Find a staff member who: (1) made a large payment OUT (negative amount, indicating debt) in April, AND (2) received a large payment IN (positive, over £40k) in early May. This suggests they were paid off.",
      hint: "Use a self-join or two subqueries on financial_transactions. Filter: one row with amount < 0 and date in April 2024, another row (same staff_id) with amount > 40000 in May 2024.",
      requiredColumns: ["name"],
      minRows: 1,
      points: 250,
    },
    {
      id: "final-culprit",
      title: "Final Culprit",
      briefing: `
Combine everything. Find the ONE person who satisfies ALL conditions:
  • Worked the Parliamentary Dinner on May 8th
  • Received a wine delivery personally on May 8th
  • Has a documented political connection to Senator Harlow
  • Received a suspicious payment over £40,000 within 7 days of the event

Return their name, role, the wine they received, and the suspicious payment amount.
      `,
      hint: "Join staff + event_assignments + deliveries + known_connections + financial_transactions. Filter on event name, wine delivery, connection to Harlow, and payment > 40000 in May 1–8.",
      requiredColumns: ["name"],
      minRows: 1,
      points: 200,
    },
  ],

  victoryMessage: `
🏆  CASE CLOSED  🏆

Elena Vasquez — the wine sommelier — poisoned Senator Harlow.

Motive: Personal vendetta. Elena's brother was convicted in a high-profile
corruption case 5 years ago. Senator Harlow was the lead prosecutor.
Elena blamed her for "ruining her family."

Opportunity: As the sommelier, Elena had exclusive access to the wine
service. She personally received the Barolo Riserva delivery at 16:45
on May 8th — 2 hours before the event. She had time and means to taint
one specific glass intended for the Senator's seat.

Financial trail: Elena made a £45,000 gambling debt payment on April 15th,
then received an "anonymous deposit" of £50,000 on May 5th — three days
before the poisoning. Someone paid her to carry out the hit.

Physical evidence: Forensics matched the ricin to a black-market supplier
linked to the same anonymous donor who funded Elena's payment. She was
the instrument; the mastermind remains at large, but Elena is in custody.

Parliament has overhauled security protocols. The investigation continues.
  `.trim(),
};

// ─── Exports ──────────────────────────────────
export const cases: CaseData[] = [case001, case002, case003];

export function getCaseById(id: string): CaseData | undefined {
  return cases.find((c) => c.id === id);
}

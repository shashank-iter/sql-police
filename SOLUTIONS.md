# SQL Detective — Complete Solutions Guide

This document contains solutions for all missions across all three cases.

---

## Case 001: The Midnight Theft

**Culprit:** Marcus Thorne  
**Total Points:** 500

### Mission 1 — Identify the Stolen Item (50 pts)

**Objective:** Find items where `stolen = 1`

```sql
SELECT name, location, value_usd, stolen
FROM items 
WHERE stolen = 1;
```

**Result:** Celestine Diamond, Study, $4.2M

---

### Mission 2 — Who Entered the Study? (100 pts)

**Objective:** JOIN guests with access_log to find Study visitors

```sql
SELECT g.name, al.entered_at, al.exited_at
FROM access_log al
JOIN guests g ON al.guest_id = g.id
WHERE al.room = 'Study';
```

**Result:** Victoria Ashworth, Marcus Thorne (twice), and implicitly David (gap in logs)

---

### Mission 3 — The Midnight Window (150 pts)

**Objective:** Find who was in Study during 23:00–01:00 (accounting for midnight wrap)

```sql
SELECT g.name, al.entered_at, al.exited_at
FROM access_log al
JOIN guests g ON al.guest_id = g.id
WHERE al.room = 'Study'
  AND (al.entered_at >= '23:00' OR al.entered_at <= '01:00')
  AND (al.exited_at IS NULL OR al.exited_at >= '23:00' OR al.exited_at <= '01:00');
```

**Key insight:** Times are TEXT strings. `'00:55' > '23:00'` is FALSE lexicographically. Use `>= '23:00' OR <= '01:00'` to catch both before-midnight and after-midnight times.

**Result:** Marcus Thorne (entered 00:20, exited 00:55)

---

### Mission 4 — Establish Motive (100 pts)

**Objective:** Find guests still on premises past midnight

```sql
SELECT name, relation, departure_time
FROM guests
WHERE departure_time IS NULL OR departure_time > '00:00';
```

**Result:** Marcus Thorne (NULL = never left), David Calloway (NULL)

---

### Mission 5 — Final Verdict (100 pts)

**Objective:** Combine: Study access during 23:00–01:00 window + never left manor

```sql
SELECT g.name, g.relation, al.entered_at, al.exited_at
FROM guests g
JOIN access_log al ON al.guest_id = g.id
WHERE al.room = 'Study'
  AND (al.entered_at >= '23:00' OR al.entered_at <= '01:00')
  AND (al.exited_at IS NULL OR al.exited_at >= '23:00' OR al.exited_at <= '01:00')
  AND (g.departure_time IS NULL OR g.departure_time > '01:00');
```

**Result:** Marcus Thorne — only person who matches all criteria

---

## Case 002: The Vanishing Heir

**Culprit:** David Pemberton  
**Total Points:** 900

### Mission 1 — Identify the Heirs (100 pts)

**Objective:** List everyone who inherits if Edmund is removed

```sql
SELECT name, relation, inheritance_share
FROM heirs
WHERE inheritance_share > 0
ORDER BY inheritance_share DESC;
```

**Result:** Marcus (40%), Victoria (25%), Elaine (25%), David (10%)

---

### Mission 2 — Financial Desperation (150 pts)

**Objective:** Calculate net worth (SUM of all balances including debts)

```sql
SELECT h.name, SUM(f.balance) as net_worth
FROM financial_records f
JOIN heirs h ON f.heir_id = h.id
GROUP BY h.id, h.name
ORDER BY net_worth ASC;
```

**Result:** David Pemberton: -£465,000 (worst position), Marcus: -£263,000

---

### Mission 3 — Last Contact (150 pts)

**Objective:** Find who messaged Edmund (id=1) March 10–15

```sql
SELECT sender.name, c.sent_date, c.subject
FROM communications c
JOIN heirs sender ON c.sender_id = sender.id
WHERE c.recipient_id = 1
  AND c.sent_date BETWEEN '2024-03-10' AND '2024-03-15'
ORDER BY c.sent_date DESC;
```

**Result:** David (March 15 & 13), Marcus (March 12), Elaine (March 10)

---

### Mission 4 — The Forest Sighting (200 pts)

**Objective:** Who was at Estate Forest Edge on March 15?

```sql
SELECT h.name, s.sighted_date, s.witness
FROM sightings s
JOIN heirs h ON s.person_id = h.id
WHERE s.location = 'Estate Forest Edge'
  AND s.sighted_date = '2024-03-15';
```

**Result:** Edmund Pemberton and David Pemberton — both sighted by Groundskeeper

---

### Mission 5 — Motive Matrix (200 pts)

**Objective:** Find heirs in debt (net worth < 0) who inherit >= 10%

```sql
SELECT h.name, SUM(f.balance) as net_worth, h.inheritance_share
FROM heirs h
JOIN financial_records f ON f.heir_id = h.id
GROUP BY h.id, h.name, h.inheritance_share
HAVING SUM(f.balance) < 0 AND h.inheritance_share >= 10
ORDER BY net_worth ASC;
```

**Result:** David Pemberton (-£465k, 10%), Marcus Pemberton (-£263k, 40%)

---

### Mission 6 — Final Suspect (100 pts)

**Objective:** Find ONE person who satisfies all four conditions:
- Net worth < 0
- Inherits >= 10%
- Contacted Edmund March 13–15
- Sighted at forest edge March 15

```sql
SELECT DISTINCT h.name, SUM(f.balance) as net_worth, h.inheritance_share, s.sighted_date
FROM heirs h
JOIN financial_records f ON f.heir_id = h.id
JOIN communications c ON c.sender_id = h.id AND c.recipient_id = 1
JOIN sightings s ON s.person_id = h.id
WHERE c.sent_date BETWEEN '2024-03-13' AND '2024-03-15'
  AND s.location = 'Estate Forest Edge'
  AND s.sighted_date = '2024-03-15'
GROUP BY h.id, h.name, h.inheritance_share, s.sighted_date
HAVING SUM(f.balance) < 0 AND h.inheritance_share >= 10;
```

**Result:** David Pemberton — only person matching all criteria

---

## Case 003: Poison at Parliament

**Culprit:** Elena Vasquez  
**Total Points:** 1500

### Mission 1 — Staff Roster (150 pts)

**Objective:** List everyone who worked Parliamentary Dinner on May 8

```sql
SELECT s.name, s.role, e.shift_start, e.shift_end
FROM event_assignments e
JOIN staff s ON e.staff_id = s.id
WHERE e.event_name = 'Parliamentary Dinner'
ORDER BY e.shift_start;
```

**Result:** 7 staff members (Head Chef, Sous Chef, Bartender, Wine Sommelier, 2 Servers, Manager)

---

### Mission 2 — Wine Deliveries (200 pts)

**Objective:** Find all wine deliveries on May 8

```sql
SELECT sup.name, d.item, d.delivered_datetime, staff.name as received_by
FROM deliveries d
JOIN suppliers sup ON d.supplier_id = sup.id
JOIN staff ON d.received_by = staff.id
WHERE (d.item LIKE '%wine%' OR d.item LIKE '%Wine%')
  AND d.delivered_datetime LIKE '2024-05-08%';
```

**Result:** Château Margaux (received by Rachel Owens), Barolo Riserva (received by Elena Vasquez)

---

### Mission 3 — Sommelier Access (200 pts)

**Objective:** Find the sommelier's wine delivery

```sql
SELECT s.name, s.security_clearance, d.item
FROM staff s
JOIN deliveries d ON d.received_by = s.id
WHERE s.role = 'Wine Sommelier'
  AND d.delivered_datetime LIKE '2024-05-08%';
```

**Result:** Elena Vasquez (clearance 4) received Barolo Riserva at 16:45

---

### Mission 4 — Suspicious Payment (250 pts)

**Objective:** Find staff who received over £40k in May 1–8

```sql
SELECT s.name, f.amount, f.date, f.description
FROM financial_transactions f
JOIN staff s ON f.staff_id = s.id
WHERE f.amount > 40000
  AND f.date BETWEEN '2024-05-01' AND '2024-05-08';
```

**Result:** Elena Vasquez — £50,000 "Anonymous deposit" on May 5

---

### Mission 5 — Political Connection (250 pts)

**Objective:** Find staff connected to Senator Harlow

```sql
SELECT s.name, s.role, k.connection_type, k.connected_to, k.notes
FROM known_connections k
JOIN staff s ON k.staff_id = s.id
WHERE k.connected_to LIKE '%Harlow%';
```

**Result:** Elena Vasquez — brother convicted in a case prosecuted by Harlow 5 years ago

---

### Mission 6 — Debt, Then Payment (250 pts)

**Objective:** Find staff who paid out debt in April, then received £40k+ in May

```sql
SELECT DISTINCT s.name
FROM financial_transactions f1
JOIN financial_transactions f2 ON f1.staff_id = f2.staff_id
JOIN staff s ON s.id = f1.staff_id
WHERE f1.amount < 0 AND f1.date LIKE '2024-04%'
  AND f2.amount > 40000 AND f2.date LIKE '2024-05%';
```

**Result:** Elena Vasquez — paid £45k gambling debt April 15, received £50k May 5

---

### Mission 7 — Final Culprit (200 pts)

**Objective:** Find ONE person who satisfies:
- Worked Parliamentary Dinner
- Received wine delivery personally
- Connected to Harlow
- Suspicious payment over £40k

```sql
SELECT DISTINCT s.name, s.role, d.item, f.amount
FROM staff s
JOIN event_assignments e ON e.staff_id = s.id
JOIN deliveries d ON d.received_by = s.id
JOIN known_connections k ON k.staff_id = s.id
JOIN financial_transactions f ON f.staff_id = s.id
WHERE e.event_name = 'Parliamentary Dinner'
  AND (d.item LIKE '%wine%' OR d.item LIKE '%Wine%')
  AND d.delivered_datetime LIKE '2024-05-08%'
  AND k.connected_to LIKE '%Harlow%'
  AND f.amount > 40000
  AND f.date BETWEEN '2024-05-01' AND '2024-05-08';
```

**Result:** Elena Vasquez — only person matching all four conditions

---

## Key SQL Patterns Used

### Case 001 (Rookie)
- Basic SELECT/WHERE/JOIN
- **Time string comparison** with midnight wrap (`>= '23:00' OR <= '01:00'`)
- Multi-condition filtering

### Case 002 (Detective)
- **GROUP BY** and **SUM()** aggregates
- **HAVING** clause for filtering aggregated results
- **Multiple JOINs** (3-4 tables)
- **BETWEEN** for date ranges
- **Subqueries** or CTEs for net worth calculation

### Case 003 (Inspector)
- **Complex multi-table JOINs** (5-6 tables)
- **LIKE** pattern matching
- **Self-joins** (financial_transactions to itself)
- **DISTINCT** to eliminate duplicates
- Combining multiple filter conditions across different time windows

---

## Teaching Progression

**Case 001** introduces foundational SQL: basic queries, joins, and the tricky concept of TEXT-based time comparisons.

**Case 002** builds up to intermediate skills: aggregates, grouping, and combining multiple data sources to establish patterns.

**Case 003** tests advanced proficiency: deeply nested joins, self-referential queries, and synthesizing evidence from many disparate tables.

Each case rewards players who think like detectives: following the evidence trail, connecting disparate facts, and narrowing down to a single culprit through logical elimination.

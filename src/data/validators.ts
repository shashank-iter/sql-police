"use client";

/* ───────────────────────────────────────────
   MISSION VALIDATORS
   Keyed by mission id — looked up at runtime
   inside GameShell (a client component).
   This file is never imported by a server
   component, so the functions are never
   serialised.
   ─────────────────────────────────────────── */

type ValidateFn = (rows: Record<string, unknown>[]) => {
  pass: boolean;
  feedback: string;
};

// Helper function to check if required columns exist
function checkRequiredColumns(
  rows: Record<string, unknown>[],
  requiredColumns: string[],
): { pass: boolean; feedback: string } | null {
  if (rows.length === 0) {
    return {
      pass: false,
      feedback: "No results returned. Check your query.",
    };
  }

  const firstRow = rows[0];
  const actualColumns = Object.keys(firstRow);
  const missingColumns = requiredColumns.filter(
    (col) => !actualColumns.includes(col),
  );

  if (missingColumns.length > 0) {
    return {
      pass: false,
      feedback: `Missing required columns: ${missingColumns.join(", ")}. Your SELECT must include all of: ${requiredColumns.join(", ")}`,
    };
  }

  return null; // All columns present
}

const validators: Record<string, ValidateFn> = {
  // ─── Case: the-midnight-theft ──────────────

  "identify-stolen": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "location",
      "value_usd",
    ]);
    if (columnCheck) return columnCheck;

    const stolen = rows.filter((r) => r.stolen === 1 || r.stolen === "1");
    if (stolen.length === 0)
      return {
        pass: false,
        feedback: "No stolen items found. Filter WHERE stolen = 1.",
      };

    const names = stolen.map((r) => String(r.name).toLowerCase());
    if (!names.includes("celestine diamond"))
      return {
        pass: false,
        feedback: "The Celestine Diamond should appear in your results.",
      };

    return {
      pass: true,
      feedback: "Confirmed: the Celestine Diamond is missing from the Study.",
    };
  },

  "study-access": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "entered_at",
      "exited_at",
    ]);
    if (columnCheck) return columnCheck;

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("marcus thorne"))
      return {
        pass: false,
        feedback:
          "Marcus Thorne visited the Study — he should be in your results.",
      };
    if (!names.includes("victoria ashworth"))
      return {
        pass: false,
        feedback:
          "Victoria Ashworth also accessed the Study. Include all visitors.",
      };

    return {
      pass: true,
      feedback:
        "Three Study visitors identified: Victoria Ashworth, Marcus Thorne (twice!), and note David Calloway's suspicious gap.",
    };
  },

  "midnight-window": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "entered_at"]);
    if (columnCheck) return columnCheck;

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("marcus thorne"))
      return {
        pass: false,
        feedback:
          "Marcus Thorne entered the Study at 00:20 — right in the theft window. Check your time logic.",
      };

    return {
      pass: true,
      feedback:
        "Marcus Thorne is confirmed in the Study during the critical window (00:20 – 00:55). The net tightens…",
    };
  },

  "motive-check": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "relation"]);
    if (columnCheck) return columnCheck;

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("marcus thorne"))
      return {
        pass: false,
        feedback:
          "Marcus Thorne never left (departure_time IS NULL). He should be here.",
      };
    if (!names.includes("david calloway"))
      return {
        pass: false,
        feedback: "David Calloway also stayed past midnight. Include him too.",
      };

    return {
      pass: true,
      feedback:
        "Two suspects remained past midnight: Marcus Thorne (Business Partner) and David Calloway (Old College Friend). Both had opportunity.",
    };
  },

  "final-verdict": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name"]);
    if (columnCheck) return columnCheck;

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (names.includes("marcus thorne") && rows.length <= 2)
      return {
        pass: true,
        feedback:
          "CASE CLOSED. Marcus Thorne is the thief. He entered the Study at 00:20 — after most guests had left — and exited at 00:55 with the diamond. He never departed the manor.",
      };
    if (!names.includes("marcus thorne"))
      return {
        pass: false,
        feedback:
          "The culprit is not in your results. Re-examine who was in the Study between 23:00 and 01:00 and never left the manor.",
      };

    return {
      pass: false,
      feedback:
        "You have the right suspect, but your query is returning too many rows. Tighten your filters.",
    };
  },

  // ─── Case: the-vanishing-heir ──────────────

  "identify-heirs": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "inheritance_share",
    ]);
    if (columnCheck) return columnCheck;

    if (rows.length < 4)
      return {
        pass: false,
        feedback: "You should find 4 heirs who inherit if Edmund is removed.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("marcus pemberton"))
      return {
        pass: false,
        feedback: "Marcus Pemberton (Younger Son) inherits 40%. Include him.",
      };

    return {
      pass: true,
      feedback: "All heirs identified. Marcus gains the most at 40%.",
    };
  },

  "financial-desperation": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "net_worth"]);
    if (columnCheck) return columnCheck;

    if (rows.length < 5)
      return {
        pass: false,
        feedback: "Calculate net worth for all 5 people in the heirs table.",
      };

    const davidRow = rows.find((r) =>
      String(r.name).toLowerCase().includes("david"),
    );
    if (!davidRow)
      return {
        pass: false,
        feedback:
          "David Pemberton should be in your results. He has the worst financial situation.",
      };

    const davidNet = Number(davidRow.net_worth);
    if (davidNet > -400000)
      return {
        pass: false,
        feedback:
          "David Pemberton should have a net worth around -£465,000 (debt). Check your SUM calculation.",
      };

    return {
      pass: true,
      feedback:
        "David Pemberton is in the worst financial shape: nearly half a million in debt.",
    };
  },

  "last-contact": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "sent_date",
      "subject",
    ]);
    if (columnCheck) return columnCheck;

    if (rows.length < 2)
      return {
        pass: false,
        feedback: "At least 2 people contacted Edmund in that window.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("david pemberton"))
      return {
        pass: false,
        feedback: "David Pemberton sent Edmund TWO messages. He should appear.",
      };

    return {
      pass: true,
      feedback:
        'David contacted Edmund twice: "Urgent: need to talk" and "Meet me at the estate tonight".',
    };
  },

  "forest-sighting": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "witness"]);
    if (columnCheck) return columnCheck;

    if (rows.length < 2)
      return {
        pass: false,
        feedback:
          "Two people were sighted at the Estate Forest Edge on March 15th: Edmund and one other.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("david pemberton"))
      return {
        pass: false,
        feedback:
          "David Pemberton was at the forest edge that day. Include him.",
      };
    if (!names.includes("edmund pemberton"))
      return {
        pass: false,
        feedback: "Edmund was also sighted there. Include both.",
      };

    return {
      pass: true,
      feedback:
        "Edmund and David were BOTH at the forest edge on March 15th — the exact location where the car was found.",
    };
  },

  "motive-matrix": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "net_worth",
      "inheritance_share",
    ]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "At least one heir meets both criteria: in debt AND inherits >= 10%.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("david pemberton"))
      return {
        pass: false,
        feedback:
          "David is in massive debt (-£465k) and would inherit 10%. He should be in your results.",
      };

    return {
      pass: true,
      feedback:
        "David Pemberton and Marcus Pemberton both have motive: deeply in debt and stand to gain significantly.",
    };
  },

  "final-suspect": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name"]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "One person satisfies all four conditions. Re-check your joins and filters.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("david pemberton"))
      return {
        pass: false,
        feedback:
          "David Pemberton is the only one who: (1) is in debt, (2) inherits 10%, (3) contacted Edmund March 13–15, (4) was at the forest on March 15th.",
      };
    if (rows.length > 1)
      return {
        pass: false,
        feedback: "Only ONE person matches all criteria. Tighten your filters.",
      };

    return {
      pass: true,
      feedback:
        "CASE SOLVED. David Pemberton: motive (debt + inheritance), opportunity (lured Edmund to the forest), and physical presence at the scene.",
    };
  },

  // ─── Case: poison-at-parliament ──────────────

  "identify-staff": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "role"]);
    if (columnCheck) return columnCheck;

    if (rows.length < 7)
      return {
        pass: false,
        feedback:
          "Seven staff members worked the Parliamentary Dinner. Include all of them.",
      };

    const roles = rows.map((r) => String(r.role).toLowerCase());
    if (!roles.some((r) => r.includes("sommelier")))
      return {
        pass: false,
        feedback:
          "The wine sommelier worked that night. Make sure they're in the results.",
      };

    return {
      pass: true,
      feedback:
        "All 7 staff members identified. The sommelier handled wine service.",
    };
  },

  "wine-delivery": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "item",
      "received_by",
    ]);
    if (columnCheck) return columnCheck;

    if (rows.length < 2)
      return {
        pass: false,
        feedback:
          "Two wine deliveries arrived on May 8th. Check your LIKE filter.",
      };

    const items = rows.map((r) => String(r.item).toLowerCase());
    if (!items.some((i) => i.includes("barolo")))
      return {
        pass: false,
        feedback: "The Barolo Riserva was delivered that day. Include it.",
      };

    return {
      pass: true,
      feedback:
        "Two wine deliveries found: Château Margaux and Barolo Riserva. Both arrived May 8th.",
    };
  },

  "sommelier-access": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "item"]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "The sommelier received a wine delivery personally. Find that record.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("elena vasquez"))
      return {
        pass: false,
        feedback:
          "Elena Vasquez is the sommelier. She should be in your results.",
      };

    const item = String(rows[0].item || "").toLowerCase();
    if (!item.includes("barolo"))
      return {
        pass: false,
        feedback:
          "Elena received the Barolo Riserva delivery at 16:45. Check the JOIN.",
      };

    return {
      pass: true,
      feedback:
        "Elena Vasquez (sommelier) personally received the Barolo Riserva — giving her exclusive access.",
    };
  },

  "suspicious-payment": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name", "amount"]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "One staff member received over £40,000 in early May. Check your filter.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("elena vasquez"))
      return {
        pass: false,
        feedback:
          "Elena Vasquez received £50,000 on May 5th — 3 days before the poisoning. Include her.",
      };

    return {
      pass: true,
      feedback:
        'Elena received £50,000 marked "Anonymous deposit" on May 5th. Highly suspicious timing.',
    };
  },

  "political-connection": (rows) => {
    const columnCheck = checkRequiredColumns(rows, [
      "name",
      "connection_type",
      "notes",
    ]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "One staff member has a documented connection to Senator Harlow. Check the known_connections table.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("elena vasquez"))
      return {
        pass: false,
        feedback:
          "Elena Vasquez has a connection: her brother was convicted in a case prosecuted by Harlow. Include her.",
      };

    return {
      pass: true,
      feedback:
        "Elena's brother was convicted by Harlow 5 years ago. Personal vendetta confirmed — strong motive.",
    };
  },

  "debt-then-payment": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name"]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "One person paid out a large debt in April, then received £50k in May. Use a self-join or subquery.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("elena vasquez"))
      return {
        pass: false,
        feedback:
          "Elena paid £45,000 in gambling debts on April 15th, then received £50,000 on May 5th. She was paid off.",
      };

    return {
      pass: true,
      feedback:
        "Elena made a £45k debt payment in April, then received £50k anonymously in May. Clear payoff pattern.",
    };
  },

  "final-culprit": (rows) => {
    const columnCheck = checkRequiredColumns(rows, ["name"]);
    if (columnCheck) return columnCheck;

    if (rows.length === 0)
      return {
        pass: false,
        feedback:
          "One person meets ALL criteria: worked the event, received wine, connected to Harlow, and got a suspicious payment.",
      };

    const names = rows.map((r) => String(r.name).toLowerCase());
    if (!names.includes("elena vasquez"))
      return {
        pass: false,
        feedback:
          "Elena Vasquez is the only one who satisfies all four conditions. Re-check your joins and filters.",
      };
    if (rows.length > 1)
      return {
        pass: false,
        feedback: "Only ONE person matches all criteria. Tighten your filters.",
      };

    return {
      pass: true,
      feedback:
        "CASE CLOSED. Elena Vasquez: motive (vendetta), opportunity (sommelier with wine access), financial trail (paid £50k), and connection to victim.",
    };
  },
};

/**
 * Look up the validator for a given mission id.
 * Returns a no-op that always fails if the id isn't registered
 * (safety net for stub cases).
 */
export function getValidator(missionId: string): ValidateFn {
  return (
    validators[missionId] ??
    (() => ({
      pass: false,
      feedback: "No validator registered for this mission.",
    }))
  );
}

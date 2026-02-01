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

const validators: Record<string, ValidateFn> = {
  // ─── Case: the-midnight-theft ──────────────

  "identify-stolen": (rows) => {
    console.log("rows:", rows);
    const stolen = rows.filter((r) => r.stolen === 1 || r.stolen === "1");
    if (stolen.length === 0)
      return {
        pass: false,
        feedback:
          "No stolen items found. Filter where stolen = 1. Make sure to select stolen column.",
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

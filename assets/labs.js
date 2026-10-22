/*
 * Pure calculations behind the interactive labs. No DOM access, so they can be
 * tested in Node. Uses the same rules as the Python programs via versions.js.
 */
(function (root) {
  "use strict";

  const V =
    typeof module !== "undefined" && module.exports
      ? require("./versions.js")
      : root.Versions;

  // Common passwords used by the dictionary-attack lab. Deliberately small and
  // readable: the point is that a short list is enough for weak passwords.
  const WORDLIST = [
    "123456", "password", "Password123", "qwerty", "letmein", "admin", "welcome",
    "monkey", "dragon", "sunshine", "iloveyou", "football", "abc123", "111111",
    "trustno1", "changeme", "secret", "hello123", "summer2024", "winter2025",
    "alice", "bob", "builder", "Password1", "P@ssw0rd", "qwerty123", "login",
  ];

  // Step-by-step version of generate_custom_hash (v4).
  function hashSteps(text) {
    let hash = 5381;
    const steps = [];
    for (const ch of text) {
      const code = ch.codePointAt(0);
      hash = (((hash << 5) + hash) + code) >>> 0;
      steps.push({ ch: ch, code: code, hash: hash, hex: "0x" + hash.toString(16) });
    }
    return { steps: steps, finalHex: "0x" + (hash >>> 0).toString(16) };
  }

  // Step-by-step version of sanitise_username (v4).
  function sanitiseSteps(raw) {
    const steps = [];
    for (const ch of raw) {
      steps.push({ ch: ch, kept: /[\p{L}\p{N}]/u.test(ch) });
    }
    const cleaned = steps.filter((s) => s.kept).map((s) => s.ch).join("").toLowerCase();
    return { steps: steps, cleaned: cleaned };
  }

  // Number of bits that differ between two equal-length hex strings.
  function hammingBits(hexA, hexB) {
    let differing = 0;
    for (let i = 0; i < hexA.length; i++) {
      let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
      while (x) {
        differing += x & 1;
        x >>= 1;
      }
    }
    return { differing: differing, total: hexA.length * 4 };
  }

  // Dictionary attack: hash each word and compare with the target digest.
  // digestOf is an async function (text) -> hex string, e.g. Versions.sha256Hex.
  async function crackWordlist(targetDigest, words, digestOf) {
    const start = performance.now();
    let tried = 0;
    for (const word of words) {
      tried += 1;
      if ((await digestOf(word)) === targetDigest) {
        return { found: word, tried: tried, ms: performance.now() - start };
      }
    }
    return { found: null, tried: tried, ms: performance.now() - start };
  }

  // Average guesses needed = half the search space. Returns the time for each rate.
  function bruteForceEstimate(length, charsetSize, scenarios) {
    const space = Math.pow(charsetSize, length);
    const averageGuesses = space / 2;
    return scenarios.map(function (s) {
      return { label: s.label, rate: s.rate, seconds: averageGuesses / s.rate, note: s.note || "" };
    });
  }

  // Human-readable duration.
  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds > 3.15576e16) return "over a billion years";
    if (seconds < 1) return "under a second";
    const units = [
      [31557600, "year"],
      [86400, "day"],
      [3600, "hour"],
      [60, "minute"],
      [1, "second"],
    ];
    for (const [size, name] of units) {
      if (seconds >= size) {
        const n = Math.round(seconds / size);
        return n + " " + name + (n === 1 ? "" : "s");
      }
    }
    return "under a second";
  }

  // v1: result of (username != STORED_USERNAME) or (password != STORED_PASSWORD).
  function v1Decision(userCorrect, passCorrect) {
    return { denied: !userCorrect || !passCorrect };
  }

  // v2: the blank check. strip() turns whitespace-only input into "".
  function v2Check(raw) {
    const stripped = raw.trim();
    return { raw: raw, stripped: stripped, accepted: stripped !== "" };
  }

  const api = {
    WORDLIST: WORDLIST,
    hashSteps: hashSteps,
    sanitiseSteps: sanitiseSteps,
    hammingBits: hammingBits,
    crackWordlist: crackWordlist,
    bruteForceEstimate: bruteForceEstimate,
    formatDuration: formatDuration,
    v1Decision: v1Decision,
    v2Check: v2Check,
    // Keep a reference so tests can confirm the labs use the same hash as the terminal.
    customHash: V.customHash,
  };

  root.Labs = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

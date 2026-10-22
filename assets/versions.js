/*
 * Browser versions of the six login programs in src/.
 *
 * Each program is an async function that talks to the user only through `io`:
 *   io.print(text)            show a line of output (may contain \n)
 *   io.ask(prompt, opts)      wait for the user to type; opts.secret hides the typed text
 *   io.sleep(ms)              wait (used for the lockout)
 *   io.log(event, user, details)   write to the security audit log (vFINAL only)
 *
 * The messages, rules and order of steps follow the Python files exactly, so the
 * page shows the same output the Python programs print.
 */
(function (root) {
  "use strict";

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_SECONDS = 30;

  // Same values as the Python files. Passwords are never stored here.
  const V4_USERS = new Map([
    ["alice", "0x5a834c7e"],
    ["bob", "0x649d73a5"],
    ["admin", "0x6c8c65e8"],
  ]);

  const V5_USERS = new Map([
    ["alice", "d2cb6e4e1ec204f3c63cf7e6b24b786944d36b23200ac4cf231c6ffb6cf7d25a"],
    ["bob", "df62406b21908ffa86705936896bc1590ab26072886669b72138ba65680c1fb4"],
    ["admin", "b76797b9918f3a663c1fd197816888edcd4ccff0dfd2bbcc8f5cca4b429c3489"],
  ]);

  /* ---------- helpers that mirror the Python code ---------- */

  // Python: generate_custom_hash. The 32-bit mask is applied to the final value,
  // which gives the same result as the Python code.
  function customHash(plaintext) {
    let hash = 5381;
    for (const ch of plaintext) {
      hash = (((hash << 5) + hash) + ch.codePointAt(0)) >>> 0;
    }
    return "0x" + hash.toString(16);
  }

  // Python: sanitise_username. Keeps letters and digits only, then lower-cases.
  function sanitiseUsername(raw) {
    let kept = "";
    for (const ch of raw) {
      if (/[\p{L}\p{N}]/u.test(ch)) kept += ch;
    }
    return kept.toLowerCase();
  }

  // Python: hashlib.sha256(text.encode("utf-8")).hexdigest()
  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await root.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /* ---------- Version 1: basic prototype ---------- */

  async function v1(io) {
    const username = await io.ask("Enter username: ");
    const password = await io.ask("Enter password: ");
    if (username !== "admin" || password !== "Password123") {
      io.print("Access Denied: Invalid credentials.");
    } else {
      io.print("Access Granted: Welcome to the system.");
    }
  }

  /* ---------- Version 2: input validation and retry loop ---------- */

  async function v2(io) {
    let attempts = 0;
    let authenticated = false;

    while (attempts < MAX_ATTEMPTS && !authenticated) {
      io.print("\nAttempt " + (attempts + 1) + " of " + MAX_ATTEMPTS);

      let username = (await io.ask("Enter username: ")).trim();
      while (username === "") {
        io.print("Validation Error: Username cannot be blank.");
        username = (await io.ask("Enter username: ")).trim();
      }

      let password = (await io.ask("Enter password: ")).trim();
      while (password === "") {
        io.print("Validation Error: Password cannot be blank.");
        password = (await io.ask("Enter password: ")).trim();
      }

      if (username === "admin" && password === "Password123") {
        authenticated = true;
        io.print("Access Granted: Welcome to the system.");
      } else {
        attempts += 1;
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining !== 0) {
          io.print("Access Denied: Incorrect credentials. " + remaining + " attempt(s) remaining.");
        } else {
          io.print("Access Denied: Maximum attempts exceeded. Program terminating.");
        }
      }
    }
  }

  /* ---------- Version 3: modular design ---------- */

  async function getNonEmptyInput(io, promptText) {
    let value = (await io.ask(promptText)).trim();
    while (value === "") {
      io.print("Validation Error: Field cannot be empty. Please try again.");
      value = (await io.ask(promptText)).trim();
    }
    return value;
  }

  function validateCredentials(username, password) {
    return username === "admin" && password === "Password123";
  }

  function displayStatus(io, isAuthenticated, remainingAttempts) {
    if (isAuthenticated) {
      io.print("\n[+] Authentication Successful. Access Granted.");
    } else if (remainingAttempts !== 0) {
      io.print("[-] Authentication Failed. Remaining attempts: " + remainingAttempts);
    } else {
      io.print("[-] Critical: Maximum login attempts exceeded.");
    }
  }

  async function v3(io) {
    let attempts = 0;
    let authenticated = false;

    while (attempts < MAX_ATTEMPTS && !authenticated) {
      io.print("\n--- Login Screen (Attempt " + (attempts + 1) + "/" + MAX_ATTEMPTS + ") ---");
      const username = await getNonEmptyInput(io, "Username: ");
      const password = await getNonEmptyInput(io, "Password: ");

      authenticated = validateCredentials(username, password);
      attempts += 1;

      displayStatus(io, authenticated, MAX_ATTEMPTS - attempts);
    }
  }

  /* ---------- Version 4: sanitisation, dictionary and custom hash ---------- */

  async function getCredentials(io) {
    let rawUser = (await io.ask("Enter username: ")).trim();
    let cleanUser = sanitiseUsername(rawUser);
    while (cleanUser === "") {
      io.print("Validation Error: Username must contain valid alphanumeric characters.");
      rawUser = (await io.ask("Enter username: ")).trim();
      cleanUser = sanitiseUsername(rawUser);
    }

    let password = (await io.ask("Enter password: ")).trim();
    while (password === "") {
      io.print("Validation Error: Password cannot be blank.");
      password = (await io.ask("Enter password: ")).trim();
    }
    return [cleanUser, password];
  }

  function authenticateV4(username, password) {
    return V4_USERS.has(username) && customHash(password) === V4_USERS.get(username);
  }

  async function v4(io) {
    let attempts = 0;
    let authenticated = false;

    while (attempts < MAX_ATTEMPTS && !authenticated) {
      io.print("\n--- Portal Login (Attempt " + (attempts + 1) + "/" + MAX_ATTEMPTS + ") ---");
      const [user, pwd] = await getCredentials(io);

      authenticated = authenticateV4(user, pwd);
      attempts += 1;

      if (authenticated) {
        io.print("\n[+] Welcome, " + user + ". Authentication confirmed.");
      } else {
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining !== 0) {
          io.print("[-] Access Denied. " + remaining + " attempt(s) remaining.");
        }
      }
    }
  }

  /* ---------- Version 5: SHA-256 with hidden password input ---------- */

  async function authenticateV5(username, password) {
    if (!V5_USERS.has(username)) return false;
    return (await sha256Hex(password)) === V5_USERS.get(username);
  }

  async function v5(io) {
    let attempts = 0;
    let authenticated = false;

    while (attempts < MAX_ATTEMPTS && !authenticated) {
      io.print("\n[Secure Terminal - Attempt " + (attempts + 1) + "/" + MAX_ATTEMPTS + "]");
      const user = (await io.ask("Username: ")).trim().toLowerCase();
      // The password is not trimmed, matching the Python code.
      const pwd = await io.ask("Password (hidden): ", { secret: true });

      if (user === "" || pwd === "") {
        io.print("Validation Error: All fields are required.");
        continue;
      }

      authenticated = await authenticateV5(user, pwd);
      attempts += 1;

      if (authenticated) {
        io.print("\n[+] Login Verified. Session established for '" + user + "'.");
      } else {
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining !== 0) {
          io.print("[-] Verification Failed. " + remaining + " attempts left.");
        }
      }
    }
  }

  /* ---------- Version FINAL: lockout and secure logging ---------- */

  async function verifyLoginFinal(username, password) {
    if (!V5_USERS.has(username)) return false;
    return (await sha256Hex(password)) === V5_USERS.get(username);
  }

  async function vfinal(io) {
    let failedAttempts = 0;

    io.print("==================================================");
    io.print("      ENTERPRISE SECURE AUTHENTICATION GATEWAY    ");
    io.print("==================================================");
    io.log("SERVICE_STARTED", "SYSTEM", "Gateway initialized successfully.");

    while (true) {
      if (failedAttempts >= MAX_ATTEMPTS) {
        io.log("ACCOUNT_LOCKOUT", "SYSTEM", "Lockout triggered for " + LOCKOUT_SECONDS + "s.");
        io.print("\n[!] ALERT: " + MAX_ATTEMPTS + " failed attempts detected. System locked for " + LOCKOUT_SECONDS + " seconds.");
        for (let remaining = LOCKOUT_SECONDS; remaining > 0; remaining -= 5) {
          io.print("    Lockout active... " + remaining + " seconds remaining.");
          await io.sleep(5000);
        }
        io.print("[*] Lockout expired. You may attempt login again.\n");
        failedAttempts = 0;
      }

      io.print("\nAuthentication Required (Attempt " + (failedAttempts + 1) + "/" + MAX_ATTEMPTS + "):");
      const username = (await io.ask("Username: ")).trim().toLowerCase();
      const password = (await io.ask("Password: ")).trim();

      if (username === "" || password === "") {
        io.print("[-] Input Error: Neither username nor password can be blank.");
        io.log("VALIDATION_FAILURE", username, "Blank input submitted.");
        continue;
      }

      if (await verifyLoginFinal(username, password)) {
        io.print("\n[+] Access Granted. Welcome, '" + username + "'.");
        io.log("LOGIN_SUCCESS", username, "Authenticated successfully.");
        break;
      }

      failedAttempts += 1;
      const remaining = MAX_ATTEMPTS - failedAttempts;
      if (remaining !== 0) {
        io.print("[-] Access Denied: Invalid credentials. Remaining attempts before lockout: " + remaining);
      } else {
        io.print("[-] Threshold reached: Account entering temporary lockout.");
      }
      io.log("LOGIN_FAILURE", username, "Invalid attempt " + failedAttempts + " of " + MAX_ATTEMPTS + ".");
    }

    io.print("\n[Session Active] Proceeding to application dashboard...");
  }

  const api = {
    programs: { v1: v1, v2: v2, v3: v3, v4: v4, v5: v5, vFINAL: vfinal },
    // Exposed for testing
    customHash: customHash,
    sanitiseUsername: sanitiseUsername,
    sha256Hex: sha256Hex,
  };

  root.Versions = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

# Process Diary: Secure Login System

**Student:** David Forbes
**Course:** HSC Software Engineering: Secure Architecture
**Project:** Six versions of a secure Python login system (v1 to vFINAL)

> **Before you submit:** every entry is dated 22 October 2026, the date this diary was compiled. Replace each date with the day you actually worked on that version. The "reflective comments", the Trinket.io observations and the "resources used" sections are drafted from the code and tests, so check them against your own experience and edit them to match.

---

## Contents

1. [Diary entries (v1 to vFINAL)](#1-diary-entries)
2. [Changes made to the supplied code](#2-changes-made-to-the-supplied-code)
3. [Design and security choices](#3-design-and-security-choices)
4. [Test cases: expected and actual results](#4-test-cases-expected-and-actual-results)
5. [Security evaluation by version](#5-security-evaluation-by-version)
6. [Limitations of Trinket.io compared with local development](#6-limitations-of-trinketio-compared-with-local-development)
7. [How to reproduce the tests](#7-how-to-reproduce-the-tests)

---

## 1. Diary entries

### Entry 1: Version 1, basic prototype

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** None. This is the first entry.
- **Tasks achieved:**
  - Read the brief and the sample code for v1. Identified the course concepts it uses: sequence, binary selection (`if` / `else`), and the `or` and `!=` operators.
  - Set up the repository with `src/`, `tests/` and `docs/` folders.
  - Confirmed `src/login_v1_DavidForbes.py` runs as a single linear script with two prompts and one check.
  - Wrote three tests: a correct login succeeds, a wrong password fails, and a wrong username fails. The tests run the script as a separate process with simulated keyboard input.
- **Problems encountered and how I managed them:**
  - The prototype stores `"Password123"` in plain text in the source. This is a deliberate limitation of v1, so I recorded it as a known weakness and did not change it. Later versions remove it.
  - A single `input()` call cannot be unit-tested directly. I ran the script in a subprocess and piped simulated text into stdin.
- **Possible approaches for upcoming tasks:** Add a loop so the user can retry (v2). Keep the credentials in a form that can later be replaced by a stored record (v4 and v5).
- **Reflective comments:** A working prototype is useful, but it shows the problem clearly. Anyone who can read the file has the password. This is why the later versions move from plain text to hashes.
- **Resources used:** Course brief, pages 14, 15 and 22. Python documentation for `input()` and `print()`.

### Entry 2: Version 2, input validation and retry loop

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** Version 1 was tested and working.
- **Tasks achieved:**
  - Added a `while` loop that allows three attempts (`attempts < MAX_ATTEMPTS`) while the user is not authenticated (`authenticated != True`).
  - Added `.strip()` and an inner validation loop, so blank and whitespace-only usernames and passwords are rejected and re-prompted.
  - Used `.format()` to show the number of attempts remaining.
  - Wrote three tests: a blank username is rejected, a blank password is rejected, and three wrong attempts end the program.
- **Problems encountered and how I managed them:**
  - Whitespace-only input (for example `"   "`) looked valid before `.strip()` was added. The fix was to strip the input before the emptiness check.
  - Blank entries should not use up an attempt. The inner validation loop re-prompts before the attempt counter is touched, and the test `test_tc_v2_01` checks that the second attempt is never shown.
- **Possible approaches for upcoming tasks:** Move the prompts and checks into subroutines (v3). Separate validation from comparison, so each can be tested alone.
- **Reflective comments:** The retry loop is a small change, but it changes how the program is tested. Each test now needs a sequence of inputs, not one input. This made me think about the program as a series of states.
- **Resources used:** Course brief, pages 17 and 18. Python documentation for `str.strip()` and `str.format()`.

### Entry 3: Version 3, modular design

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** Version 2 was tested and working.
- **Tasks achieved:**
  - Split the program into three subroutines with parameters and return values: `get_non_empty_input(prompt_text)`, `validate_credentials(username, password)` and `display_status(is_authenticated, remaining_attempts)`.
  - Wrote `main()` as a short coordinator that calls the subroutines. Added the `if __name__ == "__main__":` guard, so importing the file does not start the program.
  - Wrote six tests. Each subroutine is tested on its own. Each test records its inputs and returned value.
- **Problems encountered and how I managed them:**
  - The subroutines read from `input()` and print to the screen, so their tests needed `unittest.mock.patch` and a helper that captures printed output (`capture_output`).
  - Local variables in functions do not persist between calls. The loop counter now lives in `main()` and is passed in as `MAX_ATTEMPTS - attempts`.
- **Possible approaches for upcoming tasks:** Store users in a data structure rather than in two constants (v4). Replace the stored plain-text password with something that is not the password itself (v4 and v5).
- **Reflective comments:** Testing each subroutine alone showed that `validate_credentials` is case-sensitive. The test `test_tc_v3_03` checks that `"ADMIN"` is rejected. Modular code made this kind of behaviour easy to see.
- **Resources used:** Course brief, pages 14 and 19 to 21. Python documentation for `unittest.mock`.

### Entry 4: Version 4, data validation and custom hashing

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** Version 3 was tested and working.
- **Tasks achieved:**
  - Wrote `sanitise_username()`, which keeps only letters and digits (`isalnum()`) and converts them to lower case. It removes `< > : "` and other symbols.
  - Wrote `generate_custom_hash()`, a djb2-style hash that uses `ord()` and a shift-and-add step (`(hash << 5) + hash`). Its result is masked to 32 bits.
  - Stored users in the `USER_DATABASE` dictionary. Lookups are O(1).
  - Wrote six tests. These include checks that the sanitiser removes each symbol and that a known collision exists.
- **Problems encountered and how I managed them:**
  - **The brief's example is wrong.** The brief says `"ab"` and `"ba"` produce the same custom hash. They do not. Running the function gives `0x597728` for `"ab"` and `0x597748` for `"ba"`. The hash multiplies by 33 at each step, so the order of characters matters. The test `test_tc_v4_02` records the actual behaviour and the discrepancy. The weakness the brief asks about is still real. I found a collision that does work: `"aB"` and `"b!"` both give `0x597708` (test `test_tc_v4_03`).
  - **Plain-text passwords were in the source.** The supplied code called `generate_custom_hash("AliceSecure#1")` at import time. That means the plain-text password sits in the source, which contradicts the brief's own statement that the database only stores hashes. I precomputed the three hashes as literals (`"0x5a834c7e"`, `"0x649d73a5"`, `"0x6c8c65e8"`). Test `test_tc_v4_06` checks that neither the database nor the source contains a plain-text password.
  - **The "masked to 32 bits" comment is misleading.** The mask is applied only once, at the end. Python integers do not overflow, so the intermediate value grows with the input length. The final result is still correct modulo 2^32, because addition, multiplication by 33 and shifts are all compatible with that modulus. I left the code as supplied and note the point here.
- **Possible approaches for upcoming tasks:** Use a cryptographic hash with a salt (v5). Hash only the password, not the username.
- **Reflective comments:** I was wrong to trust the brief's example without running the code. Testing the claim showed the example was incorrect, and finding a real collision made the weakness concrete. Sanitising the username is a sensible control, but it also means that `"a dmin"` is treated as `"admin"`. Two different inputs now map to the same account.
- **Resources used:** Course brief, pages 31 and 32. Python documentation for `ord()`, `str.isalnum()` and bitwise operators.

### Entry 5: Version 5, SHA-256 hashing with hashlib

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** Version 4 was tested and working.
- **Tasks achieved:**
  - Replaced the custom hash with `hashlib.sha256()` applied to UTF-8 bytes. Stored digests are 64 hexadecimal characters.
  - Added `getpass.getpass()` to hide the password, with a `try` / `except` fallback to `input()`.
  - Rejected blank submissions before they are compared. They do not use up an attempt.
  - Wrote seven tests. These check the digest values, that a wrong password does not match, that the password is never printed, the blank-input rule, the `getpass` fallback, and that the source file contains no plain-text password.
- **Problems encountered and how I managed them:**
  - **The supplied digests did not match the documented passwords.** The comments say `alice` uses `"Wonderland2024!"`, `bob` uses `"BuilderSafe!99"` and `admin` uses `"HSC_Software_Eng_2025!"`. None of the three supplied digests matched those passwords. I computed the SHA-256 digests of the documented passwords and replaced the stored values. The test `test_tc_v5_01` confirms the match.
  - **The source contained plain-text passwords in its comments.** The supplied file listed them next to the digests. This breaks the rule "Never store or print plain-text passwords", so I removed them from the source. The test accounts and their passwords are now kept in the test files only, which use simulated data.
  - Blank submissions are rejected but not counted, so an attacker can send unlimited blank entries. This is a limitation, not something I changed.
- **Possible approaches for upcoming tasks:** Add a salt to each password before hashing. Use a slow password-hashing function such as bcrypt, scrypt or Argon2, which are designed to resist guessing. Add a lockout (vFINAL).
- **Reflective comments:** SHA-256 is the right tool for checking integrity, but it is fast. That speed is good for a file checksum and bad for passwords, because a guesser can test billions of candidates a second. Using `getpass` also showed that a terminal feature can fail in some IDEs, so the fallback is needed.
- **Resources used:** Course brief, page 32. Python documentation for `hashlib`, `getpass` and `str.encode()`.

### Entry 6: Version FINAL, brute-force protection and secure logging

- **Date:** 22 October 2026
- **Person making the entry:** David Forbes
- **Progress since the last entry:** Version 5 was tested and working.
- **Tasks achieved:**
  - Added a failure counter. After three consecutive failures, `enforce_lockout()` runs a 30-second countdown using `time.sleep(5)` six times. The counter then resets.
  - Added `log_security_event()`. It appends a timestamped line to `security_audit.log` (mode `"a"`, UTF-8). The log records the event type, the username and the details. It never records a password.
  - Used `hmac.compare_digest()` to compare digests in constant time.
  - Wrote nine tests. Seven pass. Two are marked as expected failures because they show known gaps against the brief (see below).
- **Problems encountered and how I managed them:**
  - **The lockout is system-wide, not per account.** The brief says to lock the account. The supplied code locks the whole gateway, so after three failures for `alice`, a correct login for `bob` is also blocked. I kept the supplied design and recorded the gap as test `test_tc_vf_08`, marked as an expected failure. Making the lockout per account would mean keeping a failure counter for each username.
  - **A password typed into the username field is logged.** The username is written to the log exactly as entered (lower-cased). If someone types their password in the wrong box, it appears in the log. This breaks the rule "no password in the log". The test `test_tc_vf_09` shows this as an expected failure. A fix would be to validate the username (length and allowed characters) before logging it.
  - **A test that is expected to fail can pass for the wrong reason.** My first version of `test_tc_vf_09` ran out of scripted input and raised `StopIteration`. Because `expectedFailure` accepts any exception, the test would still have been reported as an expected failure. I gave it a full input sequence and checked that each expected failure now fails on its own assertion.
  - **The lockout lasts 30 seconds of real time, which slows the test run.** Test `test_tc_vf_01` runs the real program with the real delay and measures the time, which was 30.03 seconds. The other lockout tests patch `time.sleep` so they run instantly.
  - **The lockout is held in memory.** Restarting the program clears the counter, so the lockout can be bypassed by restarting. This is listed in the evaluation (section 5).
- **Possible approaches for upcoming tasks:** Store failure counts and lockout times per account, ideally in a file or database that survives restarts. Hash passwords with a salt and a slow function. Log only validated usernames.
- **Reflective comments:** Building the lockout made me see that defences can create new problems. A global lockout is simple to write, but one attacker can lock out every user. Writing the logging tests also showed how easy it is to log something sensitive by accident. The most useful habit was checking the expected-failure tests against their assertions, not just their outcome.
- **Resources used:** Course brief, pages 32 and the vFINAL overview. Python documentation for `time.sleep()`, `datetime.now()`, `hmac.compare_digest()` and `open()` in append mode.

---

## 2. Changes made to the supplied code

Everything else in the six files is as supplied. File names use `DavidForbes` in place of `StudentName`.

| File | Change | Reason |
|---|---|---|
| `login_v4` | `USER_DATABASE` now holds precomputed hash literals, not calls to `generate_custom_hash("<password>")`. | The supplied code stored plain-text passwords in the source, which contradicts the brief. |
| `login_v5` | Replaced the three supplied SHA-256 digests with the digests of the documented passwords. Removed the plain-text passwords from the comments. | The supplied digests did not match the documented passwords, so none of the three accounts could log in. The comments broke the rule "never store plain-text passwords". |
| `login_vFINAL` | Same digest correction as v5. | The same digests were supplied. |

Not changed, but recorded as findings:

- The v4 example `"ab"` / `"ba"` does not collide (test `test_tc_v4_02`).
- The v4 "masked to 32 bits" comment describes a single final mask, not a fixed-width register.
- The vFINAL lockout is global, not per account (test `test_tc_vf_08`).
- A password typed into the username field is logged (test `test_tc_vf_09`).

---

## 3. Design and security choices

| Version | Choice | Justification |
|---|---|---|
| v1 | Hard-coded plain-text credentials and one `if` / `else` check. | Simplest possible prototype. The weakness is the point of the exercise. |
| v2 | `.strip()` before the emptiness check, and a bounded `while` loop. | Stops whitespace-only input being accepted, and limits guessing within one session. |
| v3 | Subroutines with parameters and return values, and a `main()` coordinator. | Each part can be tested on its own. Validation, checking and display are kept apart. |
| v4 | Allow-list sanitisation (`isalnum()`) of usernames, and a dictionary of users. | Removes characters used in markup or delimiters. An allow-list is safer than a block-list, because it does not need to anticipate every bad character. |
| v4 | Hashing with a custom function, with the digests stored as literals. | Demonstrates one-way verification. The custom hash is shown to be weak, which motivates v5. |
| v5 | SHA-256 from `hashlib`, UTF-8 encoding, and `getpass` with a fallback. | A standard, well-tested digest. `getpass` stops the password being shown on screen. The fallback keeps the program working where `getpass` cannot hide input. |
| v5 | Blank input is rejected before the comparison and does not use an attempt. | Prevents an empty string from matching anything, and avoids wasting an attempt on a typing error. |
| vFINAL | Three failures trigger a 30-second lockout, and the counter resets afterwards. | Slows automated guessing to about six guesses a minute from one running program. |
| vFINAL | `hmac.compare_digest()` for the comparison. | Takes the same time whether the digests differ at the first or last character, which removes a timing side channel. |
| vFINAL | Log entries are appended, timestamped, and contain no passwords. | Gives accountability (who did what, and when) without storing secrets. Append mode stops earlier entries being overwritten. |

---

## 4. Test cases: expected and actual results

All tests use simulated data. Run them with `python -m unittest discover -s tests -v`. The output of the run described here: **34 tests, OK, expected failures = 2, duration about 30 seconds.**

"Expected" is the result required by the brief, or the result the design should give. "Actual" is what the program produced in the test run.

### Version 1

| ID | Test | Simulated input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-V1-01 | A correct login succeeds | `admin` / `Password123` | "Access Granted" | "Access Granted: Welcome to the system." | Pass |
| TC-V1-02 | A wrong password fails | `admin` / `wrongpass` | "Access Denied" | "Access Denied: Invalid credentials." | Pass |
| TC-V1-03 | A wrong username fails | `guest` / `Password123` | "Access Denied" | "Access Denied: Invalid credentials." | Pass |

### Version 2

| ID | Test | Simulated input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-V2-01 | A blank username is rejected | `"   "`, then `admin` / `Password123` | Validation error, then granted, with no second attempt counted | "Validation Error: Username cannot be blank.", then "Access Granted"; "Attempt 2 of 3" not shown | Pass |
| TC-V2-02 | A blank password is rejected | `admin` / `""`, then `Password123` | Validation error, then granted | "Validation Error: Password cannot be blank.", then "Access Granted" | Pass |
| TC-V2-03 | Three wrong attempts lock out | `admin` / `wrong` three times, then the correct password | Program ends after the third failure, with no fourth prompt | "Maximum attempts exceeded. Program terminating."; "Attempt 4 of 3" not shown; no grant | Pass |

### Version 3 (each subroutine tested alone)

| ID | Test | Input | Returned value | Actual | Result |
|---|---|---|---|---|---|
| TC-V3-01 | `get_non_empty_input` rejects blank and trims | `"   "`, then `"  alice  "` | `"alice"` | `"alice"`, with the validation message printed | Pass |
| TC-V3-02 | `validate_credentials` accepts the correct pair | `("admin", "Password123")` | `True` | `True` | Pass |
| TC-V3-03 | `validate_credentials` rejects wrong or differently cased input | `("admin", "wrong")`, `("ADMIN", "Password123")` | `False`, `False` | `False`, `False` | Pass |
| TC-V3-04 | `display_status` prints the right message | `(False, 2)`, `(False, 0)`, `(True, 2)` | `None` each time | "Remaining attempts: 2"; "Maximum login attempts exceeded"; "Access Granted" | Pass |
| TC-V3-05 | `main` locks out after three failures | `admin` / `x` three times | Messages for 2 remaining, 1 remaining, then critical | As expected | Pass |
| TC-V3-06 | `main` succeeds on the second attempt | `admin` / `x`, then `admin` / `Password123` | "Authentication Successful" | As expected | Pass |

### Version 4

| ID | Test | Simulated input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-V4-01 | Sanitiser removes `< > : "` | `'<Ad>:"min"'`; and `a<b`, `a>b`, `a:b`, `a"b` | `"admin"`; `"ab"` each time | `"admin"`; `"ab"` each time | Pass |
| TC-V4-02 | `"ab"` and `"ba"` give the same hash (brief's example) | `"ab"`, `"ba"` | Same hash | **Different:** `0x597728` and `0x597748` | **Discrepancy with brief.** The test asserts the actual behaviour. |
| TC-V4-03 | A collision exists | `"aB"`, `"b!"` | Same hash | `0x597708` and `0x597708` | Pass |
| TC-V4-04 | `get_credentials` sanitises and re-prompts | `'<>:"'`, `AdMiN`, `SuperAdmin999` | `("admin", "SuperAdmin999")` | As expected, with the validation message | Pass |
| TC-V4-05 | `authenticate` accepts correct and rejects wrong and unknown | `alice`/`AliceSecure#1`; `alice`/`wrong`; `carol`/`AliceSecure#1` | `True`, `False`, `False` | `True`, `False`, `False` | Pass |
| TC-V4-06 | No plain-text password in the database or source | Search for the three passwords | Not found | Not found | Pass |

### Version 5

| ID | Test | Simulated input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-V5-01 | The correct password matches its stored SHA-256 digest | `Wonderland2024!` | Digest equals stored value | Equal | Pass |
| TC-V5-02 | A wrong password does not match | `Wonderland2025!` | No match; `authenticate` returns `False` | No match; `False` | Pass |
| TC-V5-03 | Digest is 64 hexadecimal characters | `Wonderland2024!` | Length 64, hexadecimal only | Length 64, hexadecimal only | Pass |
| TC-V5-04 | No plain-text password is printed | `alice`; getpass returns `Wonderland2024!` | "Login Verified" and the password absent from output | "Login Verified"; password absent | Pass |
| TC-V5-05 | Blank entries are rejected without using an attempt | Blank, then `alice` / `Wonderland2024!` | "All fields are required", then verified | As expected | Pass |
| TC-V5-06 | `getpass` failure falls back to `input()` | getpass raises; `alice`, `Wonderland2024!` | `("alice", "Wonderland2024!")` | As expected | Pass |
| TC-V5-07 | Source contains no plain-text password | Search the source for three passwords | Not found | Not found | Pass |

### Version FINAL

| ID | Test | Simulated input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-VF-01 | Three failures lock out for 30 seconds (real time) | `admin` / `wrong` three times, then the correct password | Lockout message; at least 30 s elapsed; access granted | "System locked for 30 seconds."; elapsed **30.03 s**; "Access Granted" | Pass |
| TC-VF-02 | The countdown totals 30 seconds | `enforce_lockout()` with `time.sleep` patched | Sleep total 30 | Sleep total 30 | Pass |
| TC-VF-03 | Each event is logged with a timestamp | Two log events | Two lines matching the timestamp format | As expected | Pass |
| TC-VF-04 | No password appears in the log | `guess1`, `guess2`, then the correct password | Events logged; no password in the log | Events logged; no password found | Pass |
| TC-VF-05 | Lockout then successful login | `alice` / `x` three times, then the correct password | One `ACCOUNT_LOCKOUT`, three `LOGIN_FAILURE`, then granted | As expected | Pass |
| TC-VF-06 | `verify_login` accepts correct and rejects wrong and unknown | Correct, wrong, unknown | `True`, `False`, `False` | `True`, `False`, `False` | Pass |
| TC-VF-07 | Source contains no plain-text password | Search the source for three passwords | Not found | Not found | Pass |
| TC-VF-08 | **Known gap:** the lockout applies per account, as the brief asks | `alice` / `x` three times, then `bob` / correct password | `bob` is not blocked by `alice`'s lockout | "System locked" is shown, so `bob` is blocked too | **Expected failure.** The gap is confirmed. |
| TC-VF-09 | **Known gap:** a password typed in the username box is not logged | Correct password in the username box, then the correct credentials | The password does not appear in the log | Logged in lower case: `wonderland2024!` | **Expected failure.** The gap is confirmed. |

**Summary:** 32 tests pass. 2 expected failures (TC-VF-08 and TC-VF-09) confirm the gaps listed in section 2. 1 discrepancy with the brief (TC-V4-02). The brief's example for `"ab"` and `"ba"` is not correct for this hash function.

---

## 5. Security evaluation by version

For each version: one attack it stops, and one attack it does not stop. Further gaps follow where useful.

### v1: Basic prototype

- **Stops:** A casual user who guesses a password once. The program ends after one attempt, so there is no repeated guessing within a session.
- **Does not stop:** Reading the source file. The password `Password123` is stored in plain text and anyone with the file has it. Re-running the script also gives unlimited new attempts.

### v2: Input validation and retry loop

- **Stops:** Online guessing within one session, because the program ends after three failures (TC-V2-03). Blank and whitespace-only input is rejected (TC-V2-01 and TC-V2-02).
- **Does not stop:** Restarting the program. Each run gives three new attempts, so the limit is easy to get around. The password is still plain text.

### v3: Modular design

- **Stops:** Whitespace-only credentials, because `get_non_empty_input` trims input and rejects blanks (TC-V3-01). The three-attempt limit is kept (TC-V3-05).
- **Does not stop:** Reading the source, or restarting to reset attempts. Modular structure makes the code easier to test but adds no new security control.

### v4: Data validation and custom hashing

- **Stops:** Characters such as `< > : "` in usernames, which are removed before the lookup (TC-V4-01). Plain-text passwords are not in the source or the database after the change in section 2 (TC-V4-06).
- **Does not stop:** Offline guessing. The custom hash is fast and easy to invert by brute force. It is also not collision-resistant: `"aB"` and `"b!"` give the same value (TC-V4-03). Anyone holding `USER_DATABASE` can recover short passwords quickly.
- **Further gaps:** Sanitising usernames removes characters, so `"a dmin"` is treated as `"admin"`. The password is not sanitised.

### v5: SHA-256 hashing with hashlib

- **Stops:** Disclosure of plain-text passwords from the source file, because only digests are stored (TC-V5-07). Shoulder surfing, because `getpass` hides typed input (TC-V5-04).
- **Does not stop:** Offline dictionary attack. The digests are unsalted and SHA-256 is fast. A common password such as `Password123` can be checked against a stored digest in well under a second. Precomputed tables of common digests make this faster still.
- **Further gaps:** No lockout, so an attacker can make unlimited attempts by restarting. Blank submissions are not counted, so they can be repeated without limit.

### vFINAL: Brute-force protection and secure logging

- **Stops:** Online brute-force guessing within one running program. Three failures trigger a 30-second lockout (TC-VF-01). Password comparison is constant-time (`hmac.compare_digest`), which removes a timing side channel. Passwords are kept out of the audit log (TC-VF-04).
- **Does not stop:** Offline cracking of a leaked `USER_DATABASE`. The digests are unsalted SHA-256, so the attack is the same as in v5, and a leaked digest can be attacked at full speed with no lockout.
- **Further gaps:**
  - **Restart bypass:** the failure counter is held in memory, so restarting the program clears it.
  - **Denial of service:** the lockout is global (TC-VF-08). One attacker can lock out every user for 30 seconds at a time.
  - **Log injection and accidental logging:** usernames are logged as entered, so a password typed in the username box is recorded (TC-VF-09). Control characters are not removed before logging.
  - **Username enumeration:** `verify_login` returns straight away for an unknown username, so it is slightly faster than for a known one. The response text is the same in both cases.

---

## 6. Limitations of Trinket.io compared with local development

I have not run this project on Trinket.io, so the points below are based on the brief and on how the code depends on the environment. Check each one on Trinket before submitting, and edit this section to reflect what you observed.

1. **Masked password input.** The brief says `getpass` may fail in restricted online IDEs, and v5 uses a `try` / `except` fallback for this reason. On Trinket the password may be visible as it is typed, so the shoulder-surfing protection in v5 and vFINAL cannot be demonstrated there. It can be shown locally.
2. **`hmac` and other modules.** The brief says full library support, including `getpass` and `hmac`, is available locally. Trinket may not provide `hmac`, so vFINAL will probably need to be run locally.
3. **File handling and the audit log.** `security_audit.log` is written in the working directory. An online sandbox may not allow files to be written, may not keep them between runs, or may not let you read them back. The logging evidence should be captured locally.
4. **Timing.** `time.sleep(5)` six times gives the 30-second lockout. Online sandboxes may limit how long a program can run or pause, and may not measure the delay accurately. Local runs measured 30.03 seconds.
5. **Testing.** The `unittest` suite and `unittest.mock` need a local Python installation. They cannot be run in a typical browser-based editor, so the test cases in section 4 were run locally only.
6. **Privacy of code.** Trinket projects can be shared by link. Any password written in the code is visible to anyone who has the link. Local development keeps the project private until it is published.
7. **Input behaviour.** `input()` in a browser console may handle trailing spaces, empty entries and cancelled input differently from a terminal. The validation rules in v2 to vFINAL should be checked against the Trinket behaviour.

---

## 7. How to reproduce the tests

Requirements: Python 3.8 or newer. The tests use only the standard library. They were run on Python 3.13.

```bash
python -m unittest discover -s tests -v
```

The run takes about 30 seconds, because test `test_tc_vf_01` waits for the real 30-second lockout.

To run the programs themselves:

```bash
python src/login_v1_DavidForbes.py
python src/login_v2_DavidForbes.py
python src/login_v3_DavidForbes.py
python src/login_v4_DavidForbes.py
python src/login_v5_DavidForbes.py
python src/login_vFINAL_DavidForbes.py
```

Test accounts for v4, v5 and vFINAL are the simulated accounts in the test files. Use `alice` / `Wonderland2024!`, `bob` / `BuilderSafe!99` and `admin` / `HSC_Software_Eng_2025!` for v5 and vFINAL, and `alice` / `AliceSecure#1`, `bob` / `BobPassword!9` and `admin` / `SuperAdmin999` for v4.

### Use of AI assistance and sources

An AI coding assistant (Claude Code) was used to draft the test files and this diary. The code was run, the tests were executed, and the results in section 4 come from those runs. Where the assistant found a problem, it was checked by running the code before any change was made.

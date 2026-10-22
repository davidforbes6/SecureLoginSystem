/*
 * Lesson content for each version: the theory, quiz questions and lab to use.
 * Course references follow the HSC Software Engineering brief.
 */
(function (root) {
  "use strict";

  const REPO_SRC = "https://github.com/davidforbes6/SecureLoginSystem/blob/main/src/";

  const VERSIONS = [
    {
      id: "v1",
      tab: "🔴 v1",
      program: "v1",
      file: "login_v1_DavidForbes.py",
      title: "Basic prototype",
      summary:
        "One if / else check of a single username and password. The program runs top to bottom and ends after one attempt.",
      gaps: "The password is stored in plain text in the source file.",
      hints: [["admin", "Password123"]],
      outcomes: ["SE-12-07"],
      concepts: [
        {
          term: "Sequence",
          text: "The program runs one line after another, from top to bottom. It asks for two inputs, makes one decision and prints one message.",
          where: "The top level of the file. Brief p.15",
        },
        {
          term: "Binary selection",
          text: "if / else chooses one of two paths. The condition is either True or False.",
          where: "The final if / else. Brief p.15",
        },
        {
          term: "Logical operators",
          text: "or is True if either side is True. != means 'not equal'. Together they reject the login if either credential is wrong.",
          where: "The if condition. Brief p.22",
        },
        {
          term: "Plain-text storage",
          text: "The password is written directly in the source. Anyone who can read the file can log in. The later versions remove this weakness.",
          where: "STORED_PASSWORD",
        },
      ],
      quiz: [
        {
          q: "Which operator makes the whole check fail if either the username or the password is wrong?",
          options: ["and", "or", "not", "=="],
          answer: 1,
          why: "or is True when either side is True, so the Access Denied branch runs if either credential is wrong.",
        },
        {
          q: "Where can a person find the password in v1?",
          options: ["Only in their own memory", "In the source file, in plain text", "In a hashed database", "In the log file"],
          answer: 1,
          why: "The password is written in the source as STORED_PASSWORD. Hashing (v4 onwards) removes this problem.",
        },
      ],
      lab: "v1-truth",
    },
    {
      id: "v2",
      tab: "🟠 v2",
      program: "v2",
      file: "login_v2_DavidForbes.py",
      title: "Input validation and retry loop",
      summary:
        "Blank input is rejected and the user is asked again. Three attempts are allowed, counted with a while loop and a .format() message.",
      gaps: "The password is still plain text, and restarting the program gives three new attempts.",
      hints: [
        ["admin", "Password123"],
        ["Try", "A blank username or password, or spaces only"],
      ],
      outcomes: ["SE-12-07", "SE-12-08"],
      concepts: [
        {
          term: "Pre-test repetition (while)",
          text: "The loop checks before every attempt: are attempts left, and is the user still not logged in? Both must be True for another attempt.",
          where: "The while condition. Brief pp.17–18",
        },
        {
          term: "Input validation",
          text: "Check input before using it. strip() removes spaces at each end, so three spaces become an empty string, which is then rejected.",
          where: "The .strip() calls and the inner while loops. Brief pp.17–18",
        },
        {
          term: "Counter tracking",
          text: "attempts goes up after each failure. remaining tells the user how many tries are left.",
          where: "attempts and remaining",
        },
        {
          term: "Limitation: state in memory",
          text: "The counter exists only while the program runs. Restarting the program sets it back to zero, so this limit can be bypassed.",
          where: "attempts = 0 at the start",
        },
      ],
      quiz: [
        {
          q: "Why is '   ' (three spaces) rejected by v2?",
          options: ["It is too short", "strip() turns it into an empty string", "Spaces are not allowed in any input", "The loop never runs"],
          answer: 1,
          why: "strip() removes the spaces, leaving '', and the blank check then rejects it.",
        },
        {
          q: "What does the attempts counter stop?",
          options: [
            "Typing errors on the first try",
            "Unlimited guesses within one run of the program",
            "Anyone reading the source code",
            "Hashing the password",
          ],
          answer: 1,
          why: "After three failures the loop ends. The counter does not stop someone who restarts the program.",
        },
      ],
      lab: "v2-blank",
    },
    {
      id: "v3",
      tab: "🟡 v3",
      program: "v3",
      file: "login_v3_DavidForbes.py",
      title: "Modular design",
      summary:
        "The program is split into get_non_empty_input, validate_credentials and display_status. All three are called from main().",
      gaps: "Modular structure makes the code easier to test, but it adds no new security control.",
      hints: [["admin", "Password123"]],
      outcomes: ["SE-12-07", "SE-12-08"],
      concepts: [
        {
          term: "Subroutines with parameters and returns",
          text: "A subroutine is a named block of code. Parameters go in, and a return value comes out. validate_credentials returns True or False.",
          where: "Each def in the file. Brief pp.19–21",
        },
        {
          term: "Mainline algorithm",
          text: "main() reads like a plan. It calls the helpers in order and holds little detail itself.",
          where: "def main(). Brief p.14",
        },
        {
          term: "Local scope",
          text: "Variables created inside a function exist only while it runs. Other parts of the program cannot change them by accident.",
          where: "username and password inside main()",
        },
        {
          term: "Testability",
          text: "validate_credentials takes inputs and returns a value. It does not call input() or print(), so a test can call it directly.",
          where: "tests/test_v3.py",
        },
      ],
      quiz: [
        {
          q: "What makes validate_credentials easy to test on its own?",
          options: [
            "It uses global print statements",
            "It takes inputs and returns a value, with no input() call",
            "It is called from main()",
            "It never returns anything",
          ],
          answer: 1,
          why: "A function with no input() or print() depends only on its parameters, so a test can give it values and check the result.",
        },
        {
          q: "What happens to variables created inside a function when it returns?",
          options: [
            "They are saved to a file",
            "They are discarded, because they are local to that function",
            "They become global variables",
            "They are sent to main() automatically",
          ],
          answer: 1,
          why: "Local variables exist only during the call. Only the return value leaves the function.",
        },
      ],
      lab: "v3-playground",
    },
    {
      id: "v4",
      tab: "🟢 v4",
      program: "v4",
      file: "login_v4_DavidForbes.py",
      title: "Sanitisation, dictionary and custom hash",
      summary:
        "Usernames are cleaned to letters and digits only. Users are held in a dictionary, and passwords are compared as a custom hash, so the password itself is never stored.",
      gaps: "The custom hash is weak. It is fast, has no salt and gives collisions. Myth or fact: the brief says 'ab' and 'ba' match. They do not, but 'aB' and 'b!' do.",
      hints: [
        ["alice", "AliceSecure#1"],
        ["bob", "BobPassword!9"],
        ["admin", "SuperAdmin999"],
        ["Try", "A-l-i-c-e. The symbols are removed before the lookup"],
      ],
      outcomes: ["SE-12-04", "SE-12-07"],
      concepts: [
        {
          term: "Character codes",
          text: "ord(char) gives the number behind a character: 'a' is 97. Computers store text as numbers, and the hash works on those numbers.",
          where: "generate_custom_hash. Brief p.31",
        },
        {
          term: "Dictionary lookup",
          text: "USER_DATABASE links each username to its stored value. Lookup by key is fast, even with many users. Brief p.32",
          where: "USER_DATABASE and authenticate(). Brief p.32",
        },
        {
          term: "Allow-list sanitisation",
          text: "isalnum() keeps only letters and digits, and everything else is removed. An allow-list is safer than trying to block every bad character.",
          where: "sanitise_username",
        },
        {
          term: "One-way check",
          text: "Store what the password hashes to, not the password. To log in, hash what was typed and compare the results.",
          where: "authenticate()",
        },
        {
          term: "Why this hash is weak",
          text: "It is not cryptographic. It is fast to run, has no salt and produces collisions: different inputs with the same result. The lab shows one.",
          where: "The hash loop",
        },
      ],
      quiz: [
        {
          q: "What does ord('a') return?",
          options: ["'a'", "97", "1", "'A'"],
          answer: 1,
          why: "ord() returns the Unicode code point. 'a' is 97.",
        },
        {
          q: "Does 'ab' hash to the same value as 'ba' in v4?",
          options: ["Yes, always", "No. The order matters, so they differ", "Only when sanitised", "Only in the lab"],
          answer: 1,
          why: "They give 0x597728 and 0x597748, so the brief's claim is not correct. 'aB' and 'b!' do collide.",
        },
        {
          q: "Why is a custom hash like this unsuitable for real passwords?",
          options: [
            "It is too slow",
            "It is fast, and collisions are easy to find",
            "It produces letters, not numbers",
            "It cannot be stored in a dictionary",
          ],
          answer: 1,
          why: "A fast hash lets an attacker test many guesses quickly, and collisions mean different passwords can match.",
        },
      ],
      lab: "v4-hash",
    },
    {
      id: "v5",
      tab: "🔵 v5",
      program: "v5",
      file: "login_v5_DavidForbes.py",
      title: "SHA-256 hashing and hidden input",
      summary:
        "Passwords are stored as SHA-256 digests with hashlib, and typed with hidden input through getpass. Blank entries are rejected without using an attempt.",
      gaps: "SHA-256 with no salt is fast. Anyone with a stolen digest can test common passwords quickly.",
      hints: [
        ["alice", "Wonderland2024!"],
        ["bob", "BuilderSafe!99"],
        ["admin", "HSC_Software_Eng_2025!"],
      ],
      outcomes: ["SE-12-04"],
      concepts: [
        {
          term: "Standard libraries",
          text: "import hashlib brings in tested, standard cryptography. Do not write your own cryptography for real use.",
          where: "The import lines. Brief p.32",
        },
        {
          term: "SHA-256 properties",
          text: "Always 64 hexadecimal characters. The same input gives the same output. A tiny change gives a completely different output (the avalanche effect). It cannot be reversed by calculation, only guessed.",
          where: "hash_password()",
        },
        {
          term: "Encoding",
          text: "encode('utf-8') turns text into bytes first. Hash functions work on bytes, not on characters.",
          where: "hash_password()",
        },
        {
          term: "Hidden input",
          text: "getpass stops the password appearing on screen, which protects against shoulder surfing.",
          where: "get_secure_input()",
        },
        {
          term: "Salt and slow hashing",
          text: "A salt is random data added to each password, so equal passwords give different digests. Real systems also use slow functions such as bcrypt, scrypt or Argon2.",
          where: "Not in this version. The diary covers it.",
        },
      ],
      quiz: [
        {
          q: "Given a SHA-256 digest, what is the practical way to recover the password?",
          options: [
            "Reverse the hash formula",
            "Guess passwords, hash each guess and compare",
            "Read the digest aloud",
            "Use the sanitiser",
          ],
          answer: 1,
          why: "There is no reverse formula. An attacker hashes guesses and compares them with the stored digest.",
        },
        {
          q: "What does the avalanche effect mean?",
          options: [
            "A tiny change in the input gives a completely different digest",
            "The hash gets longer",
            "The password is sorted",
            "The input is sent over the network",
          ],
          answer: 0,
          why: "Changing one character changes about half of the 256 output bits, so the digests look unrelated.",
        },
        {
          q: "Why is a salt used?",
          options: [
            "To make hashing faster",
            "So the same password gives different digests, which defeats precomputed tables",
            "To hide the username",
            "To stop typing errors",
          ],
          answer: 1,
          why: "With a salt, an attacker cannot reuse one precomputed table for every account.",
        },
      ],
      lab: "v5-sha",
    },
    {
      id: "vFINAL",
      tab: "🟣 vFINAL",
      program: "vFINAL",
      file: "login_vFINAL_DavidForbes.py",
      title: "Brute-force protection and secure logging",
      summary:
        "Three failures lock the system for 30 seconds. Passwords are compared with hmac.compare_digest, and every event is written to a timestamped audit log that never records passwords.",
      gaps: "Known gaps: the lockout applies to the whole system, not one account, and a password typed into the username box is written to the log.",
      hints: [
        ["alice", "Wonderland2024!"],
        ["bob", "BuilderSafe!99"],
        ["admin", "HSC_Software_Eng_2025!"],
        ["Try", "Three wrong passwords, then wait 30 seconds"],
      ],
      hasLog: true,
      outcomes: ["SE-12-04", "SE-12-08"],
      concepts: [
        {
          term: "File handling (append)",
          text: "open(..., 'a') adds to the end of the file, so earlier records are kept. The with block closes the file automatically.",
          where: "log_security_event(). Brief p.32",
        },
        {
          term: "Accountability",
          text: "Each event has a timestamp, a type and a user, so you can see what happened and when. A log must never hold secrets.",
          where: "The log entry format",
        },
        {
          term: "Rate limiting",
          text: "After three failures the program waits 30 seconds. That slows guessing. The brute-force lab shows the effect.",
          where: "enforce_lockout()",
        },
        {
          term: "Timing attacks",
          text: "A normal == stops at the first different character, so timing can reveal how much of a guess was right. hmac.compare_digest takes the same time whatever the difference.",
          where: "verify_login()",
        },
        {
          term: "Trade-offs",
          text: "A lockout can be abused: one attacker can lock out every user (denial of service). Because the counter is in memory, restarting the program clears it.",
          where: "The gaps listed above",
        },
      ],
      quiz: [
        {
          q: "What does hmac.compare_digest protect against?",
          options: ["Timing attacks", "SQL injection", "Typing mistakes", "Tampering with the log"],
          answer: 0,
          why: "It compares every character in constant time, so the time taken does not reveal how much matched.",
        },
        {
          q: "Why must passwords never be written to the audit log?",
          options: [
            "Logs are too small",
            "Anyone who can read the log could get the password",
            "It makes the log slower",
            "Timestamps need them",
          ],
          answer: 1,
          why: "A log is often read by more people than the password should reach, so secrets in it are a leak.",
        },
        {
          q: "What is a weakness of a system-wide lockout?",
          options: [
            "It makes the system faster",
            "One attacker can lock out every user (denial of service)",
            "It stops correct logins forever",
            "It uses too much memory",
          ],
          answer: 1,
          why: "Because the lock applies to everyone, one attacker can keep the whole system locked.",
        },
      ],
      lab: "vfinal-race",
    },
  ];

  const GLOSSARY = [
    ["Plain text", "Data stored or shown exactly as typed, with no protection."],
    ["Hash", "A fixed-length fingerprint of data. The same input always gives the same output, and it cannot be reversed by calculation."],
    ["Digest", "The output of a hash function, for example a 64-character SHA-256 value."],
    ["Salt", "Random data added to a password before hashing, so equal passwords give different digests."],
    ["Collision", "Two different inputs that give the same hash."],
    ["Brute force", "Trying every possible password until one works."],
    ["Dictionary attack", "Trying a list of likely passwords instead of every possibility."],
    ["Sanitisation", "Removing characters that are not allowed, before the input is used."],
    ["Validation", "Checking that input is in the expected form before using it."],
    ["Lockout / rate limiting", "Slowing or stopping attempts after too many failures."],
    ["Timing attack", "Learning a secret from how long an operation takes."],
    ["Shoulder surfing", "Someone watching the screen while a password is typed."],
    ["Audit log", "A timestamped record of events, used to hold people accountable. It must not contain secrets."],
    ["Denial of service", "Stopping legitimate users from using a system."],
  ];

  const api = { VERSIONS: VERSIONS, GLOSSARY: GLOSSARY, REPO_SRC: REPO_SRC };
  root.LessonContent = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

# SecureLoginSystem

A login system in Python, built in six versions. Each version adds one more secure coding practice, from a basic prototype (v1) to a version with brute-force protection and secure logging (vFINAL).

This repository is built for the NSW HSC Software Engineering *Secure Architecture* project. It is also a **practice space for Git**: a real project with a real history, pull requests and a live website to explore.

## Start here

| If you want to… | Go to |
|---|---|
| Try each version in your browser, with theory, labs and quizzes | [The live site](https://davidforbes6.github.io/SecureLoginSystem/) |
| Learn Git by doing it on this project | [`docs/GIT_LEARNING.md`](docs/GIT_LEARNING.md) |
| Read the code | [`src/`](src/) (one file per version) |
| See how the project was built, step by step | [`docs/PROCESS_DIARY.md`](docs/PROCESS_DIARY.md) |
| Check the tests | [`tests/`](tests/) and [Running the tests](#running-the-tests) |

**Students:** please make your own copy first (click **Fork**, top right) and practise there. See [`docs/GIT_LEARNING.md`](docs/GIT_LEARNING.md), Part 0.

## History of this project

| Pull request | What it added |
|---|---|
| [#1](https://github.com/davidforbes6/SecureLoginSystem/pull/1) | The six login versions, the unit tests, the process diary and the data dictionary |
| [#2](https://github.com/davidforbes6/SecureLoginSystem/pull/2) | The live website, with theory, interactive labs and quizzes for each version |
| This pull request | Git learning guide, updated descriptions and class-ready documentation |

## Versions

| Version | File | Adds |
|---|---|---|
| 🔴 v1 | `src/login_v1_DavidForbes.py` | Basic prototype: one `if` / `else` check |
| 🟠 v2 | `src/login_v2_DavidForbes.py` | Input validation and a three-attempt retry loop |
| 🟡 v3 | `src/login_v3_DavidForbes.py` | Modular design: separate subroutines for input, validation and output |
| 🟢 v4 | `src/login_v4_DavidForbes.py` | Input sanitisation, a user dictionary, and a custom hash |
| 🔵 v5 | `src/login_v5_DavidForbes.py` | SHA-256 hashing with `hashlib`, and masked password input with `getpass` |
| 🟣 vFINAL | `src/login_vFINAL_DavidForbes.py` | 30-second lockout after three failures, `hmac.compare_digest`, and a timestamped security log |

## Running a version

Requires Python 3.8 or newer. No third-party packages are needed.

```bash
python src/login_v5_DavidForbes.py
```

Simulated test accounts are listed in [`docs/PROCESS_DIARY.md`](docs/PROCESS_DIARY.md#7-how-to-reproduce-the-tests). They are for testing only.

## Live demo (GitHub Pages)

[`index.html`](index.html) is a guided lesson for each version. You can run it in the browser, read the theory, try an interactive lab (for example a SHA-256 explorer or a brute-force calculator), and answer a short quiz. Progress is saved in your browser. It has no build step and no dependencies.

The live site is at **https://davidforbes6.github.io/SecureLoginSystem/**

To publish your own copy (for example on your fork):

1. On GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder, then save.

The site appears at `https://davidforbes6.github.io/SecureLoginSystem/` after a minute or two.

The browser code (`assets/versions.js`) follows the Python files, and its output was checked against them. The Python files remain the source of truth.

## Running the tests

```bash
python -m unittest discover -s tests -v
```

The suite has 34 tests and takes about 30 seconds, because one test waits for the real 30-second lockout. Two tests are marked as expected failures. They record known gaps against the brief, described in the diary.

## Documentation

- [`docs/GIT_LEARNING.md`](docs/GIT_LEARNING.md): a hands-on Git guide using this project. Covers forks, branches, commits, pull requests, undoing mistakes and merge conflicts.
- [`docs/PROCESS_DIARY.md`](docs/PROCESS_DIARY.md): process diary for each version, test cases with expected and actual results, security evaluation, and Trinket.io limitations.
- [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md): every variable, constant and parameter, with its type and purpose.

## Repository layout

```
index.html    the live teaching site
assets/       JavaScript for the site (terminal, labs, quizzes, content)
src/          one file per version (the deliverables)
tests/        unittest suite, with simulated data only
docs/         Git guide, process diary and data dictionary
```

## Safety note

All passwords in this project are simulated, for teaching only. Never commit real passwords, keys or personal data to any repository.

## Notes

- Files are named `DavidForbes` in place of the brief's `StudentName`.
- In v4, v5 and vFINAL the supplied code was corrected where it broke the brief's own rules (plain-text passwords in source, and digests that did not match the documented passwords). Section 2 of the diary lists each change.
- The v5 and vFINAL lockout and log designs have known gaps, recorded as expected-failure tests and explained in the diary.
- The audit log `security_audit.log` is created in the working directory when vFINAL runs. It is ignored by git.

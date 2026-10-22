# SecureLoginSystem

A login system in Python, built in six versions. Each version adds one more secure coding practice, from a basic prototype (v1) to a version with brute-force protection and secure logging (vFINAL).

Built for the NSW HSC Software Engineering *Secure Architecture* project.

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

## Running the tests

```bash
python -m unittest discover -s tests -v
```

The suite has 34 tests and takes about 30 seconds, because one test waits for the real 30-second lockout. Two tests are marked as expected failures. They record known gaps against the brief, described in the diary.

## Documentation

- [`docs/PROCESS_DIARY.md`](docs/PROCESS_DIARY.md): process diary for each version, test cases with expected and actual results, security evaluation, and Trinket.io limitations.
- [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md): every variable, constant and parameter, with its type and purpose.

## Repository layout

```
src/      one file per version (the deliverables)
tests/    unittest suite, with simulated data only
docs/     process diary and data dictionary
```

## Notes

- Files are named `DavidForbes` in place of the brief's `StudentName`.
- In v4, v5 and vFINAL the supplied code was corrected where it broke the brief's own rules (plain-text passwords in source, and digests that did not match the documented passwords). Section 2 of the diary lists each change.
- The v5 and vFINAL lockout and log designs have known gaps, recorded as expected-failure tests and explained in the diary.
- The audit log `security_audit.log` is created in the working directory when vFINAL runs. It is ignored by git.

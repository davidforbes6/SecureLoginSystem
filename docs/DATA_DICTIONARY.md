# Data Dictionary

Every variable, constant and parameter used in the six version files. Types are Python types.
Constants are written in capitals. Local variables and parameters are listed under the function
that owns them.

- **Scope key:** *Global* = module level. *Local* = inside the named function. *Param* = a function parameter.

---

## Version 1: `src/login_v1_DavidForbes.py`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `STORED_USERNAME` | `str` | Global constant | The one valid username (`"admin"`). Stored in plain text, as the prototype requires. |
| `STORED_PASSWORD` | `str` | Global constant | The one valid password (`"Password123"`). Stored in plain text, which is a known weakness. |
| `entered_username` | `str` | Global | Text typed by the user at the username prompt. Not stripped, not validated. |
| `entered_password` | `str` | Global | Text typed by the user at the password prompt. Not stripped, not validated. |

---

## Version 2: `src/login_v2_DavidForbes.py`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `STORED_USERNAME` | `str` | Global constant | The valid username (`"admin"`). |
| `STORED_PASSWORD` | `str` | Global constant | The valid password (`"Password123"`), in plain text. |
| `MAX_ATTEMPTS` | `int` | Global constant | Number of failed attempts allowed before the program ends (3). |
| `attempts` | `int` | Global | Count of failed attempts so far. Starts at 0. Drives the loop condition. |
| `authenticated` | `bool` | Global | `True` once the credentials match. Stops the loop. |
| `entered_username` | `str` | Global | Trimmed username from the user. Re-prompted while empty. |
| `entered_password` | `str` | Global | Trimmed password from the user. Re-prompted while empty. |
| `remaining` | `int` | Global | Attempts left after a failure. Used in the message text. |

---

## Version 3: `src/login_v3_DavidForbes.py`

### Constants

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `STORED_USERNAME` | `str` | Global constant | The valid username (`"admin"`). |
| `STORED_PASSWORD` | `str` | Global constant | The valid password (`"Password123"`), in plain text. |
| `MAX_ATTEMPTS` | `int` | Global constant | Maximum login attempts (3). |

### `get_non_empty_input(prompt_text)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `prompt_text` | `str` | Param | The question shown to the user, for example `"Username: "`. |
| `user_input` | `str` | Local | Trimmed text from the user. Re-read until it is not empty. |

Returns: `str`, the trimmed non-empty text.

### `validate_credentials(username, password)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `username` | `str` | Param | Username to check. |
| `password` | `str` | Param | Password to check. |

Returns: `bool`. `True` only if both match the stored values exactly (case-sensitive).

### `display_status(is_authenticated, remaining_attempts)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `is_authenticated` | `bool` | Param | Result of the last check. |
| `remaining_attempts` | `int` | Param | Attempts left. `0` triggers the critical message. |

Returns: `None`. Prints the status message.

### `main()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `attempts` | `int` | Local | Attempts made so far. |
| `authenticated` | `bool` | Local | Whether the last attempt succeeded. |
| `username` | `str` | Local | Username returned by `get_non_empty_input`. |
| `password` | `str` | Local | Password returned by `get_non_empty_input`. |

---

## Version 4: `src/login_v4_DavidForbes.py`

### Constants

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `USER_DATABASE` | `dict[str, str]` | Global constant | Maps each lower-case username to its custom hash string (for example `"0x5a834c7e"`). Holds no plain-text passwords. |
| `MAX_ATTEMPTS` | `int` | Global constant | Maximum login attempts (3). |

### `generate_custom_hash(plaintext)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `plaintext` | `str` | Param | The password to hash. |
| `hash_value` | `int` | Local | Running hash. Starts at 5381 and is updated for each character. Python integers do not overflow, so the value grows with the length of the input. |
| `char` | `str` | Local | One character of `plaintext` in the loop. |

Returns: `str`, a hexadecimal string of `hash_value` masked to 32 bits (for example `"0x5a834c7e"`).

### `sanitise_username(raw_username)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `raw_username` | `str` | Param | Text exactly as typed. |
| `cleaned` | `str` | Local | Only the letters and digits from `raw_username`, in lower case. |

Returns: `str`, the cleaned username. May be `""`.

### `get_credentials()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `raw_user` | `str` | Local | Trimmed text typed as the username. |
| `clean_user` | `str` | Local | Result of `sanitise_username(raw_user)`. Must not be empty. |
| `password` | `str` | Local | Trimmed password. Must not be empty. Not sanitised. |

Returns: `tuple[str, str]`, `(clean_user, password)`.

### `authenticate(username, password)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `username` | `str` | Param | Cleaned username. |
| `password` | `str` | Param | Password to hash and compare. |

Returns: `bool`.

### `main()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `attempts` | `int` | Local | Attempts made so far. |
| `authenticated` | `bool` | Local | Whether the last attempt succeeded. |
| `user`, `pwd` | `str` | Local | Values returned by `get_credentials()`. |
| `remaining` | `int` | Local | Attempts left after a failure. |

---

## Version 5: `src/login_v5_DavidForbes.py`

### Module and constants

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `hashlib` | module | Global import | Standard library. Provides `sha256`. |
| `getpass` | module | Global import | Standard library. Reads a password without echoing it. |
| `USER_DATABASE` | `dict[str, str]` | Global constant | Maps each username to its 64-character SHA-256 hex digest. No plain-text passwords. |
| `MAX_ATTEMPTS` | `int` | Global constant | Maximum login attempts (3). |

### `hash_password(plaintext_password)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `plaintext_password` | `str` | Param | Password to hash. |
| `encoded_bytes` | `bytes` | Local | UTF-8 bytes of the password. |
| `sha256_hasher` | `hashlib._Hash` | Local | Hash object created from `encoded_bytes`. |

Returns: `str`, a 64-character lower-case hexadecimal digest.

### `get_secure_input()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `username` | `str` | Local | Trimmed, lower-case username. |
| `password` | `str` | Local | Password from `getpass`, or from `input()` if `getpass` fails. |

Returns: `tuple[str, str]`, `(username, password)`.

### `authenticate(username, password)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `username` | `str` | Param | Lower-case username. |
| `password` | `str` | Param | Password to hash. |

Returns: `bool`.

### `main()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `attempts` | `int` | Local | Attempts made so far. Blank submissions do not increase it. |
| `authenticated` | `bool` | Local | Whether the last attempt succeeded. |
| `user`, `pwd` | `str` | Local | Values returned by `get_secure_input()`. |
| `remaining` | `int` | Local | Attempts left after a failure. |

---

## Version FINAL: `src/login_vFINAL_DavidForbes.py`

### Modules and constants

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `hashlib`, `hmac`, `time`, `datetime` | modules | Global import | SHA-256 hashing, constant-time comparison, sleeping, and timestamps. |
| `USER_DATABASE` | `dict[str, str]` | Global constant | Username to SHA-256 hex digest. |
| `LOG_FILE` | `str` | Global constant | File name of the audit log (`"security_audit.log"`), opened in append mode. |
| `MAX_FAILED_ATTEMPTS` | `int` | Global constant | Failures allowed before lockout (3). |
| `LOCKOUT_DURATION_SECONDS` | `int` | Global constant | Length of the lockout (30). |

### `log_security_event(event_type, username, details)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `event_type` | `str` | Param | Event label, for example `"LOGIN_FAILURE"`. |
| `username` | `str` | Param | Username to record. Empty input is recorded as `"ANONYMOUS"`. |
| `details` | `str` | Param | Free-text description. Must never contain a password. |
| `timestamp` | `str` | Local | Current time as `YYYY-MM-DD HH:MM:SS`. |
| `sanitised_user` | `str` | Local | `username`, or `"ANONYMOUS"` if it is empty. |
| `log_entry` | `str` | Local | One formatted line, ending in a newline. |
| `file_handle` | file object | Local | The open log file. |
| `err` | `OSError` (`IOError`) | Local | Error raised if the log cannot be written. |

Returns: `None`.

### `hash_string(plaintext)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `plaintext` | `str` | Param | Text to hash. |

Returns: `str`, the SHA-256 hex digest of the UTF-8 bytes.

### `verify_login(username, password)`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `username` | `str` | Param | Lower-case username. |
| `password` | `str` | Param | Password to check. |
| `candidate_digest` | `str` | Local | SHA-256 digest of `password`. |
| `stored_digest` | `str` | Local | Digest held for `username`. |

Returns: `bool`. Uses `hmac.compare_digest`, so the comparison time does not depend on where the digests differ.

### `enforce_lockout()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `remaining` | `int` | Local (loop variable) | Seconds left shown in the countdown. Goes 30, 25, 20, 15, 10, 5. |

Returns: `None`. Calls `time.sleep(5)` six times, so it waits 30 seconds in total.

### `main()`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `failed_attempts` | `int` | Local | Consecutive failures. Reset to 0 after each lockout. |
| `username_input` | `str` | Local | Trimmed, lower-case username. Logged as entered. |
| `password_input` | `str` | Local | Trimmed password. Never logged. |
| `is_success` | `bool` | Local | Result of `verify_login`. |
| `remaining` | `int` | Local | Failures left before lockout. |

---

## Test support: `tests/helpers.py`

| Name | Type | Scope | Purpose |
|---|---|---|---|
| `SRC_DIR` | `str` | Global constant | Full path of the `src/` folder. |
| `source_path(filename)` | function | Returns `str` | Builds the full path of a version file. |
| `load_version(filename)` | function | Returns `module` | Imports a version file without running its `main()`. |
| `run_script(filename, stdin_text, cwd)` | function | Returns `CompletedProcess` | Runs v1 or v2 as a separate process with simulated keyboard input. |
| `capture_output(function, *args)` | function | Returns `(result, str)` | Calls a function and returns its result and whatever it printed. |

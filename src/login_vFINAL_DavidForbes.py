# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version FINAL: Account Lockout & Tamper-Evident Audit Logging
# =============================================================================

import hashlib
import hmac
import time
from datetime import datetime

USER_DATABASE = {
    "alice": "d2cb6e4e1ec204f3c63cf7e6b24b786944d36b23200ac4cf231c6ffb6cf7d25a",
    "bob":   "df62406b21908ffa86705936896bc1590ab26072886669b72138ba65680c1fb4",
    "admin": "b76797b9918f3a663c1fd197816888edcd4ccff0dfd2bbcc8f5cca4b429c3489"
}

LOG_FILE = "security_audit.log"
MAX_FAILED_ATTEMPTS = 3
LOCKOUT_DURATION_SECONDS = 30


def log_security_event(event_type, username, details):
    """
    Maintains a persistent, timestamped security audit trail using file handling.
    CRITICAL: Never logs entered passwords or confidential credentials.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sanitised_user = username if (username != "") else "ANONYMOUS"

    log_entry = "[{0}] EVENT: {1:<22} | USER: {2:<15} | DETAILS: {3}\n".format(
        timestamp, event_type, sanitised_user, details
    )

    try:
        # Persistent file handling in append mode ('a') with UTF-8 encoding
        with open(LOG_FILE, mode="a", encoding="utf-8") as file_handle:
            file_handle.write(log_entry)
    except IOError as err:
        print("[!] System Error: Failed to write to audit log: " + str(err))


def hash_string(plaintext):
    """Calculates SHA-256 digest from UTF-8 string bytes."""
    return hashlib.sha256(plaintext.encode("utf-8")).hexdigest()


def verify_login(username, password):
    """
    Validates user credentials.
    Uses hmac.compare_digest to prevent side-channel timing analysis.
    """
    if username in USER_DATABASE:
        candidate_digest = hash_string(password)
        stored_digest = USER_DATABASE[username]
        return hmac.compare_digest(candidate_digest, stored_digest)
    return False


def enforce_lockout():
    """Implements rate-limiting delay mechanism to halt brute-force scripts."""
    print("\n[!] ALERT: 3 failed attempts detected. System locked for {0} seconds.".format(LOCKOUT_DURATION_SECONDS))
    for remaining in range(LOCKOUT_DURATION_SECONDS, 0, -5):
        print("    Lockout active... {0} seconds remaining.".format(remaining))
        time.sleep(5)
    print("[*] Lockout expired. You may attempt login again.\n")


def main():
    failed_attempts = 0

    print("==================================================")
    print("      ENTERPRISE SECURE AUTHENTICATION GATEWAY    ")
    print("==================================================")
    log_security_event("SERVICE_STARTED", "SYSTEM", "Gateway initialized successfully.")

    while True:
        # Check brute-force condition
        if failed_attempts >= MAX_FAILED_ATTEMPTS:
            log_security_event("ACCOUNT_LOCKOUT", "SYSTEM", "Lockout triggered for {0}s.".format(LOCKOUT_DURATION_SECONDS))
            enforce_lockout()
            failed_attempts = 0  # Reset counter once the penalty duration passes

        print("\nAuthentication Required (Attempt {0}/{1}):".format(failed_attempts + 1, MAX_FAILED_ATTEMPTS))
        username_input = input("Username: ").strip().lower()
        password_input = input("Password: ").strip()

        # Reject if either input is empty using boolean 'or'
        if not (username_input != "") or not (password_input != ""):
            print("[-] Input Error: Neither username nor password can be blank.")
            log_security_event("VALIDATION_FAILURE", username_input, "Blank input submitted.")
            continue

        # Authenticate
        is_success = verify_login(username_input, password_input)

        if is_success:
            print("\n[+] Access Granted. Welcome, '{0}'.".format(username_input))
            log_security_event("LOGIN_SUCCESS", username_input, "Authenticated successfully.")
            break
        else:
            failed_attempts += 1
            remaining = MAX_FAILED_ATTEMPTS - failed_attempts

            if remaining != 0:
                print("[-] Access Denied: Invalid credentials. Remaining attempts before lockout: {0}".format(remaining))
            else:
                print("[-] Threshold reached: Account entering temporary lockout.")

            log_security_event("LOGIN_FAILURE", username_input, "Invalid attempt {0} of {1}.".format(failed_attempts, MAX_FAILED_ATTEMPTS))

    print("\n[Session Active] Proceeding to application dashboard...")


if __name__ == "__main__":
    main()

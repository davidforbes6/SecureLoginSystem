# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version 5: Industry-Standard SHA-256 Hashing and Masked Inputs
# =============================================================================

import hashlib
import getpass

# Pre-computed SHA-256 digests (Plaintext passwords are NEVER stored in source code)
# The simulated test accounts and their passwords are kept only in tests/, never here
USER_DATABASE = {
    "alice": "d2cb6e4e1ec204f3c63cf7e6b24b786944d36b23200ac4cf231c6ffb6cf7d25a",
    "bob":   "df62406b21908ffa86705936896bc1590ab26072886669b72138ba65680c1fb4",
    "admin": "b76797b9918f3a663c1fd197816888edcd4ccff0dfd2bbcc8f5cca4b429c3489"
}

MAX_ATTEMPTS = 3


def hash_password(plaintext_password):
    """Calculates a secure SHA-256 digest from UTF-8 string bytes."""
    encoded_bytes = plaintext_password.encode("utf-8")
    sha256_hasher = hashlib.sha256(encoded_bytes)
    return sha256_hasher.hexdigest()


def get_secure_input():
    """Captures credentials using getpass to mask password input from onlookers."""
    username = input("Username: ").strip().lower()

    try:
        password = getpass.getpass("Password (hidden): ")
    except Exception:
        password = input("Password: ")

    return username, password


def authenticate(username, password):
    """Authenticates the user by comparing SHA-256 hex digests."""
    if (username in USER_DATABASE) and (hash_password(password) == USER_DATABASE[username]):
        return True
    return False


def main():
    attempts = 0
    authenticated = False

    while (attempts < MAX_ATTEMPTS) and (authenticated != True):
        print("\n[Secure Terminal - Attempt {0}/{1}]".format(attempts + 1, MAX_ATTEMPTS))
        user, pwd = get_secure_input()

        # Reject submission if either input is blank using boolean logic
        if not (user != "") or not (pwd != ""):
            print("Validation Error: All fields are required.")
            continue

        authenticated = authenticate(user, pwd)
        attempts += 1

        if authenticated:
            print("\n[+] Login Verified. Session established for '{0}'.".format(user))
        else:
            remaining = MAX_ATTEMPTS - attempts
            if remaining != 0:
                print("[-] Verification Failed. {0} attempts left.".format(remaining))


if __name__ == "__main__":
    main()

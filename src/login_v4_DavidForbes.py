# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version 4: Input Sanitisation, Dictionaries, and Character Hashing
# =============================================================================

def generate_custom_hash(plaintext):
    """Generates a pseudo-hash using ASCII character codes and bitwise shifts (Page 31)."""
    hash_value = 5381
    for char in plaintext:
        # Bitwise shift and character code addition masked to 32 bits
        hash_value = ((hash_value << 5) + hash_value) + ord(char)
    return hex(hash_value & 0xFFFFFFFF)


# Multi-user storage: Usernames mapped to custom pre-hashed digests
# Digests are precomputed so that no plain-text passwords are stored in source code
USER_DATABASE = {
    "alice": "0x5a834c7e",
    "bob": "0x649d73a5",
    "admin": "0x6c8c65e8"
}

MAX_ATTEMPTS = 3


def sanitise_username(raw_username):
    """Sanitises input by restricting characters strictly to alphanumeric symbols."""
    cleaned = "".join([char for char in raw_username if char.isalnum()]).lower()
    return cleaned


def get_credentials():
    """Captures and validates clean credentials."""
    raw_user = input("Enter username: ").strip()
    clean_user = sanitise_username(raw_user)

    while not (clean_user != ""):
        print("Validation Error: Username must contain valid alphanumeric characters.")
        raw_user = input("Enter username: ").strip()
        clean_user = sanitise_username(raw_user)

    password = input("Enter password: ").strip()
    while not (password != ""):
        print("Validation Error: Password cannot be blank.")
        password = input("Enter password: ").strip()

    return clean_user, password


def authenticate(username, password):
    """Validates login using dictionary membership and hash verification."""
    if (username in USER_DATABASE) and (generate_custom_hash(password) == USER_DATABASE[username]):
        return True
    return False


def main():
    attempts = 0
    authenticated = False

    while (attempts < MAX_ATTEMPTS) and (authenticated != True):
        print("\n--- Portal Login (Attempt {0}/{1}) ---".format(attempts + 1, MAX_ATTEMPTS))
        user, pwd = get_credentials()

        authenticated = authenticate(user, pwd)
        attempts += 1

        if authenticated:
            print("\n[+] Welcome, {0}. Authentication confirmed.".format(user))
        else:
            remaining = MAX_ATTEMPTS - attempts
            if remaining != 0:
                print("[-] Access Denied. {0} attempt(s) remaining.".format(remaining))


if __name__ == "__main__":
    main()

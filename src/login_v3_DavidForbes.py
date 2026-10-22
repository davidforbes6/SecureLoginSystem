# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version 3: Modular Architecture
# =============================================================================

STORED_USERNAME = "admin"
STORED_PASSWORD = "Password123"
MAX_ATTEMPTS = 3


def get_non_empty_input(prompt_text):
    """Subroutine with one parameter that loops until non-empty input is received."""
    user_input = input(prompt_text).strip()
    while not (user_input != ""):
        print("Validation Error: Field cannot be empty. Please try again.")
        user_input = input(prompt_text).strip()
    return user_input


def validate_credentials(username, password):
    """Subroutine with multiple parameters returning a boolean result."""
    if (username == STORED_USERNAME) and (password == STORED_PASSWORD):
        return True
    return False


def display_status(is_authenticated, remaining_attempts):
    """Subroutine dedicated to rendering interface status messages."""
    if is_authenticated:
        print("\n[+] Authentication Successful. Access Granted.")
    else:
        if remaining_attempts != 0:
            print("[-] Authentication Failed. Remaining attempts: {0}".format(remaining_attempts))
        else:
            print("[-] Critical: Maximum login attempts exceeded.")


def main():
    """Mainline algorithm coordinating the flow of subroutines."""
    attempts = 0
    authenticated = False

    while (attempts < MAX_ATTEMPTS) and (authenticated != True):
        print("\n--- Login Screen (Attempt {0}/{1}) ---".format(attempts + 1, MAX_ATTEMPTS))
        username = get_non_empty_input("Username: ")
        password = get_non_empty_input("Password: ")

        authenticated = validate_credentials(username, password)
        attempts += 1

        display_status(authenticated, MAX_ATTEMPTS - attempts)


# Standard idiom to start the program
if __name__ == "__main__":
    main()

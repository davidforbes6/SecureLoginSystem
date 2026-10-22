# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version 2: Input Validation and Retry Loop
# =============================================================================

STORED_USERNAME = "admin"
STORED_PASSWORD = "Password123"
MAX_ATTEMPTS = 3

attempts = 0
authenticated = False

# Counted repetition loop governed by boolean 'and' and relational operator '!='
while (attempts < MAX_ATTEMPTS) and (authenticated != True):
    print("\nAttempt {0} of {1}".format(attempts + 1, MAX_ATTEMPTS))

    # Input validation: repeatedly prompt until the entry is non-empty
    entered_username = input("Enter username: ").strip()
    while not (entered_username != ""):
        print("Validation Error: Username cannot be blank.")
        entered_username = input("Enter username: ").strip()

    entered_password = input("Enter password: ").strip()
    while not (entered_password != ""):
        print("Validation Error: Password cannot be blank.")
        entered_password = input("Enter password: ").strip()

    # Compare credentials using boolean 'and'
    if (entered_username == STORED_USERNAME) and (entered_password == STORED_PASSWORD):
        authenticated = True
        print("Access Granted: Welcome to the system.")
    else:
        attempts += 1
        remaining = MAX_ATTEMPTS - attempts
        if remaining != 0:
            print("Access Denied: Incorrect credentials. {0} attempt(s) remaining.".format(remaining))
        else:
            print("Access Denied: Maximum attempts exceeded. Program terminating.")

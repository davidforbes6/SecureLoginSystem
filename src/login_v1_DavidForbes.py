# =============================================================================
# HSC Software Engineering - Secure Architecture
# Version 1: Basic Prototype
# =============================================================================

# Stored credentials for prototype validation
STORED_USERNAME = "admin"
STORED_PASSWORD = "Password123"

# Sequential execution: Prompt the user for credentials safely as text
entered_username = input("Enter username: ")
entered_password = input("Enter password: ")

# Binary selection using the standard inequality operator '!=' and boolean 'or'
if (entered_username != STORED_USERNAME) or (entered_password != STORED_PASSWORD):
    print("Access Denied: Invalid credentials.")
else:
    print("Access Granted: Welcome to the system.")

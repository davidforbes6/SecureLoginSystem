"""Test cases for Version 5: SHA-256 Hashing with hashlib (simulated data only)."""
import unittest
from unittest import mock

from helpers import capture_output, load_version, source_path

FILE = "login_v5_DavidForbes.py"
v5 = load_version(FILE)

# Simulated plain-text passwords for the test accounts
ALICE_PASSWORD = "Wonderland2024!"
BOB_PASSWORD = "BuilderSafe!99"
ADMIN_PASSWORD = "HSC_Software_Eng_2025!"


class TestVersion5(unittest.TestCase):

    def test_tc_v5_01_correct_password_matches_stored_sha256(self):
        # Input: "Wonderland2024!" -> digest equals the stored SHA-256 value for alice
        self.assertEqual(v5.hash_password(ALICE_PASSWORD), v5.USER_DATABASE["alice"])

    def test_tc_v5_02_wrong_password_does_not_match(self):
        # Input: "Wonderland2025!" (one character changed) -> digest does not match
        self.assertNotEqual(v5.hash_password("Wonderland2025!"), v5.USER_DATABASE["alice"])
        self.assertIs(v5.authenticate("alice", "Wonderland2025!"), False)

    def test_tc_v5_03_digest_is_64_hexadecimal_characters(self):
        digest = v5.hash_password(ALICE_PASSWORD)
        self.assertEqual(len(digest), 64)
        self.assertTrue(all(character in "0123456789abcdef" for character in digest))

    def test_tc_v5_04_no_plain_text_password_is_printed(self):
        with mock.patch("builtins.input", side_effect=["alice"]), \
                mock.patch("getpass.getpass", side_effect=[ALICE_PASSWORD]):
            _, printed = capture_output(v5.main)
        self.assertIn("Login Verified", printed)
        self.assertNotIn(ALICE_PASSWORD, printed)

    def test_tc_v5_05_blank_entries_are_rejected_without_using_an_attempt(self):
        # First submission is blank (rejected), second submission is correct (accepted)
        with mock.patch("builtins.input", side_effect=["", "alice"]), \
                mock.patch("getpass.getpass", side_effect=["", ALICE_PASSWORD]):
            _, printed = capture_output(v5.main)
        self.assertIn("Validation Error: All fields are required.", printed)
        self.assertIn("Login Verified", printed)

    def test_tc_v5_06_getpass_failure_falls_back_to_input(self):
        # getpass raises an error (as in some IDEs), so the password is read with input()
        with mock.patch("builtins.input", side_effect=["alice", ALICE_PASSWORD]), \
                mock.patch("getpass.getpass", side_effect=Exception("no terminal")):
            value, _ = capture_output(v5.get_secure_input)
        self.assertEqual(value, ("alice", ALICE_PASSWORD))

    def test_tc_v5_07_source_file_contains_no_plain_text_passwords(self):
        with open(source_path(FILE), encoding="utf-8") as source_file:
            source_text = source_file.read()
        for password in [ALICE_PASSWORD, BOB_PASSWORD, ADMIN_PASSWORD]:
            with self.subTest(password=password):
                self.assertNotIn(password, source_text)


if __name__ == "__main__":
    unittest.main()

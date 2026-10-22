"""Test cases for Version 4: Data Validation and Custom Hashing (simulated data only)."""
import unittest
from unittest import mock

from helpers import capture_output, load_version, source_path

FILE = "login_v4_DavidForbes.py"
v4 = load_version(FILE)

# Simulated plain-text passwords for the test accounts (used only to check the source file)
PLAIN_TEXT_PASSWORDS = ["AliceSecure#1", "BobPassword!9", "SuperAdmin999"]


class TestVersion4(unittest.TestCase):

    def test_tc_v4_01_sanitise_removes_special_characters(self):
        # Input: '<Ad>:"min"' -> Returned: "admin"
        self.assertEqual(v4.sanitise_username('<Ad>:"min"'), "admin")
        # Each of the characters < > : " is removed from the username
        for symbol in ["<", ">", ":", '"']:
            with self.subTest(symbol=symbol):
                self.assertEqual(v4.sanitise_username("a" + symbol + "b"), "ab")

    def test_tc_v4_02_ab_and_ba_hash_differently(self):
        # Brief expected these to match. Actual: 0x597728 vs 0x597748, so they do NOT match.
        # The custom hash is order-sensitive, so the brief's example is recorded as a discrepancy.
        self.assertNotEqual(v4.generate_custom_hash("ab"), v4.generate_custom_hash("ba"))

    def test_tc_v4_03_aB_and_b_exclamation_collide(self):
        # A genuine collision for this hash: both return 0x597708
        self.assertEqual(v4.generate_custom_hash("aB"), v4.generate_custom_hash("b!"))

    def test_tc_v4_04_get_credentials_sanitises_and_reprompts(self):
        # Input: '<>:"' (sanitises to blank, rejected), 'AdMiN', then 'SuperAdmin999'
        with mock.patch("builtins.input", side_effect=['<>:"', "AdMiN", "SuperAdmin999"]):
            value, printed = capture_output(v4.get_credentials)
        self.assertEqual(value, ("admin", "SuperAdmin999"))
        self.assertIn("Validation Error: Username must contain valid alphanumeric characters.", printed)

    def test_tc_v4_05_authenticate_accepts_correct_and_rejects_wrong(self):
        # Input: ("alice", "AliceSecure#1") -> True
        self.assertIs(v4.authenticate("alice", "AliceSecure#1"), True)
        # Input: ("alice", "wrong") -> False; Input: ("carol", "AliceSecure#1") -> False
        self.assertIs(v4.authenticate("alice", "wrong"), False)
        self.assertIs(v4.authenticate("carol", "AliceSecure#1"), False)

    def test_tc_v4_06_database_and_source_contain_no_plain_text_passwords(self):
        stored_values = " ".join(v4.USER_DATABASE.values())
        with open(source_path(FILE), encoding="utf-8") as source_file:
            source_text = source_file.read()
        for password in PLAIN_TEXT_PASSWORDS:
            with self.subTest(password=password):
                self.assertNotIn(password, stored_values)
                self.assertNotIn(password, source_text)


if __name__ == "__main__":
    unittest.main()

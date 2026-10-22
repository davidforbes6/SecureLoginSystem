"""Test cases for Version 3: Modular Design (simulated data only).

Each subroutine is tested on its own, with its inputs and returned value recorded.
"""
import unittest
from unittest import mock

from helpers import capture_output, load_version

v3 = load_version("login_v3_DavidForbes.py")


class TestVersion3(unittest.TestCase):

    def test_tc_v3_01_get_non_empty_input_returns_trimmed_text(self):
        # Input: "   " (blank, rejected), then "  alice  " -> Returned: "alice"
        with mock.patch("builtins.input", side_effect=["   ", "  alice  "]):
            value, printed = capture_output(v3.get_non_empty_input, "Username: ")
        self.assertEqual(value, "alice")
        self.assertIn("Validation Error: Field cannot be empty", printed)

    def test_tc_v3_02_validate_credentials_accepts_correct_pair(self):
        # Input: ("admin", "Password123") -> Returned: True
        self.assertIs(v3.validate_credentials("admin", "Password123"), True)

    def test_tc_v3_03_validate_credentials_rejects_wrong_or_differently_cased_pair(self):
        # Input: ("admin", "wrong") -> False; Input: ("ADMIN", "Password123") -> False
        self.assertIs(v3.validate_credentials("admin", "wrong"), False)
        self.assertIs(v3.validate_credentials("ADMIN", "Password123"), False)

    def test_tc_v3_04_display_status_prints_the_correct_message(self):
        # Input: (False, 2) -> prints remaining attempts
        result, printed = capture_output(v3.display_status, False, 2)
        self.assertIsNone(result)
        self.assertIn("Remaining attempts: 2", printed)

        # Input: (False, 0) -> prints the critical message
        _, printed = capture_output(v3.display_status, False, 0)
        self.assertIn("Maximum login attempts exceeded", printed)

        # Input: (True, 2) -> prints the success message
        _, printed = capture_output(v3.display_status, True, 2)
        self.assertIn("Access Granted", printed)

    def test_tc_v3_05_main_locks_out_after_three_failures(self):
        # Three simulated wrong attempts: admin/x each time
        with mock.patch("builtins.input", side_effect=["admin", "x"] * 3):
            _, printed = capture_output(v3.main)
        self.assertIn("Remaining attempts: 2", printed)
        self.assertIn("Remaining attempts: 1", printed)
        self.assertIn("Critical: Maximum login attempts exceeded.", printed)

    def test_tc_v3_06_main_succeeds_on_second_attempt(self):
        with mock.patch("builtins.input", side_effect=["admin", "x", "admin", "Password123"]):
            _, printed = capture_output(v3.main)
        self.assertIn("Authentication Successful. Access Granted.", printed)


if __name__ == "__main__":
    unittest.main()

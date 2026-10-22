"""Test cases for Version 2: Input Validation and Retry Loop (simulated data only)."""
import tempfile
import unittest

from helpers import run_script

FILE = "login_v2_DavidForbes.py"


class TestVersion2(unittest.TestCase):

    def setUp(self):
        workdir = tempfile.TemporaryDirectory()
        self.addCleanup(workdir.cleanup)
        self.workdir = workdir.name

    def run_login(self, stdin_text):
        return run_script(FILE, stdin_text, self.workdir)

    def test_tc_v2_01_blank_username_is_rejected(self):
        result = self.run_login("   \nadmin\nPassword123\n")
        self.assertIn("Validation Error: Username cannot be blank.", result.stdout)
        self.assertIn("Access Granted", result.stdout)
        # The blank entry was re-prompted, not counted as a failed attempt
        self.assertNotIn("Attempt 2 of 3", result.stdout)

    def test_tc_v2_02_blank_password_is_rejected(self):
        result = self.run_login("admin\n\nPassword123\n")
        self.assertIn("Validation Error: Password cannot be blank.", result.stdout)
        self.assertIn("Access Granted", result.stdout)

    def test_tc_v2_03_three_wrong_attempts_lock_out(self):
        result = self.run_login("admin\nwrong\n" * 3 + "admin\nPassword123\n")
        self.assertIn("Maximum attempts exceeded. Program terminating.", result.stdout)
        # The program stops reading input after the third failure
        self.assertNotIn("Attempt 4 of 3", result.stdout)
        self.assertNotIn("Access Granted", result.stdout)


if __name__ == "__main__":
    unittest.main()

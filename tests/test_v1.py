"""Test cases for Version 1: Basic Prototype (simulated data only)."""
import tempfile
import unittest

from helpers import run_script

FILE = "login_v1_DavidForbes.py"


class TestVersion1(unittest.TestCase):

    def setUp(self):
        workdir = tempfile.TemporaryDirectory()
        self.addCleanup(workdir.cleanup)
        self.workdir = workdir.name

    def run_login(self, stdin_text):
        return run_script(FILE, stdin_text, self.workdir)

    def test_tc_v1_01_correct_login_succeeds(self):
        result = self.run_login("admin\nPassword123\n")
        self.assertIn("Access Granted", result.stdout)
        self.assertNotIn("Access Denied", result.stdout)

    def test_tc_v1_02_wrong_password_fails(self):
        result = self.run_login("admin\nwrongpass\n")
        self.assertIn("Access Denied", result.stdout)
        self.assertNotIn("Access Granted", result.stdout)

    def test_tc_v1_03_wrong_username_fails(self):
        result = self.run_login("guest\nPassword123\n")
        self.assertIn("Access Denied", result.stdout)
        self.assertNotIn("Access Granted", result.stdout)


if __name__ == "__main__":
    unittest.main()

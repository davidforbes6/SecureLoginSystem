"""Test cases for Version FINAL: Brute-Force Protection and Secure Logging (simulated data only)."""
import os
import re
import tempfile
import time
import unittest
from unittest import mock

from helpers import capture_output, load_version, run_script, source_path

FILE = "login_vFINAL_DavidForbes.py"
vfinal = load_version(FILE)

# Simulated plain-text passwords for the test accounts
ALICE_PASSWORD = "Wonderland2024!"
ADMIN_PASSWORD = "HSC_Software_Eng_2025!"
BOB_PASSWORD = "BuilderSafe!99"

LOG_LINE_PATTERN = re.compile(
    r"^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] EVENT: \S+\s*\| USER: .*\| DETAILS: .+$"
)


class TestVersionFinal(unittest.TestCase):

    def setUp(self):
        workdir = tempfile.TemporaryDirectory()
        self.addCleanup(workdir.cleanup)
        self.workdir = workdir.name
        self.log_path = os.path.join(self.workdir, "security_audit.log")
        patcher = mock.patch.object(vfinal, "LOG_FILE", self.log_path)
        patcher.start()
        self.addCleanup(patcher.stop)

    def read_log(self):
        with open(self.log_path, encoding="utf-8") as log_file:
            return log_file.read()

    def test_tc_vf_01_three_failures_lock_out_for_30_seconds_in_real_time(self):
        # Full run as a separate process, with real time.sleep() and no patching
        stdin_text = "admin\nwrong\n" * 3 + "admin\n" + ADMIN_PASSWORD + "\n"
        start = time.monotonic()
        result = run_script(FILE, stdin_text, self.workdir)
        elapsed = time.monotonic() - start
        self.assertIn("System locked for 30 seconds", result.stdout)
        self.assertIn("Access Granted", result.stdout)
        self.assertGreaterEqual(elapsed, 30.0)
        self.assertLess(elapsed, 45.0)

    def test_tc_vf_02_lockout_countdown_totals_30_seconds(self):
        with mock.patch.object(vfinal.time, "sleep") as fake_sleep:
            _, printed = capture_output(vfinal.enforce_lockout)
        self.assertEqual(sum(call.args[0] for call in fake_sleep.call_args_list), 30)
        self.assertIn("30 seconds remaining", printed)
        self.assertIn("Lockout expired", printed)

    def test_tc_vf_03_each_event_is_logged_with_a_timestamp(self):
        vfinal.log_security_event("LOGIN_FAILURE", "alice", "Invalid attempt 1 of 3.")
        vfinal.log_security_event("LOGIN_SUCCESS", "alice", "Authenticated successfully.")
        lines = self.read_log().splitlines()
        self.assertEqual(len(lines), 2)
        for line in lines:
            with self.subTest(line=line):
                self.assertRegex(line, LOG_LINE_PATTERN)

    def test_tc_vf_04_no_password_appears_in_the_log(self):
        # Simulated run: two wrong passwords, then the correct password for admin
        with mock.patch("builtins.input", side_effect=["admin", "guess1", "admin", "guess2", "admin", ADMIN_PASSWORD]), \
                mock.patch.object(vfinal.time, "sleep"):
            capture_output(vfinal.main)
        log_text = self.read_log()
        self.assertIn("LOGIN_FAILURE", log_text)
        self.assertIn("LOGIN_SUCCESS", log_text)
        for secret in ["guess1", "guess2", ADMIN_PASSWORD]:
            with self.subTest(secret=secret):
                self.assertNotIn(secret, log_text)

    def test_tc_vf_05_main_lockout_then_successful_login(self):
        inputs = ["alice", "x", "alice", "x", "alice", "x", "alice", ALICE_PASSWORD]
        with mock.patch("builtins.input", side_effect=inputs), \
                mock.patch.object(vfinal.time, "sleep") as fake_sleep:
            _, printed = capture_output(vfinal.main)
        self.assertIn("Threshold reached", printed)
        self.assertIn("Access Granted", printed)
        self.assertEqual(sum(call.args[0] for call in fake_sleep.call_args_list), 30)
        log_text = self.read_log()
        self.assertEqual(log_text.count("ACCOUNT_LOCKOUT"), 1)
        self.assertEqual(log_text.count("LOGIN_FAILURE"), 3)

    def test_tc_vf_06_verify_login_accepts_correct_and_rejects_wrong(self):
        self.assertIs(vfinal.verify_login("alice", ALICE_PASSWORD), True)
        self.assertIs(vfinal.verify_login("alice", "wrong"), False)
        self.assertIs(vfinal.verify_login("carol", ALICE_PASSWORD), False)

    def test_tc_vf_07_source_file_contains_no_plain_text_passwords(self):
        with open(source_path(FILE), encoding="utf-8") as source_file:
            source_text = source_file.read()
        for password in [ALICE_PASSWORD, BOB_PASSWORD, ADMIN_PASSWORD]:
            with self.subTest(password=password):
                self.assertNotIn(password, source_text)

    @unittest.expectedFailure
    def test_tc_vf_08_known_limitation_lockout_is_per_account_not_system_wide(self):
        # Brief asks to lock the ACCOUNT. Actual: the whole gateway locks, so bob is blocked too.
        inputs = ["alice", "x", "alice", "x", "alice", "x", "bob", BOB_PASSWORD]
        with mock.patch("builtins.input", side_effect=inputs), \
                mock.patch.object(vfinal.time, "sleep"):
            _, printed = capture_output(vfinal.main)
        self.assertNotIn("System locked", printed)

    @unittest.expectedFailure
    def test_tc_vf_09_known_limitation_password_typed_in_username_is_not_logged(self):
        # Brief requires that no password appears in the log. Actual: a password typed into
        # the username field is written to the log in lower case (main() lower-cases input).
        # Attempt 1: password typed as username. Attempt 2: correct credentials, so main() ends.
        inputs = [ALICE_PASSWORD, "x", "alice", ALICE_PASSWORD]
        with mock.patch("builtins.input", side_effect=inputs), \
                mock.patch.object(vfinal.time, "sleep"):
            capture_output(vfinal.main)
        self.assertNotIn(ALICE_PASSWORD.lower(), self.read_log())


if __name__ == "__main__":
    unittest.main()

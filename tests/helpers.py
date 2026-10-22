"""Shared helpers for the login system tests.

All credentials used by the tests are simulated data. No real accounts are used.
"""
import importlib.util
import io
import os
import subprocess
import sys
from contextlib import redirect_stdout

SRC_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src"))


def source_path(filename):
    """Return the full path of a version file in src/."""
    return os.path.join(SRC_DIR, filename)


def load_version(filename):
    """Import a version file as a module without running its main() block."""
    module_name = "under_test_" + filename.replace(".py", "")
    spec = importlib.util.spec_from_file_location(module_name, source_path(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_script(filename, stdin_text, cwd):
    """Run a top-level script (v1 and v2) with simulated keyboard input."""
    return subprocess.run(
        [sys.executable, source_path(filename)],
        input=stdin_text,
        capture_output=True,
        text=True,
        cwd=cwd,
        timeout=120,
    )


def capture_output(function, *args, **kwargs):
    """Call a function and return (return_value, printed_text)."""
    buffer = io.StringIO()
    with redirect_stdout(buffer):
        result = function(*args, **kwargs)
    return result, buffer.getvalue()

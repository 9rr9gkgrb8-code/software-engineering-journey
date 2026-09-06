import unittest
from pathlib import Path


class BetaLauncherTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).parent
        cls.start = (root / "start_forge_beta.ps1").read_text(encoding="utf-8")
        cls.stop = (root / "stop_forge_beta.ps1").read_text(encoding="utf-8")
        cls.ignore = (root / ".gitignore").read_text(encoding="utf-8")

    def test_generates_distinct_cryptographic_secrets(self):
        self.assertIn("RandomNumberGenerator", self.start)
        self.assertIn("GetBytes", self.start)
        self.assertIn("family_key = New-ForgeSecret; runtime_key = New-ForgeSecret", self.start)

    def test_secrets_and_process_files_are_ignored(self):
        self.assertIn(".forge-beta.env.json", self.ignore)
        self.assertIn(".forge-beta.pids.json", self.ignore)
        self.assertIn(".forge-beta-*.log", self.ignore)

    def test_launcher_runs_tests_and_health_check(self):
        self.assertIn("-m unittest -q", self.start)
        self.assertIn("& $Npm test", self.start)
        self.assertIn("127.0.0.1:8780/health", self.start)

    def test_runtime_remains_loopback_and_web_uses_network_mode(self):
        self.assertIn('FORGE_RUNTIME_URL = "http://127.0.0.1:8780"', self.start)
        self.assertIn('"dev:network"', self.start)

    def test_stop_script_targets_only_recorded_processes(self):
        self.assertIn("web_pid", self.stop)
        self.assertIn("runtime_pid", self.stop)
        self.assertIn("taskkill.exe /PID $processId /T /F", self.stop)


if __name__ == "__main__":
    unittest.main()

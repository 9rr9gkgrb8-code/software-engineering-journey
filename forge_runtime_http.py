"""Loopback-only HTTP adapter for the Forge subset runtime."""

import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from forge_runtime import run_mission

HOST = "127.0.0.1"
PORT = int(os.environ.get("FORGE_RUNTIME_PORT", "8780"))
MAX_BODY_BYTES = 4_096


class Handler(BaseHTTPRequestHandler):
    server_version = "ForgeRuntime/1"

    def do_GET(self):
        if self.path != "/health":
            return self._send(404, {"error": "not_found"})
        self._send(200, {"status": "ok", "protocol_version": "forge-runtime-v1"})

    def do_POST(self):
        if self.path != "/v1/run":
            return self._send(404, {"error": "not_found"})
        expected = os.environ.get("FORGE_RUNTIME_KEY", "")
        provided = self.headers.get("x-forge-runtime-key", "")
        if expected and not hmac.compare_digest(expected, provided):
            return self._send(401, {"error": "unauthorized"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self._send(400, {"error": "invalid_length"})
        if length <= 0 or length > MAX_BODY_BYTES:
            return self._send(413, {"error": "request_too_large"})
        try:
            payload = json.loads(self.rfile.read(length))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return self._send(400, {"error": "invalid_json"})
        if not isinstance(payload, dict):
            return self._send(400, {"error": "invalid_request"})
        self._send(200, run_mission(payload.get("mission_id"), payload.get("source")))

    def log_message(self, *_args):
        return

    def _send(self, status, payload):
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)


def main():
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()

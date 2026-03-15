#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import posixpath
import sys
import threading
import time
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


WATCH_SUFFIXES = {
    ".html",
    ".css",
    ".js",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
}

POLL_ENDPOINT = "/__dev_poll"
FAVICON_PATH = "/favicon.ico"
QUIET_LOG_PATHS = {POLL_ENDPOINT, FAVICON_PATH}

RELOAD_SNIPPET = """
<script>
(() => {
  let version = null;
  async function poll() {
    try {
      const response = await fetch('__POLL_ENDPOINT__?_ts=' + Date.now(), { cache: 'no-store' });
      const data = await response.json();
      if (version === null) {
        version = data.version;
      } else if (version !== data.version) {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of links) {
          const url = new URL(link.href, window.location.href);
          url.searchParams.set('_lr', data.version.slice(0, 8));
          link.href = url.toString();
        }
        window.location.reload();
        return;
      }
    } catch (error) {
      console.debug('Live reload polling failed', error);
    }
    window.setTimeout(poll, 1000);
  }
  poll();
})();
</script>
""".replace("__POLL_ENDPOINT__", POLL_ENDPOINT)


class ChangeTracker:
    def __init__(self, root: Path) -> None:
        self.root = root
        self._version = self._calculate_version()
        self._lock = threading.Lock()

    @property
    def version(self) -> str:
        with self._lock:
            return self._version

    def update(self) -> None:
        fresh_version = self._calculate_version()
        with self._lock:
            if fresh_version != self._version:
                self._version = fresh_version

    def _calculate_version(self) -> str:
        digest = hashlib.sha256()
        for path in sorted(self.root.rglob("*")):
            if path.is_dir() or path.suffix.lower() not in WATCH_SUFFIXES:
                continue
            stat = path.stat()
            digest.update(str(path.relative_to(self.root)).encode("utf-8"))
            digest.update(str(stat.st_mtime_ns).encode("utf-8"))
            digest.update(str(stat.st_size).encode("utf-8"))
        return digest.hexdigest()


class LiveReloadHandler(SimpleHTTPRequestHandler):
    tracker: ChangeTracker

    def _request_path(self) -> str:
        return urlsplit(self.path).path

    def do_GET(self) -> None:  # noqa: N802
        request_path = self._request_path()

        if request_path == FAVICON_PATH:
            favicon_path = Path(self.translate_path(request_path))
            if not favicon_path.exists():
                self.send_response(HTTPStatus.NO_CONTENT)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        if request_path == POLL_ENDPOINT:
            self._serve_poll()
            return

        if request_path.endswith(".html") or request_path in {"/", ""}:
            self._serve_html()
            return

        # Avoid false 304 responses from second-level mtime comparisons.
        # Some browsers can keep stale CSS after reload.
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]

        super().do_GET()

    def _serve_poll(self) -> None:
        payload = json.dumps({"version": self.tracker.version}).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format: str, *args: object) -> None:
        request_path = self._request_path()
        if request_path in QUIET_LOG_PATHS:
            return

        message = format % args
        level = "WARN" if message.startswith("code ") else "INFO"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level} {message}", file=sys.stderr)

    def end_headers(self) -> None:
        # Keep local dev assets uncached across browsers.
        self.send_header("Cache-Control", "no-store")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _serve_html(self) -> None:
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            index_path = os.path.join(path, "index.html")
            if os.path.exists(index_path):
                path = index_path
            else:
                super().do_GET()
                return

        if not os.path.exists(path):
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return

        body = Path(path).read_text(encoding="utf-8")
        if "</body>" in body:
            body = body.replace("</body>", f"{RELOAD_SNIPPET}\n</body>")
        else:
            body += RELOAD_SNIPPET

        encoded = body.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def translate_path(self, path: str) -> str:
        path = path.split("?", 1)[0]
        path = path.split("#", 1)[0]
        trailing_slash = path.rstrip().endswith("/")
        path = posixpath.normpath(path)
        words = [segment for segment in path.split("/") if segment]
        translated = str(Path.cwd())
        for word in words:
            translated = os.path.join(translated, word)
        if trailing_slash:
            translated = os.path.join(translated, "")
        return translated


def start_watcher(tracker: ChangeTracker) -> None:
    def watch() -> None:
        while True:
            tracker.update()
            time.sleep(0.5)

    thread = threading.Thread(target=watch, daemon=True)
    thread.start()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve static files with simple live reload.")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on")
    args = parser.parse_args()

    tracker = ChangeTracker(Path.cwd())
    LiveReloadHandler.tracker = tracker
    start_watcher(tracker)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), LiveReloadHandler)
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO Serving {Path.cwd()} at http://127.0.0.1:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO Stopping server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

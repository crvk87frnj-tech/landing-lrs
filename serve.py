#!/usr/bin/env python3
# Serveur d'aperçu local — Les Roues Solidaires
# Lancer :  python3 serve.py   (depuis le dossier landing-lrs)  -> http://localhost:8137
# - Multi-thread (pas de blocage sur le streaming vidéo)
# - HTML/CSS/JS : no-store (toujours frais)
# - Médias (mp4, images, fonts) : cache 1 jour (rechargements rapides)
import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
CODE_EXT = (".html", ".css", ".js")

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split("?")[0].lower()
        if path.endswith("/") or path.endswith(CODE_EXT):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        else:
            self.send_header("Cache-Control", "public, max-age=86400")
        super().end_headers()
    def log_message(self, *args):
        pass

class Threaded(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

with Threaded(("", 8137), Handler) as httpd:
    print("Aperçu : http://localhost:8137  (Ctrl+C pour arrêter)")
    httpd.serve_forever()

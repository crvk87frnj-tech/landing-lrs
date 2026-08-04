#!/usr/bin/env python3
# Serveur d'aperçu local — Les Roues Solidaires
# Lancer :  python3 serve.py   (depuis le dossier landing-lrs)  -> http://localhost:8137
# - Multi-thread (pas de blocage sur le streaming vidéo)
# - Écoute en loopback IPv4 (127.0.0.1) ET IPv6 (::1) : Safari résout souvent
#   "localhost" en ::1 d'abord ; sans l'IPv6 la page ne s'ouvrait pas dans Safari.
#   Reste strictement local (aucune exposition hors machine).
# - HTML/CSS/JS : no-store (toujours frais) ; médias : cache 1 jour.
import http.server, socketserver, os, socket, threading

os.chdir(os.path.dirname(os.path.abspath(__file__)))
CODE_EXT = (".html", ".css", ".js")
PORT = 8137

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

class Threaded4(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    address_family = socket.AF_INET

class Threaded6(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    address_family = socket.AF_INET6

servers = [Threaded4(("127.0.0.1", PORT), Handler)]
try:
    servers.append(Threaded6(("::1", PORT), Handler))  # loopback IPv6 (Safari)
except OSError as e:
    print("IPv6 loopback indisponible (IPv4 seul) :", e)

print(f"Aperçu : http://localhost:{PORT}  (IPv4 127.0.0.1 + IPv6 ::1, Ctrl+C pour arrêter)")
threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in servers]
for t in threads:
    t.start()
try:
    for t in threads:
        t.join()
except KeyboardInterrupt:
    for s in servers:
        s.shutdown()

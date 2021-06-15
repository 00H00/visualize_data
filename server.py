import http.server
import socketserver

PORT = 80
Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map.update({
	".js": "text/javascript",
});

with socketserver.TCPServer(("",PORT),Handler) as httpd:
	httpd.serve_forever()

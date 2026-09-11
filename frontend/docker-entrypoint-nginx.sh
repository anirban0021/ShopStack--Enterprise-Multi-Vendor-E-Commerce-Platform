#!/bin/sh
set -e

CERT_DIR="/etc/letsencrypt/live/13.48.47.35.sslip.io"
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "Creating fallback self-signed SSL certificates for initial startup..."
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=13.48.47.35.sslip.io" 2>/dev/null || true
fi

exec nginx -g "daemon off;"

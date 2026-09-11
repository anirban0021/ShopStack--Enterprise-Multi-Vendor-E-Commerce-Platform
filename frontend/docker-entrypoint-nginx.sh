#!/bin/sh
set -e

ACTIVE_DIR="/etc/nginx/ssl"
mkdir -p "$ACTIVE_DIR"

# Find the best available certificate (prioritize duckdns, then sslip.io, then any live cert)
FOUND_CERT=""
for dir in /etc/letsencrypt/live/*duckdns.org /etc/letsencrypt/live/*sslip.io /etc/letsencrypt/live/*; do
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "active" ] && [ -f "$dir/fullchain.pem" ] && [ -f "$dir/privkey.pem" ]; then
        FOUND_CERT="$dir"
        break
    fi
done

if [ -n "$FOUND_CERT" ]; then
    echo "Using SSL certificate from: $FOUND_CERT"
    cp -L "$FOUND_CERT/fullchain.pem" "$ACTIVE_DIR/fullchain.pem"
    cp -L "$FOUND_CERT/privkey.pem" "$ACTIVE_DIR/privkey.pem"
fi

# If no certificate exists, create fallback self-signed certificate
if [ ! -f "$ACTIVE_DIR/fullchain.pem" ] || [ ! -f "$ACTIVE_DIR/privkey.pem" ]; then
    echo "Creating fallback self-signed SSL certificates for initial startup..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$ACTIVE_DIR/privkey.pem" \
        -out "$ACTIVE_DIR/fullchain.pem" \
        -subj "/CN=shopstack-enterprise.duckdns.org" 2>/dev/null || true
fi

exec nginx -g "daemon off;"

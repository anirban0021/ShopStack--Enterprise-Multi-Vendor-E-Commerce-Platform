#!/bin/bash
set -e

DOMAIN="${1:-shopstack-enterprise.duckdns.org}"
EMAIL="anirbansasmal21@gmail.com"

echo "=========================================================="
echo "🔐 Setting up Let's Encrypt SSL for: $DOMAIN"
echo "=========================================================="

echo "🔍 Checking DNS resolution for $DOMAIN..."
if ! getent hosts "$DOMAIN" > /dev/null 2>&1; then
    echo "❌ DNS resolution failed for $DOMAIN."
    echo "👉 Please log into https://www.duckdns.org, add domain '$DOMAIN' pointing to 13.48.47.35"
    exit 1
fi

echo "✅ $DOMAIN resolves to: $(getent hosts "$DOMAIN" | awk '{print $1}')"

echo "🛑 Temporarily stopping frontend container..."
sudo docker stop shopstack-frontend || true

sudo docker run --rm \
  -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d "$DOMAIN" \
  --agree-tos \
  --email "$EMAIL" \
  --non-interactive

echo "🚀 Restarting frontend container with the new SSL certificate..."
cd /home/ubuntu/ShopStack
sudo docker compose restart frontend

echo "=========================================================="
echo "🎉 SUCCESS! Your clean domain is live with HTTPS:"
echo "🌐 Storefront: https://$DOMAIN"
echo "📡 APIs:       https://$DOMAIN/api/products"
echo "=========================================================="

#!/bin/bash
# ==============================================================================
# ShopStack - Automated AWS EC2 Host Setup & Docker Deployment Script
# ==============================================================================
set -e

echo "========================================================"
echo "🚀 Starting ShopStack AWS EC2 Host Bootstrap & Deployment"
echo "========================================================"

# 1. Update APT Repositories & Install Base Packages
echo "📦 Updating apt packages..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# 2. Configure 2GB Swap Memory (prevents OOM during Maven/Vite Docker builds)
if [ ! -f /swapfile ]; then
    echo "🧠 Configuring 2GB Swap memory for stable Docker builds..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap enabled: $(free -h | grep Swap)"
fi

# 3. Install Official Docker Engine & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
fi

# 4. Check Docker Compose availability
echo "🔍 Checking Docker Compose version..."
docker compose version

# 5. Navigate to project directory
cd /home/ubuntu/ShopStack

# 6. Copy .env if not exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
fi

# 7. Build and Run Containers
echo "🏗️ Building and deploying ShopStack multi-container stack..."
sudo docker compose down --remove-orphans || true
sudo docker container prune -f || true
sudo docker compose build --no-cache
sudo docker compose up -d --force-recreate --remove-orphans

# 8. Check Running Containers
echo "========================================================"
echo "📊 Checking container health and running status..."
echo "========================================================"
sudo docker compose ps

echo "========================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 Storefront & App: http://13.48.47.35"
echo "📡 Backend APIs:     http://13.48.47.35:8080/api/products"
echo "========================================================"

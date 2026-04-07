# AWS EC2 Deployment Guide - Millet Dashboard

## Prerequisites
- AWS Account
- SSH key pair (.pem file)
- Git installed locally
- Docker & Docker Compose knowledge

---

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Instances → Launch Instances
2. **Choose AMI**: Ubuntu Server 24.04 LTS (Free tier eligible)
3. **Instance Type**: t2.micro (Free tier) or t2.small (Recommended)
4. **Key Pair**: Create new or select existing (download .pem file)
5. **Security Group** - Allow:
   - Port 22 (SSH) - 0.0.0.0/0 or your IP
   - Port 80 (HTTP) - 0.0.0.0/0
   - Port 443 (HTTPS) - 0.0.0.0/0
   - Port 5432 (PostgreSQL) - Only if needed externally
6. **Storage**: 20GB (minimum for build artifacts)
7. **Launch** and wait for running status

---

## Step 2: Connect to EC2 & Install Dependencies

```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Log out and back in to apply Docker group changes
exit
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 3: Clone & Deploy Project

```bash
# Clone your GitHub repository
cd /home/ubuntu
git clone https://github.com/pmuitcomm-commits/millet-dashboard.git
cd millet-dashboard

# Create environment file
cat > .env << EOF
DB_USER=millet_user
DB_PASSWORD=your_secure_password_here
DB_NAME=millet_db
EOF

# Build and start containers
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

---

## Step 4: Setup Database

```bash
# Connect to backend container
docker exec -it millet_api bash

# Run any database initialization scripts if needed
python seed_db.py

# Exit container
exit
```

---

## Step 5: Get Your IP & Test

```bash
# Get your public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Visit in browser:
# http://<your-ec2-public-ip>  → Frontend
# http://<your-ec2-public-ip>/api → API
```

---

## Maintenance Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Update code (from EC2)
cd /home/ubuntu/millet-dashboard
git pull origin main
docker-compose down
docker-compose up -d --build

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## Optional: Setup Domain & SSL

1. **Buy domain** from Route53 or external provider
2. **Point domain** to EC2's Elastic IP (create Elastic IP for your instance)
3. **Install Certbot** for free SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

4. Update `nginx.conf` with SSL certificates

---

## Important Notes

⚠️ **Security:**
- Change DB_PASSWORD in `.env`
- Use Elastic IP for stable public IP
- Consider using AWS Systems Manager Session Manager instead of SSH
- Enable CloudWatch monitoring

⚠️ **Costs:**
- t2.micro is free tier eligible (1 year)
- t2.small costs ~$0.023/hour
- Data transfer out costs apply after free tier

⚠️ **Backups:**
- Enable automated snapshots for EBS volumes
- Schedule database backups

---

## Troubleshooting

**Containers won't start:**
```bash
docker-compose logs
docker-compose down -v
docker-compose up --build
```

**Port already in use:**
```bash
sudo lsof -i :80
sudo lsof -i :8000
```

**Database connection error:**
- Verify DB_PASSWORD in `.env`
- Check PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

---

Have issues? Check Docker logs or ask for help!

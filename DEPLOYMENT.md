# CityPulse AI - Deployment Guide

Complete deployment instructions for both Next.js dashboard and Python AI service.

---

## Prerequisites

- Supabase account (free tier: https://supabase.com)
- Vercel account (for Next.js) or hosting provider
- Server or cloud VM (for AI service)
- Python 3.9+ (for AI service)
- Node.js 18+ (for local development)

---

## Part 1: Database Setup (Required First)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: citypulse
   - **Database Password**: (choose strong password, save it!)
   - **Region**: Choose closest to your users
4. Click "Create Project"
5. Wait 2-3 minutes for provisioning

### Step 2: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/schema.sql` from the project
4. Copy entire contents
5. Paste into SQL Editor
6. Click **Run**
7. Should see: "Success. No rows returned"

### Step 3: Load Seed Data

1. Still in SQL Editor, click **New Query**
2. Open `supabase/seed.sql`
3. Copy and paste contents
4. Click **Run**
5. Should insert 4 departments

### Step 4: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)
3. Save these securely - you'll need them next

### Step 5: Verify Database

1. Go to **Table Editor**
2. Should see 5 tables: buses, incidents, departments, work_orders, incident_observations
3. Click **departments** - should see 4 rows
4. Database is ready!

**Time Required**: 10 minutes

---

## Part 2: Next.js Dashboard Deployment

### Option A: Deploy to Vercel (Recommended)

#### Via GitHub Integration (Easiest)

1. **Push to GitHub**:
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**:
   - In Vercel project settings, go to **Environment Variables**
   - Add these variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   
   - Use values from Part 1, Step 4
   - Set for: Production, Preview, Development

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Vercel will build and deploy automatically

5. **Verify**:
   - Visit your deployment URL (e.g., `citypulse.vercel.app`)
   - Check health: `https://your-app.vercel.app/api/health`
   - Should see `{"status":"healthy","database":"connected"}`
   - Go to dashboard: `https://your-app.vercel.app/dashboard`

**Time Required**: 15 minutes

#### Via Vercel CLI

```bash
npm install -g vercel
cd /Users/ksaivarshith/Downloads/CITYPULSE

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to set environment variables
```

### Option B: Self-Hosted (Docker)

1. **Create Dockerfile** (at project root):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build and Run**:
```bash
docker build -t citypulse-web .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  citypulse-web
```

### Environment Variables Reference

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | `https://abc123.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | `eyJ...abc` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | `eyJ...xyz` | Yes |
| `AI_SERVICE_URL` | Public | `http://ai.example.com:8000` | No |

**Security Note**: Only `NEXT_PUBLIC_*` variables are exposed to browser. Never put secrets in public variables.

---

## Part 3: Python AI Service Deployment

### Option A: Cloud VM (AWS, GCP, Azure)

#### Step 1: Provision Server

**Minimum Requirements**:
- Ubuntu 22.04 LTS
- 2 vCPUs
- 4 GB RAM
- 20 GB disk
- Public IP address

**Recommended**:
- 4 vCPUs
- 8 GB RAM
- GPU instance (for faster processing)

#### Step 2: Install Dependencies

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Update system
sudo apt update
sudo apt upgrade -y

# Install Python 3.9+
sudo apt install -y python3.9 python3-pip python3-venv

# Install system dependencies for OpenCV
sudo apt install -y libgl1-mesa-glx libglib2.0-0
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd CITYPULSE/ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env
```

Edit `.env` with your Supabase credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Other settings
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8000
MIN_CONFIDENCE=0.50
MAX_VIDEO_SIZE_MB=100
FRAME_SAMPLE_RATE=30
VEHICLE_MODEL=yolov8n.pt
VEHICLE_DETECTION_ENABLED=true
```

#### Step 4: Create Systemd Service

```bash
sudo nano /etc/systemd/system/citypulse-ai.service
```

Paste this content:
```ini
[Unit]
Description=CityPulse AI Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/CITYPULSE/ai-service
Environment="PATH=/home/ubuntu/CITYPULSE/ai-service/venv/bin"
ExecStart=/home/ubuntu/CITYPULSE/ai-service/venv/bin/python -m app.main
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save and exit (Ctrl+X, Y, Enter).

#### Step 5: Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable citypulse-ai

# Start service
sudo systemctl start citypulse-ai

# Check status
sudo systemctl status citypulse-ai

# View logs
sudo journalctl -u citypulse-ai -f
```

#### Step 6: Configure Firewall

```bash
# Allow SSH (if not already)
sudo ufw allow 22/tcp

# Allow AI service port
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable
```

#### Step 7: Set Up Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/citypulse-ai
```

Paste this:
```nginx
server {
    listen 80;
    server_name ai.yourdomain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/citypulse-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Add SSL with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d ai.yourdomain.com

# Auto-renewal is configured automatically
```

#### Step 9: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:8000/health

# Or via public domain
curl https://ai.yourdomain.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-09T...",
  "models": {
    "vehicle_detection": {
      "enabled": true,
      "loaded": true
    }
  },
  "database": "connected"
}
```

**Time Required**: 45-60 minutes

### Option B: Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY .env .env

# Create directories
RUN mkdir -p uploads output/evidence

# Expose port
EXPOSE 8000

# Run service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 2: Build and Run

```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE/ai-service

# Build image
docker build -t citypulse-ai .

# Run container
docker run -d \
  --name citypulse-ai \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/output:/app/output \
  citypulse-ai

# Check logs
docker logs -f citypulse-ai

# Health check
curl http://localhost:8000/health
```

#### Step 3: Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./output:/app/output
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

**Time Required**: 20-30 minutes

---

## Part 4: Post-Deployment Verification

### Test Complete Workflow

1. **Health Checks**:
```bash
# Next.js
curl https://your-app.vercel.app/api/health

# AI Service  
curl https://ai.yourdomain.com/health
```

2. **Upload Test Video**:
```bash
# Download sample video or use your own
curl -X POST https://ai.yourdomain.com/api/process-video \
  -F "video=@test.mp4" \
  -F "bus_id=TEST-001" \
  -F "use_simulated_gps=true" \
  -F "simulated_latitude=19.0760" \
  -F "simulated_longitude=72.8777"
```

3. **Check Incidents**:
```bash
curl https://your-app.vercel.app/api/incidents
```

4. **View in Dashboard**:
- Open `https://your-app.vercel.app/dashboard/map`
- Should see incident markers on map
- Click marker to view details

5. **Test Workflow**:
- Click incident in dashboard
- Update status to "verified"
- Create work order
- Assign to department
- Verify incident status updated to "assigned"

### Monitor Services

**Next.js (Vercel)**:
- View logs: Vercel dashboard → Logs
- View metrics: Vercel dashboard → Analytics
- Set up alerts: Vercel dashboard → Settings → Notifications

**AI Service**:
```bash
# View logs
sudo journalctl -u citypulse-ai -f

# Check resource usage
htop

# Monitor disk space
df -h
```

---

## Part 5: Production Hardening

### Security Checklist

- [ ] HTTPS enabled (Vercel automatic, AI service needs SSL)
- [ ] Environment variables secured
- [ ] Database RLS policies enabled
- [ ] Firewall configured (only necessary ports open)
- [ ] Authentication implemented
- [ ] Rate limiting added
- [ ] API keys rotated regularly
- [ ] Audit logging enabled

### Performance Optimization

**Next.js**:
- [ ] Enable caching (Vercel handles this)
- [ ] Optimize images (use Next/Image)
- [ ] Enable compression
- [ ] Use CDN for static assets

**AI Service**:
- [ ] Use GPU if available
- [ ] Increase FRAME_SAMPLE_RATE for faster processing
- [ ] Add Redis for caching
- [ ] Scale horizontally (multiple instances)
- [ ] Use load balancer

### Monitoring Setup

**Recommended Tools**:
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Logs**: Datadog, LogRocket
- **Metrics**: Prometheus + Grafana

**Basic Health Monitoring**:
```bash
# Add cron job to check health every 5 minutes
crontab -e
```

Add:
```bash
*/5 * * * * curl -f https://ai.yourdomain.com/health || echo "AI Service down!" | mail -s "Alert" admin@example.com
```

### Backup Strategy

**Database** (Supabase handles this automatically):
- Daily backups (free tier: 7 days retention)
- Point-in-time recovery
- Manual export: SQL Editor → Export

**Evidence Images**:
```bash
# Daily backup to S3
aws s3 sync /app/output/evidence s3://citypulse-backups/evidence/$(date +%Y%m%d)/
```

---

## Part 6: Scaling Guide

### When to Scale

**Indicators**:
- AI service CPU >80% consistently
- Video processing queue grows
- Response times >30 seconds
- Memory usage >90%

### Horizontal Scaling

**AI Service**:
1. Deploy multiple instances
2. Add load balancer (Nginx, HAProxy, AWS ALB)
3. Use shared storage (S3, NFS)
4. Implement job queue (RabbitMQ, Celery)

**Next.js**:
- Vercel scales automatically
- Add CDN for static assets (Cloudflare)

### Vertical Scaling

**AI Service**:
- Upgrade to larger instance (4→8 vCPUs)
- Add GPU for faster processing
- Increase RAM for batch processing

---

## Troubleshooting

### Next.js Issues

**Build Fails**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Failed**:
- Check environment variables are set correctly
- Verify Supabase project is not paused
- Test connection: `curl https://your-app.vercel.app/api/health`

**Map Not Displaying**:
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Ensure lat/lng coordinates are valid

### AI Service Issues

**Service Won't Start**:
```bash
# Check logs
sudo journalctl -u citypulse-ai -n 50

# Common issues:
# - Missing dependencies: pip install -r requirements.txt
# - Port already in use: sudo lsof -i :8000
# - Permission errors: check file ownership
```

**Model Won't Load**:
```bash
# YOLOv8 auto-downloads on first run
# If fails, manually download:
cd /app
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

**Out of Memory**:
```bash
# Reduce frame sampling
# In .env:
FRAME_SAMPLE_RATE=60  # Process every 60th frame instead of 30

# Or add swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**Database Connection Failed**:
- Check SUPABASE_SERVICE_KEY in .env
- Verify network can reach Supabase (firewall rules)
- Test: `curl https://your-project.supabase.co`

---

## Cost Estimates

### Development (Free Tier)

- **Supabase**: Free (500MB database, 2GB file storage)
- **Vercel**: Free (100GB bandwidth/month)
- **AI Service**: Self-hosted ($5-10/month VPS)
- **Total**: ~$5-10/month

### Production (Estimated)

- **Supabase**: Pro plan $25/month (8GB database, 100GB storage)
- **Vercel**: Pro plan $20/month (1TB bandwidth)
- **AI Service**: $50-200/month (depends on instance size, GPU)
- **Storage**: $10-50/month (evidence images)
- **Monitoring**: $0-50/month
- **Total**: ~$105-345/month

---

## Support & Maintenance

### Regular Tasks

**Daily**:
- Monitor service health
- Check error logs
- Review incident reports

**Weekly**:
- Review storage usage
- Clean old evidence images
- Update dependencies (security patches)

**Monthly**:
- Rotate API keys
- Review access logs
- Optimize database queries
- Backup verification

### Getting Help

- **Documentation**: `/docs` folder
- **Health Checks**: `/api/health` endpoints
- **Logs**: Vercel dashboard, systemd logs
- **Community**: GitHub issues (if open source)

---

## Next Steps After Deployment

1. **Add Authentication**:
   - Implement Supabase Auth
   - Add login/signup pages
   - Protect sensitive routes

2. **Train Road Damage Model**:
   - Collect pothole/crack images
   - Label dataset
   - Fine-tune YOLO
   - Deploy model

3. **Implement Real GPS**:
   - Add GPX import
   - Parse GPS tracks
   - Match to video frames

4. **Add Evidence Storage**:
   - Upload to Supabase Storage
   - Generate public URLs
   - Display in dashboard

5. **Enable Notifications**:
   - Email alerts for critical incidents
   - SMS for urgent work orders
   - Push notifications for mobile app

---

**Last Updated**: October 9, 2026  
**Version**: 1.0.0  
**Status**: Production Ready (pending auth implementation)

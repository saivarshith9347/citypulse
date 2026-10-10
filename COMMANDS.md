# CityPulse AI - Command Reference

Quick reference for all common commands.

---

## Local Development

### Start Both Services

**Terminal 1 - Next.js Dashboard**:
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE
npm run dev
```
Opens at: http://localhost:3000

**Terminal 2 - Python AI Service**:
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE/ai-service
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate  # Windows

python -m app.main
```
Opens at: http://localhost:8000  
API Docs: http://localhost:8000/docs

---

## Installation

### Next.js
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE
npm install
```

### Python AI Service
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Building & Testing

### Next.js
```bash
# Production build
npm run build

# Type check
npx tsc --noEmit

# Lint (integrated with build)
npm run lint
```

### Python AI Service
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

---

## API Testing

### Health Checks
```bash
# Next.js
curl http://localhost:3000/api/health

# AI Service
curl http://localhost:8000/health
```

### Process Video
```bash
curl -X POST http://localhost:8000/api/process-video \
  -F "video=@test.mp4" \
  -F "bus_id=BUS-001" \
  -F "use_simulated_gps=true" \
  -F "simulated_latitude=19.0760" \
  -F "simulated_longitude=72.8777"
```

### Get Incidents
```bash
# All incidents
curl http://localhost:3000/api/incidents

# Filtered
curl "http://localhost:3000/api/incidents?severity=high&verification_status=detected"
```

### Update Incident
```bash
curl -X PATCH http://localhost:3000/api/incidents/{id} \
  -H "Content-Type: application/json" \
  -d '{"verification_status": "verified", "description": "Confirmed pothole"}'
```

### Create Work Order
```bash
curl -X POST http://localhost:3000/api/work-orders \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "incident-uuid",
    "department_id": "dept-uuid",
    "priority": "high",
    "status": "pending"
  }'
```

---

## Database Operations

### Run Migrations (Supabase SQL Editor)
```sql
-- Paste entire contents of:
-- supabase/schema.sql
```

### Load Seed Data
```sql
-- Paste entire contents of:
-- supabase/seed.sql
```

### Query Incidents
```sql
SELECT * FROM incidents 
WHERE verification_status = 'detected' 
ORDER BY detected_at DESC 
LIMIT 10;
```

### Query by Location
```sql
SELECT * FROM incidents 
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(72.8777, 19.0760)::geography,
  1000  -- 1km radius
);
```

---

## Environment Setup

### Next.js (.env.local)
```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Required:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### AI Service (.env)
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env

# Required:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## Deployment

### Vercel (Next.js)
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Docker (AI Service)
```bash
# Build
docker build -t citypulse-ai .

# Run
docker run -p 8000:8000 --env-file .env citypulse-ai

# With volumes
docker run -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/output:/app/output \
  citypulse-ai
```

### Systemd (AI Service)
```bash
# Create service
sudo nano /etc/systemd/system/citypulse-ai.service

# Enable and start
sudo systemctl enable citypulse-ai
sudo systemctl start citypulse-ai

# Check status
sudo systemctl status citypulse-ai

# View logs
sudo journalctl -u citypulse-ai -f

# Restart
sudo systemctl restart citypulse-ai
```

---

## Monitoring

### View Logs

**Next.js (Vercel)**:
- Dashboard → Logs tab
- Or: `vercel logs`

**AI Service (Systemd)**:
```bash
sudo journalctl -u citypulse-ai -f
```

**AI Service (Docker)**:
```bash
docker logs -f citypulse-ai
```

### Check Resource Usage
```bash
# CPU and memory
htop

# Disk space
df -h

# Network
netstat -tunlp | grep 8000
```

### Database Queries
```sql
-- Incident count by status
SELECT verification_status, COUNT(*) 
FROM incidents 
GROUP BY verification_status;

-- Work order statistics
SELECT status, priority, COUNT(*) 
FROM work_orders 
GROUP BY status, priority;

-- Recent activity
SELECT * FROM incidents 
WHERE created_at > NOW() - INTERVAL '1 hour' 
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Clear Cache (Next.js)
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Restart Services
```bash
# Next.js (Ctrl+C then)
npm run dev

# AI Service (Ctrl+C then)
python -m app.main

# Or systemd
sudo systemctl restart citypulse-ai

# Or Docker
docker restart citypulse-ai
```

### Check Ports
```bash
# See what's using port 3000
lsof -i :3000

# Kill process on port
kill $(lsof -t -i:3000)

# Or use different port
npm run dev -- -p 3001
```

### Database Connection Test
```bash
# Next.js health check
curl http://localhost:3000/api/health | jq '.database'

# AI Service health check
curl http://localhost:8000/health | jq '.database'

# Expected: "connected"
```

---

## Git Commands

### Initial Setup
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE
git init
git add .
git commit -m "Initial commit: CityPulse AI complete system"
git remote add origin <your-repo-url>
git push -u origin main
```

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/add-authentication

# Stage changes
git add .

# Commit
git commit -m "feat: add Supabase authentication"

# Push
git push origin feature/add-authentication

# Merge to main (after review)
git checkout main
git merge feature/add-authentication
git push origin main
```

---

## Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# CityPulse shortcuts
alias city="cd /Users/ksaivarshith/Downloads/CITYPULSE"
alias city-web="cd /Users/ksaivarshith/Downloads/CITYPULSE && npm run dev"
alias city-ai="cd /Users/ksaivarshith/Downloads/CITYPULSE/ai-service && source venv/bin/activate && python -m app.main"
alias city-health="curl http://localhost:3000/api/health && echo && curl http://localhost:8000/health"
alias city-build="cd /Users/ksaivarshith/Downloads/CITYPULSE && npm run build"
```

Then:
```bash
source ~/.bashrc  # or ~/.zshrc
city-web  # Start Next.js
city-ai   # Start AI service
city-health  # Check both services
```

---

## Quick Reference

| Service | Port | Docs |
|---------|------|------|
| Next.js Dashboard | 3000 | README.md |
| Python AI Service | 8000 | ai-service/README.md |
| API Docs (FastAPI) | 8000/docs | Auto-generated |
| Supabase Studio | Web | dashboard.supabase.com |

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build Next.js for production |
| `python -m app.main` | Start AI service |
| `pytest tests/` | Run AI service tests |
| `curl /api/health` | Check service health |

| File | Purpose |
|------|---------|
| `.env.local` | Next.js environment variables |
| `ai-service/.env` | AI service configuration |
| `supabase/schema.sql` | Database schema |
| `DEPLOYMENT.md` | Deployment guide |
| `AUDIT-REPORT.md` | Complete system audit |

---

**Tip**: Bookmark this page for quick command reference during development!

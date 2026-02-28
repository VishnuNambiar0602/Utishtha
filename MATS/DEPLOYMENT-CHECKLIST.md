# 🚀 MATS AWS Deployment Checklist

Use this checklist to track your deployment progress. Check off each item as you complete it!

## 📋 Pre-Deployment Preparation

### Accounts & Access
- [ ] AWS account created
- [ ] Supabase account created
- [ ] Google Cloud account created (for Gemini API)
- [ ] Domain purchased (optional)

### Software Installed
- [ ] Node.js (v18+) installed
- [ ] Git installed
- [ ] AWS CLI installed and configured
- [ ] Code editor (VS Code) installed

### API Keys Obtained
- [ ] Google Gemini API key
- [ ] Supabase URL
- [ ] Supabase anon key

---

## 💾 Supabase Setup

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] API keys copied and saved
- [ ] Database tables created (schema.sql executed)
- [ ] Storage bucket "medical-reports" created
- [ ] Bucket set to public access

---

## 🤖 GRASP2026 Backend Deployment

### EC2 Instance Setup
- [ ] EC2 instance launched (t2.medium or t2.micro)
- [ ] Key pair (.pem file) downloaded and saved
- [ ] Security group configured (ports 22, 5000, 443)
- [ ] Public IP address noted

### Software Installation
- [ ] Connected to EC2 via SSH
- [ ] System updated (apt update && upgrade)
- [ ] Python 3.10 installed
- [ ] Git installed
- [ ] Nginx installed

### Code Deployment
- [ ] GRASP2026 code uploaded to EC2
- [ ] Virtual environment created
- [ ] Python dependencies installed (requirements.txt)
- [ ] Flask app tested locally

### Production Setup
- [ ] Gunicorn installed
- [ ] Systemd service created
- [ ] Service enabled and started
- [ ] Nginx configured as reverse proxy
- [ ] Backend accessible via HTTP

### Testing
- [ ] Health endpoint working: `http://EC2_IP/health`
- [ ] Diagnosis endpoint tested
- [ ] Logs checked for errors

---

## 🌐 Frontend Deployment

### Build Preparation
- [ ] .env file created with all variables
- [ ] VITE_SUPABASE_URL set
- [ ] VITE_SUPABASE_ANON_KEY set
- [ ] VITE_API_KEY (Gemini) set
- [ ] VITE_GRASP2026_API_URL set (EC2 IP)

### Build Process
- [ ] Dependencies installed (`npm install`)
- [ ] Production build created (`npm run build`)
- [ ] dist/ folder generated successfully

### S3 Setup
- [ ] S3 bucket created
- [ ] Bucket name noted
- [ ] Static website hosting enabled
- [ ] Index document set to index.html
- [ ] Error document set to index.html
- [ ] Bucket policy added (public read access)
- [ ] Files uploaded to S3

### CloudFront Setup
- [ ] CloudFront distribution created
- [ ] Origin set to S3 bucket
- [ ] HTTPS redirect enabled
- [ ] Default root object set to index.html
- [ ] Error pages configured (403, 404 → index.html)
- [ ] Distribution deployed (status: Enabled)
- [ ] CloudFront URL tested

---

## 🌍 Domain Setup (Optional)

- [ ] Domain purchased
- [ ] SSL certificate requested (us-east-1 region)
- [ ] DNS validation CNAME records added
- [ ] Certificate status: Issued
- [ ] Domain added to CloudFront (CNAME)
- [ ] Certificate attached to CloudFront
- [ ] DNS CNAME record pointing to CloudFront
- [ ] Custom domain tested

---

## 🧪 Testing & Validation

### Frontend Tests
- [ ] Website loads successfully
- [ ] Login page accessible
- [ ] Admin dashboard works
- [ ] Map displays correctly
- [ ] Can create new trips
- [ ] Real-time updates working

### Backend Tests
- [ ] Health endpoint responds
- [ ] Diagnosis API returns results
- [ ] Medical reports generate
- [ ] PDFs download correctly
- [ ] Colored tables appear in PDFs

### Database Tests
- [ ] Tables visible in Supabase
- [ ] Data saves correctly
- [ ] Real-time subscriptions work
- [ ] GPS tracking records

### Integration Tests
- [ ] End-to-end trip creation
- [ ] Medical report generation
- [ ] PDF storage in Supabase
- [ ] Multi-user real-time sync

---

## 📊 Monitoring Setup

- [ ] CloudWatch alarms configured
- [ ] Billing alerts set up
- [ ] Supabase usage monitored
- [ ] EC2 monitoring enabled
- [ ] Log rotation configured

---

## 🔒 Security Checklist

- [ ] EC2 security group restricts SSH to your IP
- [ ] Supabase RLS policies reviewed
- [ ] API keys not committed to Git
- [ ] HTTPS enforced on CloudFront
- [ ] SSL certificate valid
- [ ] Backup strategy planned

---

## 📝 Documentation

- [ ] EC2 IP address documented
- [ ] Supabase credentials saved securely
- [ ] CloudFront distribution ID noted
- [ ] S3 bucket name documented
- [ ] Domain DNS settings recorded
- [ ] Deployment guide bookmarked

---

## 🎉 Go Live!

- [ ] All tests passed
- [ ] Monitoring active
- [ ] Team trained on system
- [ ] Support contacts documented
- [ ] Backup plan in place
- [ ] **SYSTEM IS LIVE!** 🚀

---

## 📞 Emergency Contacts

| Service | Support URL |
|---------|-------------|
| AWS Support | https://console.aws.amazon.com/support/ |
| Supabase Support | https://supabase.com/docs |
| Your Team Lead | [Add contact] |

---

## 🔄 Post-Deployment Tasks

### Daily
- [ ] Check system health
- [ ] Monitor error logs

### Weekly
- [ ] Review CloudWatch metrics
- [ ] Check Supabase usage
- [ ] Verify backups

### Monthly
- [ ] Review AWS costs
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization

---

**Last Updated:** [Add date]
**Deployed By:** [Add name]
**Production URL:** [Add URL]

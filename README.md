# Wedding Seating — Setup Guide

## File Structure
```
wedding-site/
├── index.html                        # Guest-facing page
├── admin.html                        # Organiser admin page
├── package.json
├── netlify.toml
├── .gitignore
└── netlify/
    └── functions/
        ├── checkin.js                # POST: record a check-in
        ├── attendance.js             # GET:  fetch all check-ins
        ├── upload-guests.js          # POST: upload guest list to DB
        └── get-guests.js             # GET:  fetch guests for index.html
```

## Step 1 — Push to GitHub

1. Go to https://github.com/new and create a new **private** repository
   - Name it e.g. `wedding-site`
   - Leave it empty (no README)
   - Click **Create repository**

2. Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
# Navigate to your project folder
cd path/to/wedding-site

# Initialise git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/wedding-site.git

# Push
git branch -M main
git push -u origin main
```

## Step 2 — Connect to Netlify

1. Go to https://app.netlify.com → **Add new site → Import an existing project**
2. Choose **GitHub** → select your `wedding-site` repo
3. Build settings — leave everything blank (static site)
4. Click **Deploy site**

## Step 3 — Add Neon Database

1. In Netlify dashboard → your site → **Integrations**
2. Search for **Neon** → click **Enable**
3. Follow prompts to create a Neon project
4. Netlify auto-injects `DATABASE_URL` as an environment variable — nothing else needed

## Step 4 — Done!

- Guest page: `https://your-site.netlify.app/index.html`
- Admin page: `https://your-site.netlify.app/admin.html`

## Updating the site later

After any changes to your files:
```bash
git add .
git commit -m "Update"
git push
```
Netlify auto-deploys within ~30 seconds.

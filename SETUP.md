# Database Setup Guide (Supabase + JioBase)

## Overview
The contact form saves messages to a **Supabase** database, routed through **JioBase** proxy (to bypass ISP DNS blocking in India).

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** and fill in:
   - **Name**: `portfolio-contacts` (or whatever you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region (e.g., Mumbai)
3. Wait for the project to be created

---

## Step 2: Create the `contacts` Table

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the contact form)
CREATE POLICY "Allow anonymous inserts" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated reads (for you to view messages)
CREATE POLICY "Allow authenticated reads" ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## Step 3: Set Up JioBase Proxy

1. Go to [jiobase.com/register](https://jiobase.com/register) and create an account
2. Click **"New App"** from your dashboard
3. Fill in:
   - **App Name**: `portfolio`
   - **Slug**: `your-slug` → becomes `your-slug.jiobase.com`
   - **Supabase Project URL**: Your Supabase project URL (e.g., `https://abcdefgh.supabase.co`)
4. Click **"Create App"**

---

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Use your JioBase proxy URL (NOT the direct Supabase URL)
NEXT_PUBLIC_SUPABASE_URL=https://your-slug.jiobase.com

# Your Supabase anon key (found in Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# (Optional) Service role key for server-side operations
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 5: Email Notifications (Optional)

To get notified when someone submits the contact form, you have several options:

### Option A: Supabase Database Webhooks
1. In Supabase Dashboard → **Database** → **Webhooks**
2. Create a webhook that triggers on `INSERT` into the `contacts` table
3. Point it to a service like [Zapier](https://zapier.com) or [Make](https://make.com) to send you an email

### Option B: Supabase Edge Functions
1. Create an Edge Function that sends an email using a service like [Resend](https://resend.com)
2. Trigger it via a Database Webhook on new inserts

### Option C: Check the Supabase Dashboard
- Simply log into your Supabase dashboard to view new messages in the `contacts` table
- Use the Table Editor to mark messages as `read`

---

## Step 6: Test

1. Run `npm run dev`
2. Go to the Contact section
3. Fill out and submit the form
4. Check your Supabase dashboard → Table Editor → `contacts` table to see the message

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Contact form is not configured yet` | Set up `.env.local` with Supabase credentials |
| `Failed to save message` | Check if the `contacts` table exists and RLS policies are set |
| Form works locally but not on Jio/Airtel | Make sure you're using the JioBase URL, not direct Supabase URL |
| 403 Forbidden | Check your RLS policies - anonymous inserts need to be allowed |

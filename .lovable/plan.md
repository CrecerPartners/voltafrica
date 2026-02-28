

# Volt Student Dashboard — Implementation Plan

## Overview
A comprehensive student dashboard for Volt's affiliate program, where student sales agents and campus ambassadors can manage their activity, track earnings, browse products, and monitor their performance. Built with Volt's signature dark theme and blue accents, using mock data that can be swapped for a real backend later.

---

## Pages & Features

### 1. Login / Signup Screen
- Branded login page with Volt logo and dark theme
- Email + password fields (mock authentication for now)
- "Join the Volt-Squad" signup flow
- ₦500 signup bonus callout

### 2. Dashboard Home (Overview)
- Welcome greeting with student's name and avatar
- Key stats at a glance: **Total Earnings**, **Pending Payout**, **Total Sales**, **Referral Count**
- Earnings trend chart (weekly/monthly)
- Recent activity feed (latest sales, bonuses earned)
- Quick action buttons: "Copy Referral Code", "Browse Products", "View Wallet"

### 3. Marketplace (Product Catalog)
- Grid of available products/offers across categories:
  - **Physical Products** (gadgets, fashion, accessories)
  - **Digital Products** (data bundles, subscriptions)
  - **Fintech Products** (banking apps, savings tools)
  - **Events** (campus events, tickets)
- Each product card shows: image, name, brand, commission rate (5%–30%), category tag
- Filter by category and sort by commission rate
- "Get My Link" button on each product to generate a unique referral link/code

### 4. Wallet & Earnings
- **Balance overview**: Available balance, pending earnings, total earned (lifetime)
- **Earnings breakdown** with tabs:
  - Commissions (from product sales)
  - Referral Bonuses (from recruiting other students)
  - Signup Bonus (₦500 initial bonus)
  - Performance Bonuses
- Transaction history list with date, type, amount, and status (pending/paid)
- Payout history — showing weekly Friday payouts
- "Request Payout" button

### 5. Referral Center
- Unique referral code displayed prominently with copy button
- Shareable referral link
- Stats: total referrals, successful signups, bonus earned from referrals
- List of referred students with status (signed up / active / earned)

### 6. Sales Tracking
- Table/list of all sales attributed to the student
- Columns: Date, Product, Customer (anonymized), Amount, Commission Earned, Status
- Filter by date range, product category, and status (confirmed/pending/cancelled)
- Summary stats at the top: Total Sales, Conversion Rate, Top Product

### 7. Leaderboard
- Campus-wide and national rankings
- Show top students by earnings/sales this week
- Student's own rank highlighted
- Motivational progress bar toward next tier

### 8. Profile & Settings
- Edit profile info (name, university, WhatsApp number, bank details for payout)
- Notification preferences
- Account settings

---

## Navigation & Layout
- **Sidebar navigation** (collapsible on mobile) with icons for: Dashboard, Marketplace, Wallet, Referrals, Sales, Leaderboard, Profile
- **Top bar** with Volt logo, notification bell, and profile avatar
- Fully responsive — mobile-first since students will primarily use phones

## Design
- **Dark theme** matching Volt's website (dark backgrounds, #1A1A1A / #0D0D0D)
- **Blue accent** (#2196F3) for CTAs, highlights, and active states
- Bold, modern typography
- Card-based layouts with subtle borders and shadows
- Smooth transitions and hover effects


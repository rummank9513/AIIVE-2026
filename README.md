AIIVE

AIIVE Team - Rumman Khan, Het Shah

AI Insurance Verification Engine
(Pronounced like “Hive,” but with an A.)

Overview

AIIVE is a claims-support tool designed for insurance companies to detect AI-related fraud and identify inconsistencies across claim submissions. It analyzes customer-provided images, videos, and statements to surface discrepancies—both within a single claimant’s report and across multiple parties involved in the same claim.

Problem

Insurance adjusters face increasing volumes of claims, many of which now include AI-generated or AI-manipulated content. Reviewing inconsistencies manually is time-consuming and reduces operational efficiency.

Solution

AIIVE streamlines the review process by:

Detecting potential AI-generated or altered images

Flagging inconsistencies between written statements and visual evidence

Identifying contradictions between multiple claimants under the same case

Organizing findings into a clear, structured report for adjusters

Impact

By automating fraud detection and inconsistency analysis, AIIVE reduces review time, removes investigative clutter, and enables insurance agents to process more claims with greater confidence and accuracy.

Tech Stack:
Framework & Runtime

Next.js 15 (App Router) — React framework with server-side API routes
React 19 — UI library
TypeScript 5.9 — Type safety throughout
AI

Google Gemini (@google/genai v1.43) — Vision AI for fraud detection (authenticity scan, consistency check, fault analysis), accessed via gemini-3.1-pro-preview
Styling

Tailwind CSS v4 — Utility-first CSS
tw-animate-css — Animation utilities
clsx + tailwind-merge — Conditional className utilities via the cn() helper
class-variance-authority — Component variant management
UI Components & Icons

Lucide React — Icon set
Motion (Framer Motion v12) — Animations and transitions
Forms

@hookform/resolvers — Form validation resolvers (installed but not actively used yet)
Infrastructure

Firebase Tools (devDep) — Likely for deployment/hosting
ESLint 9 — Linting
Storage

localStorage — Client-side claim persistence with canvas-based image compression


This contains everything you need to run your app locally.
## Run Locally
**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Rename 'env.example' to 'env.local'
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
4. Run the app:
   `npm run dev`

When running click Local link when it pops up to start program

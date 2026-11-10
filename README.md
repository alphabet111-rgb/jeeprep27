# JEE Prep 2027

> Focused daily execution planner, mock exam analytics, and problem-solving velocity tracker for competitive exam aspirants.

**Live Application:** [jee27prep.vercel.app](https://jee27prep.vercel.app/)  
**Repository:** [github.com/alphabet111-rgb/jeeprep27](https://github.com/alphabet111-rgb/jeeprep27)

---

## Overview

**JEE Prep 2027** is a distraction-free, high-performance web application designed for students preparing for competitive engineering entrance examinations. Built with Next.js 16 (App Router) and TypeScript, it eliminates interface bloat in favor of sub-second responsiveness, persistent temporal tracking, and deterministic study workflows.

---

## Key Features

- **Daily Goal & Task Execution**: Subject-tagged study planner (Physics, Chemistry, Mathematics) with target problem quotas, active filtering, and inline completion toggles.
- **Problem Velocity Tracker (100 Qs Benchmark)**: Real-time atomic increment counters with automatic daily rollovers, celebratory threshold alerts, and 7-day consistency visualization.
- **Temporal Activity Log & Interactive Calendar**: Monthly calendar interface capturing historical daily volume, completed task archives, and qualitative study reflections per date.
- **Examination Milestone Countdowns**: Timezone-safe countdown telemetry for JEE Main Session 1 (Jan 20) and Session 2 (Apr 1), with support for user-defined revision deadlines.
- **Mock Exam Analytics**: Comprehensive test logger capturing PCM score distributions (out of 300), negative marking/silly mistake frequency, and diagnostic notes.
- **Zero-Loss Data Resilience**: Instant local persistence paired with portable JSON serialization (one-click full backup export and restore).

---

## Engineering Highlights

- **Hydration & SSR Safety**: Engineered to resolve Next.js 16 server-rendering clock skew and client hydration mismatches through static date boundaries and deferred client synchronization.
- **Zero Runtime CSS Overhead**: Implemented with a custom Vanilla CSS design system using native CSS Custom Properties, avoiding bloated utility frameworks and runtime CSS-in-JS penalties.
- **Single-Line Table Typography**: Table data layouts enforced with strict `white-space: nowrap` constraints and tabular numerical fonts to eliminate awkward mobile/desktop line breaks.
- **Serverless-Safe Data Pipeline**: Designed with client-authoritative state synchronization and graceful fallback handlers for ephemeral serverless deployment environments.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Modern Vanilla CSS (CSS Variables, Responsive Flex/Grid) |
| **Icons & Visuals** | Lucide React, Canvas Confetti |
| **Persistence** | Browser LocalStorage with SSR hydration guard + JSON Backup Engine |
| **Deployment** | Vercel CI/CD |

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or later
- npm or pnpm

### Installation

```bash
git clone https://github.com/alphabet111-rgb/jeeprep27.git
cd jeeprep27
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## License

MIT License. Open for educational and personal use.

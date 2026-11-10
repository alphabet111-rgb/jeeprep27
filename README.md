# jeeprep27

A clean, distraction-free daily planner and question tracker built for JEE 2027 aspirants.

Live App: **[jeeprep27.vercel.app](https://jeeprep27.vercel.app/)**

---

### What it does

- **Daily Goals & To-Do List**: Add your daily study tasks, tag them by subject (Physics, Chemistry, Maths), set target question counts, and check them off as you finish.
- **100 Questions Daily Tracker**: Set a daily goal to solve 100 problems. Use quick `+5`, `+10`, `+25` buttons for each subject, and see your 7-day consistency bar chart.
- **Study Log & Calendar**: Click any date on the calendar to see what questions you solved, what tasks you completed, and write daily study notes.
- **Exam Countdown**: Live countdown timers for JEE Main Session 1 (January 20) and Session 2 (April 1). You can also add custom coaching test deadlines.
- **Mock Test Log**: Track all your 3-hour tests, marks breakdown (P / C / M out of 300), silly mistakes count, and weak areas.
- **Zero Data Loss**: Your progress saves automatically. You can also click **Export Backup** anytime to download your entire history as a backup file.

---

### Run locally

```bash
git clone https://github.com/Sudheesh02/jeeprep27.git
cd jeeprep27
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS (Minimalist light theme inspired by Things 3 & Todoist)
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage + Server Disk Storage with JSON Export/Import

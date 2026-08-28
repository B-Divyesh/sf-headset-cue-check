# Demo sandbox

- URL: `https://headset-cue-check.sociobot.in/demo` (local: `http://127.0.0.1:4173/demo`)
- One-click entry: **Try it with sample data** on the first screen.
- Sample: a completed Windows setup card for an “Accessibility lab headset,” with six realistic cue ratings, working levels, and repeat notes.
- Storage namespace: IndexedDB database `headset-cue-check-demo`. Real cards use `headset-cue-check`; demo code never opens the real database after the demo route loads.
- Reset: **Reset demo** clears only the demo database and restores the original sample card.
- Exit: **Start for real** reloads `/` and opens the real database. Demo changes are not copied.
- Offline: visit `/demo` once online and wait for service-worker control. The sample, shell, and bundled speech remain available offline.

The banner remains visible throughout demo tasks and states: “Demo — sample data, nothing is saved.” Here, “nothing is saved” means nothing is added to the visitor’s real setup cards; temporary demo changes remain only in the separate sample namespace until reset.

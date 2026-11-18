# Project rules
- Persist bout history in browser storage through a dedicated results-storage helper; this keeps the explicitly requested per-device history available across reloads without adding shared history.
- Migrate only known obsolete default sync URLs when loading saved settings; preserve scorer-entered custom URLs.- Gate the whole app behind a hashed passcode check before any roster or results render; keeps student names private.

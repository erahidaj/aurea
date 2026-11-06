# Security boundaries

Local `.env` files are omitted from this portfolio edition. `.env.example` files contain placeholders only. Dependencies, generated builds, local databases, dumps, logs and private-key files are excluded through the root `.gitignore`.

Environment variables prefixed `VITE_` are embedded in browser code and cannot hold secrets. SMTP and database passwords belong only to backend runtime configuration.

Public demo configuration does not grant production access. Never publish real guest records, SQL exports with personal data, admin passwords or SMTP tokens. Do not use `git add -f` for ignored files.

If a credential has previously reached GitHub or another public destination, revoke/rotate it first. Adding `.gitignore` or deleting the latest file does not remove it from existing Git history. Start this prepared edition as a fresh repository; it contains no inherited Git history.

Session authentication, prepared SQL statements and CSRF checks are implemented in the source. They are not a substitute for integration testing or an independent security review. Production follow-up work includes inventory concurrency control, public endpoint throttling, infrastructure hardening and dependency review.

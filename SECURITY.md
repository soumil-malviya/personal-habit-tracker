# Security Policy

## Supported Versions

NorthHabit is currently under active development.

Security updates and patches are only guaranteed for the latest version deployed on:

https://northhabit.pages.dev

Older commits, forks, or unofficial deployments may not receive security updates.

| Version        | Supported |
| -------------- | --------- |
| Latest         | ✅         |
| Older versions | ❌         |

---

# Reporting a Vulnerability

If you discover a security vulnerability, privacy issue, or exploit, please report it responsibly.

Please include:

* a clear description of the issue
* reproduction steps
* affected pages/components
* potential impact
* screenshots or logs if applicable

## Contact

For responsible disclosure, contact:

* GitHub Issues (preferred for non-sensitive issues)
* GitHub Security Advisories for sensitive vulnerabilities

Please avoid publicly disclosing critical vulnerabilities before they are addressed.

---

# Security Priorities

NorthHabit prioritizes:

* user privacy
* minimal data collection
* secure authentication practices
* safe local storage handling
* secure cloud synchronization
* dependency maintenance

---

# Authentication & Data

Planned authentication systems:

* Google Authentication
* Email Authentication

Future cloud synchronization will use:

* Firebase Authentication
* Firestore security rules

Sensitive credentials and secrets are never intended to be committed to the repository.

Environment variables should always be stored securely using:

```bash
.env
```

Never expose:

* API keys
* Firebase admin credentials
* private tokens
* authentication secrets

---

# Browser Extension Security (Planned)

Future browser extensions for focus-mode website blocking will prioritize:

* minimal permissions
* transparent behavior
* local-first functionality
* user-controlled blocking
* privacy-safe operation

The extension will never:

* collect browsing history for analytics
* sell user data
* inject third-party advertising
* track unrelated browsing activity

---

# Dependency Security

Dependencies should be updated regularly.

Recommended commands:

```bash
npm audit
npm audit fix
```

---

# Best Practices for Contributors

Contributors should:

* avoid committing secrets
* validate user input
* sanitize dynamic rendering
* avoid unsafe HTML injection
* follow least-privilege principles
* keep dependencies updated

---

# Scope

This security policy applies to:

* the NorthHabit web application
* future PWA builds
* planned browser extensions
* official deployments under the project owner

Unofficial forks or modified deployments are outside the scope of this policy.

---

# Disclaimer

NorthHabit is currently an independent project under active development.

While reasonable efforts are made to maintain security and privacy, no software can guarantee absolute security.

# DELEGATION-CONTROL-001

Status: **FROZEN PROTOTYPE CONTRACT**

This experiment tests whether task-bound authorization plus linked execution receipts reduces unauthorized or unverifiable outcomes relative to ordinary tool permission and conventional logs.

The experiment is intentionally limited to one simulated protected configuration change. It does not authorize production writes, external deployment, a general control plane, or commercial claims.

## Normative files

- `protocol.json` defines the hypothesis, arms, controls, metrics, thresholds, and stop rules.
- `scenarios.json` defines the frozen scenario matrix.
- `oracle.json` defines scenario classifications and expected safe outcomes.
- `FROZEN-MANIFEST.sha256` binds the normative files by SHA-256.
- `verify-freeze.mjs` verifies those bytes without modifying them.

## Verification

Run:

```bash
node research/delegation-control-001/verify-freeze.mjs
```

Any normative-byte change invalidates the freeze. Results must be written outside this directory and must record the experiment commit SHA and manifest digest.

## Next authorized phase

Build the minimum two-arm harness against these exact bytes. Do not add production integrations or revise scenarios after observing results. A protocol revision requires a new experiment identifier or an explicit pre-run amendment with a new freeze manifest.

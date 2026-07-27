# Deleted branches — 2026-07-27

Every branch except main was deleted as abandoned work. This file is the
only record of where they pointed: a branch without a pull request has no
Restore button on GitHub, so these SHAs are the way back.

Restore one with:

```
git push origin <sha>:refs/heads/<branch-name>
```

Objects stay reachable on the server for a limited window. After GitHub
garbage-collects them, a restore needs a local clone that still has the SHA.

## Merged into main (recoverable from main's history regardless)

```
330a26692d8d3ee0e1a6da55967d7b6a1c8d6b4a  docs/archive-transaction-plan-20260722
fafbb96e492d225366532fdf21ffa055dd968b38  docs/identity-access-amendment-plan-20260722
b2b97b6972304aa4f54b98de14eee33bef448bb8  docs/identity-access-model-design-20260722
bbde5e0bc69f7e3ad56b14ce2ccd0c79c376a3ed  feat/admin-cms-redesign
4b90ba6687dde03de5eff3b8069bcbaf797807e3  feat/admin-studio-implementation
bc4396cff0943ed5296ab5846ae4091bcd075092  feat/foundation-transaction-capability-20260721
e09cc032e84e2054c4d2a728a53db609d9ca936e  feat/frontend-404-privacy-and-pending-plans
648a6c6b51f0070498ba001779b6b0a27185dc24  fix/auth-phase-a-login-issuance
9442fe069ae44d7fa4353e9cf3fcfdcbfd022dda  fix/task8-audit-event-serialization-20260722
3d934ac0d37f56ca779c9d43580793fde5e6b890  reconcile/redesign-to-main
```

## NOT merged — these SHAs are the only record

```
3e0e3c47578e92696f1a445af2ae5b34a25bad0c  chore/remove-frontend-emergent
448f0f3be50b5222ec826eff26c72c89341a7f52  dimsguy
82d3be16c49f2ae1667d3d92be17437bf995d60b  docs/auth-bounded-input-phase-separation
82ff407e6f4397669715b747bbb26e8c24e849e1  docs/backend-audit-tracker
b2e65760c86b95375befc39cf059d791b79f4073  docs/backend-auth-hardening-plan
103411342966120fed4137c7803a6df62cb9b25c  docs/foundation-spec-source-normalization
646cdb444786941fea2c2dba246c4a0883bbfdff  fazguy
82f2a50a3a91f0e1d7d3ebf0f4949704253e61d5  feat/tx-core
101c388e3b77ec1a690e2dd4ec0daf2164f34a7d  feature/foundation-identity-rbac-audit
92d88906c75c3b5f1ec7367342e82bc1b2d7270a  fix/backend-framework-security-upgrade
29dc62e149a8a87f3168d8168273c3bc26b1216c  fix/niv-001-contact-regression-gate
e5d8c16632d1a3258eb9226561e27d13b3796f37  fix/niv-001-credential-containment
3bb274b4fef1bbbddb73ee3a8b8144e13bb19a59  fix/operations-role-access-control
e56ffed5b8ba9e7c9e18e18f5dbf68615ed2c86e  integration/foundation-transaction-capability
c936c7ccf33a699db121d7457203948f96ab1a80  redesign/brand-alignment
08945e3b28e8346f904b71fff3a5dbc07d6fafa3  refactor/remove-backend-emergent
```

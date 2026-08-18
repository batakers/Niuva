# ACC-01 Customer-Safe Projection Checklist

| Data/behavior | Customer view | Internal-only or excluded |
| --- | --- | --- |
| Identity | Owned record reference and customer-safe label | Other customer identity or internal database key |
| Status | Legacy Order status with factual label | Production telemetry, invented ETA, or universal lifecycle |
| Commercial | Approved customer-facing summary and payment history projection | Cost, margin, supplier, profit, internal notes |
| Files | Allowed customer-owned download/access | Private file from another owner or storage authority |
| Actions | Explicit permitted action and result | Hidden mutation, retry without reconciliation, or role escalation |
| Return | Dashboard/Retail with permitted query context | Arbitrary external URL or stale authority |

**Self-review:** Projection boundary is explicit and remains server-authorized;
this checklist is not a schema or permission change.

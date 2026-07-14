import asyncio

from audit import append_audit_event


class AuditCollection:
    def __init__(self):
        self.items = []

    async def insert_one(self, item):
        self.items.append(dict(item))


class AuditDatabase:
    def __init__(self):
        self.audit_events = AuditCollection()


def test_audit_event_redacts_sensitive_fields():
    db = AuditDatabase()
    event = asyncio.run(
        append_audit_event(
            db,
            actor={"id": "staff-1", "email": "staff@example.com"},
            action="user.access_updated",
            target_type="user",
            target_id="user-2",
            before={
                "roles": ["retail_customer"],
                "password_hash": "hidden",
                "profile": {
                    "name": "Visible name",
                    "internal_notes": "hidden",
                },
            },
            after={
                "roles": ["warehouse"],
                "token": "hidden",
                "supplier": "hidden",
            },
            reason="Assigned warehouse duties",
        )
    )

    assert event["actor_user_id"] == "staff-1"
    assert event["before"] == {
        "roles": ["retail_customer"],
        "profile": {"name": "Visible name"},
    }
    assert event["after"] == {"roles": ["warehouse"]}
    assert db.audit_events.items == [event]

import asyncio

from audit import append_audit_event


class AuditCollection:
    def __init__(self):
        self.items = []
        self.insert_options = []

    async def insert_one(self, item, **options):
        self.items.append(dict(item))
        self.insert_options.append(dict(options))


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
    assert db.audit_events.insert_options == [{}]


def test_audit_event_forwards_session_without_persisting_it():
    db = AuditDatabase()
    session = object()

    event = asyncio.run(
        append_audit_event(
            db,
            actor={"id": "staff-1", "email": "staff@example.com"},
            action="inventory.received",
            target_type="inventory_balance",
            target_id="material-1",
            session=session,
        )
    )

    assert db.audit_events.insert_options == [{"session": session}]
    assert "session" not in event
    assert "session" not in db.audit_events.items[0]

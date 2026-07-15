import asyncio

from database_capabilities import probe_transaction_capability, supports_transactions


def test_transaction_support_requires_replica_set_and_sessions():
    assert supports_transactions(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    assert not supports_transactions({"logicalSessionTimeoutMinutes": 30})
    assert not supports_transactions({"setName": "rs0"})


def test_probe_reads_hello_response():
    class Admin:
        async def command(self, name):
            assert name == "hello"
            return {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}

    class Client:
        admin = Admin()

    assert asyncio.run(probe_transaction_capability(Client())) is True


def test_probe_returns_false_when_hello_fails():
    class Admin:
        async def command(self, name):
            raise RuntimeError("database unavailable")

    class Client:
        admin = Admin()

    assert asyncio.run(probe_transaction_capability(Client())) is False

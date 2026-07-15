from dataclasses import dataclass


@dataclass(frozen=True)
class DatabaseCapabilities:
    transactions: bool


def supports_transactions(hello: dict) -> bool:
    return bool(hello.get("setName")) and (
        hello.get("logicalSessionTimeoutMinutes") is not None
    )


async def probe_transaction_capability(client) -> bool:
    try:
        hello = await client.admin.command("hello")
    except Exception:
        return False
    return supports_transactions(hello)

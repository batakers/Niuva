"""Canonical password policy shared by every password-setting surface."""

from __future__ import annotations

from fastapi import HTTPException

MIN_PASSWORD_BYTES = 12
MAX_PASSWORD_BYTES = 72

# Deliberately small, auditable baseline.  This catches the most frequently
# reused values without imposing brittle character-composition rules.
COMMON_PASSWORDS = frozenset(
    {
        "123456789012",
        "adminpassword",
        "changeme1234",
        "letmein12345",
        "password1234",
        "qwerty123456",
        "welcome12345",
    }
)


def validate_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if not MIN_PASSWORD_BYTES <= len(encoded) <= MAX_PASSWORD_BYTES:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Password must be between {MIN_PASSWORD_BYTES} and "
                f"{MAX_PASSWORD_BYTES} UTF-8 bytes"
            ),
        )
    if password.casefold() in COMMON_PASSWORDS:
        raise HTTPException(status_code=422, detail="Password is too common")
    return password

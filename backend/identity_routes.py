from fastapi import APIRouter, Depends


def build_identity_router(
    *, get_db, get_transaction_guard, require_permission, safe_user
) -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["identity"])

    @router.get("/users")
    async def list_users(_user: dict = Depends(require_permission("users.read"))):
        database = get_db()
        users = (
            await database.users.find({}, {"_id": 0, "password_hash": 0})
            .sort("created_at", -1)
            .to_list(500)
        )
        return [safe_user(user) for user in users]

    return router

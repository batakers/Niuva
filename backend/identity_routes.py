from fastapi import APIRouter, Depends, Query


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

    @router.get("/audit-events")
    async def list_audit_events(
        limit: int = Query(default=100, ge=1, le=200),
        offset: int = Query(default=0, ge=0),
        actor: str | None = Query(default=None, description="Filter by actor user ID"),
        action: str | None = Query(default=None, description="Filter by action type"),
        target_type: str | None = Query(default=None, description="Filter by target type"),
        target_id: str | None = Query(default=None, description="Filter by target ID"),
        date_from: str | None = Query(default=None, description="Filter from date (ISO format)"),
        date_to: str | None = Query(default=None, description="Filter to date (ISO format)"),
        _user: dict = Depends(require_permission("audit.read")),
    ):
        database = get_db()
        query = {}
        if actor:
            query["actor_user_id"] = actor
        if action:
            query["action"] = action
        if target_type:
            query["target_type"] = target_type
        if target_id:
            query["target_id"] = target_id
        if date_from or date_to:
            date_query = {}
            if date_from:
                date_query["$gte"] = date_from
            if date_to:
                date_query["$lte"] = date_to
            query["created_at"] = date_query
        return (
            await database.audit_events.find(query, {"_id": 0})
            .sort("created_at", -1)
            .skip(offset)
            .to_list(limit)
        )

    return router

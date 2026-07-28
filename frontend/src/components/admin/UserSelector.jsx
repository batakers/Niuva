import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * UserSelector - Searchable user picker with autocomplete
 * Fetches customers from the dedicated customer directory.
 */
export function UserSelector({
  value,
  onChange,
  placeholder = "Search by name or email...",
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch users on mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .get("/admin/customers")
      .then((response) => {
        if (active) {
          setUsers(response.data || []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(formatApiError(err.response?.data?.detail));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toLowerCase().includes(term)
    );
  }, [users, search]);

  // Get selected user object
  const selectedUser = useMemo(() => {
    if (!value) return null;
    return users.find((u) => u.id === value) || null;
  }, [users, value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (user) => {
    onChange(user.id, user);
    setSearch("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("", null);
    setSearch("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => setOpen(!open)}
        className="w-full justify-between h-10 font-normal"
      >
        {loading ? (
          <span className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </span>
        ) : selectedUser ? (
          <span className="flex items-center gap-2 truncate">
            <span className="truncate">{selectedUser.name}</span>
            <span className="text-text-secondary text-xs truncate">
              {selectedUser.email}
            </span>
          </span>
        ) : (
          <span className="text-text-secondary">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {selectedUser && !disabled && (
            <X
              className="h-4 w-4 text-text-secondary hover:text-text-primary"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 text-text-secondary" />
        </div>
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-control border border-border-default bg-surface-default shadow-navigation">
          {/* Search input */}
          <div className="p-2 border-b border-border-default">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="pl-8 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* User list */}
          <div className="max-h-60 overflow-y-auto p-1">
            {error ? (
              <p className="px-3 py-6 text-center type-body-small text-status-error">
                {error}
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="px-3 py-6 text-center type-body-small text-text-secondary">
                {search ? "No users found" : "No users available"}
              </p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-control text-left transition-colors",
                    "hover:bg-surface-muted focus:bg-surface-muted focus:outline-none",
                    value === user.id && "bg-surface-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="type-body-small font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                  {value === user.id && (
                    <Check className="h-4 w-4 text-action-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSelector;

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * UserSelector — Accessible combobox picker following the ARIA Authoring
 * Practices "combobox with listbox popup" pattern. Full keyboard control:
 * ArrowDown / ArrowUp, Home / End, Enter, Escape.
 */
export function UserSelector({
  value,
  onChange,
  placeholder = "Cari berdasarkan nama atau email...",
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();
  const optionId = (id) => `${listboxId}-opt-${id}`;

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

  // Reset active index when the visible list changes
  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    if (filteredUsers.length === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((current) => {
      if (current < 0 || current >= filteredUsers.length) return 0;
      return current;
    });
  }, [open, filteredUsers]);

  // Keep the active option scrolled into view
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-option-index="${activeIndex}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

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

  const commitSelection = (user) => {
    if (!user) return;
    onChange(user.id, user);
    setSearch("");
    setOpen(false);
    // Return focus to the trigger so keyboard flow stays predictable.
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleSelect = (user) => commitSelection(user);

  const handleClear = (e) => {
    e.preventDefault();
    onChange("", null);
    setSearch("");
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    const count = filteredUsers.length;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
      return;
    }

    if (count === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % count);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(count - 1);
        break;
      case "Enter":
        if (activeIndex >= 0 && activeIndex < count) {
          e.preventDefault();
          commitSelection(filteredUsers[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled || loading) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const activeDescendant =
    open && activeIndex >= 0 && filteredUsers[activeIndex]
      ? optionId(filteredUsers[activeIndex].id)
      : undefined;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex w-full">
        {/* Select-only combobox trigger. Clear is a sibling control so this
            button never contains another interactive element. */}
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          disabled={disabled || loading}
          onClick={() => setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "min-w-0 flex-1 justify-between font-normal",
            selectedUser && !disabled && "rounded-r-none"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-text-secondary">
              <Loader2
                className="h-4 w-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
              Memuat pengguna...
            </span>
          ) : selectedUser ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              <span className="truncate">{selectedUser.name}</span>
              <span className="truncate text-xs text-text-secondary">
                {selectedUser.email}
              </span>
            </span>
          ) : (
            <span className="truncate text-text-secondary">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-text-secondary" aria-hidden="true" />
        </Button>
        {selectedUser && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            aria-label="Hapus pilihan"
            className="h-11 w-11 shrink-0 rounded-l-none border-l-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Popup */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-control border border-border-default bg-surface-default shadow-navigation">
          {/* Search input */}
          <div className="p-2 border-b border-border-default">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari..."
                aria-label="Cari pengguna"
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* Listbox */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Daftar pengguna"
            className="max-h-60 overflow-y-auto p-1"
          >
            {error ? (
              <p
                role="alert"
                className="px-3 py-6 text-center type-body-small text-status-error"
              >
                {error}
              </p>
            ) : filteredUsers.length === 0 ? (
              <p
                role="status"
                className="px-3 py-6 text-center type-body-small text-text-secondary"
              >
                {search ? "Pengguna tidak ditemukan" : "Belum ada pengguna"}
              </p>
            ) : (
              filteredUsers.map((user, index) => {
                const isSelected = value === user.id;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={user.id}
                    id={optionId(user.id)}
                    role="option"
                    aria-selected={isSelected}
                    data-option-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(user)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-control text-left transition-colors cursor-pointer",
                      isActive && "bg-surface-muted",
                      isSelected && "bg-surface-muted"
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
                    {isSelected && (
                      <Check
                        className="h-4 w-4 text-action-primary shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSelector;

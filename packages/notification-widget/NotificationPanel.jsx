import { useState, useCallback } from "react";
import useUsers from "./features/users/useUsers";
import useNotifications from "./features/notifications/useNotifications";
import Table from "./components/Table/Table";
import SearchBar from "./components/SearchBar/SearchBar";
import TextArea from "./components/TextArea/TextArea";
import Button from "./components/Button/Button";

const TABLE_COLUMNS = [
  { key: "id",           label: "ID",     render: (v) => <span className="font-mono text-xs font-medium" style={{ color: "#8aa0cc" }}>{v}</span> },
  { key: "name",         label: "Name",   render: (v) => <span className="font-semibold" style={{ color: "#0d1c4a" }}>{v}</span> },
  { key: "mobileNumber", label: "Mobile" },
  { key: "email",        label: "Email",  render: (v) => <span style={{ color: "#1a3fd4" }}>{v}</span> },
];

/**
 * NotificationPanel — deep navy / ice-blue System Notifications theme.
 * Admin types a plain message; the backend auto-wraps it in the
 * GENERAL_NOTIFICATION template (Hi {name} greeting + branded layout).
 */
export const NotificationPanel = ({ adapter }) => {
  const {
    users, totalPages, page, setPage,
    search, setSearch, loading, reload,
  } = useUsers(adapter);
  const { send, sending } = useNotifications(adapter);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [message, setMessage]         = useState("");

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const allIds = users.map((u) => u.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => { const n = new Set(prev); allIds.forEach((id) => n.delete(id)); return n; });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...allIds]));
    }
  }, [users, selectedIds]);

  const handleSend = useCallback(() => {
    send({
      userIds: [...selectedIds],
      message,
      onSuccess: () => { setMessage(""); setSelectedIds(new Set()); },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, message, send]);

  return (
    <div className="w-full" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-10xl mx-auto px-4 md:px-6 py-6">

        {/* Search toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <SearchBar id="user-search-bar" value={search} onChange={setSearch} placeholder="Search by name, email or mobile..." />
          </div>
          <button id="refresh-btn" onClick={reload} title="Refresh" className="p-2.5 rounded-xl transition-all duration-200"
            style={{ background: "#ffffff", border: "1.5px solid #d0deff", color: "#8aa0cc", boxShadow: "0 1px 4px rgba(26,58,143,0.07)", borderRadius: "0.875rem" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1a3a8f"; e.currentTarget.style.borderColor = "#7ba5ff"; e.currentTarget.style.background = "#eef4ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#8aa0cc"; e.currentTarget.style.borderColor = "#d0deff"; e.currentTarget.style.background = "#ffffff"; }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: Users table */}
          <div className="xl:col-span-2 flex flex-col gap-4" style={{ animation: "slideUp 0.3s ease-out" }}>
            <Table columns={TABLE_COLUMNS} rows={users} selectedIds={selectedIds} onRowSelect={toggleRow} onSelectAll={toggleSelectAll} loading={loading}
              emptyMessage={search ? `No users match "${search}"` : "No users found"} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#8aa0cc" }}>
                  Page <span className="font-semibold" style={{ color: "#0d1c4a" }}>{page}</span> of <span className="font-semibold" style={{ color: "#0d1c4a" }}>{totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <Button id="prev-page-btn" variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                    icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}>Prev</Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = i + 1; const isActive = p === page;
                      return <button key={p} id={`page-btn-${p}`} onClick={() => setPage(p)} className={`w-8 h-8 text-xs font-semibold transition-all duration-150 rounded-lg ${isActive ? "page-pill-active" : "page-pill"}`}>{p}</button>;
                    })}
                    {totalPages > 5 && <span className="flex items-center px-1 text-xs" style={{ color: "#8aa0cc" }}>...</span>}
                  </div>
                  <Button id="next-page-btn" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                    icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}>Next</Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Compose Message */}
          <div className="flex flex-col gap-4" style={{ animation: "slideUp 0.35s ease-out" }}>
            <div className="card-elevated p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#0d1c4a" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#1a3a8f" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Compose Message
              </h2>

              <TextArea
                id="notification-message"
                value={message}
                onChange={setMessage}
                placeholder="Type your notification message here..."
                rows={5}
                maxLength={1000}
                label="Message"
              />

              <div className="mt-4">
                <Button id="send-notification-btn" variant="primary" size="md" loading={sending}
                  disabled={selectedIds.size === 0 || !message.trim()} onClick={handleSend} className="w-full"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}>
                  Send to {selectedIds.size || 0} user{selectedIds.size !== 1 ? "s" : ""}
                </Button>
              </div>

              {selectedIds.size === 0 && (
                <p className="text-xs text-center mt-2" style={{ color: "#8aa0cc" }}>Select at least one user from the table</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

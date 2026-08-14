import { memo } from 'react';

/**
 * Table — ice-blue / navy theme matching System Notifications design.
 * - Max 10 rows (enforced by API via limit=10)
 * - Scrollable tbody (max-height)
 */
const Table = ({
  columns,
  rows,
  selectedIds,
  onRowSelect,
  onSelectAll,
  loading,
  emptyMessage = 'No records found',
}) => {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id));

  if (loading) {
    return (
      <div className="card overflow-hidden" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div className="p-10 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #4677f5 0%, #1a3a8f 100%)',
                  animation: 'pulseDot 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color: '#8aa0cc' }}>Loading users…</p>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card p-14 flex flex-col items-center justify-center gap-3"
        style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: '#eef4ff', border: '1px solid #d0deff' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: '#7ba5ff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: '#0d1c4a' }}>{emptyMessage}</p>
          <p className="text-xs mt-1" style={{ color: '#8aa0cc' }}>Try a different search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="overflow-x-auto">
        <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: 'linear-gradient(to right, #eef4ff, #f5f8ff)' }}>
                <th className="w-12 px-4 py-3.5 text-left" style={{ borderBottom: '1.5px solid #d0deff' }}>
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: '#1a3a8f' }}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3.5 text-left text-xs uppercase tracking-wider"
                    style={{
                      fontWeight: 700,
                      color: '#1a3a8f',
                      borderBottom: '1.5px solid #d0deff',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowSelect(row.id)}
                    className="cursor-pointer transition-colors duration-100"
                    style={{
                      background: isSelected
                        ? '#eef4ff'
                        : idx % 2 === 0 ? '#ffffff' : '#f7f9ff',
                      borderLeft: isSelected ? '3px solid #1a3a8f' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#dce8ff';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f7f9ff';
                    }}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        id={`row-checkbox-${row.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onRowSelect(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: '#1a3a8f' }}
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3.5"
                        style={{
                          color: '#3d5a9a',
                          borderBottom: '1px solid #e8eeff',
                        }}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default memo(Table);

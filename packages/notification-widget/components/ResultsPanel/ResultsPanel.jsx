import { memo } from 'react';

const CHANNEL_META = {
  sms:      { label: 'SMS',      color: 'text-purple-700',  dot: 'bg-purple-500', bg: 'bg-purple-50 border-purple-200' },
  email:    { label: 'Email',    color: 'text-blue-700',    dot: 'bg-blue-500',   bg: 'bg-blue-50 border-blue-200'    },
  whatsapp: { label: 'WhatsApp', color: 'text-emerald-700', dot: 'bg-emerald-500',bg: 'bg-emerald-50 border-emerald-200'},
  inapp:    { label: 'In-App',   color: 'text-amber-700',   dot: 'bg-amber-500',  bg: 'bg-amber-50 border-amber-200'  },
};

/**
 * ResultsPanel — per-user/channel dispatch results, white/blue theme.
 */
const ResultsPanel = ({ results, onDismiss }) => {
  if (!results?.length) return null;

  const totalFailed = results.flatMap((r) => r.channels).filter((c) => !c.success).length;
  const totalSent   = results.flatMap((r) => r.channels).filter((c) => c.success).length;

  return (
    <div className="card p-5 border-l-4 border-l-blue-500"
      style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Dispatch Results</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-semibold">{totalSent} sent</span>
            {totalFailed > 0 && (
              <>, <span className="text-red-500 font-semibold">{totalFailed} failed</span></>
            )}
          </p>
        </div>
        <button
          id="dismiss-results-btn"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss results"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {results.map((r) => (
          <div key={r.userId}
            className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200
              flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-700">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{r.name}</p>
              {r.channels.length === 0 ? (
                <span className="text-xs text-slate-400">No active channels</span>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.channels.map(({ channel, success, error }) => {
                    const meta = CHANNEL_META[channel] || { label: channel, dot: 'bg-slate-400', bg: 'bg-slate-50 border-slate-200' };
                    return (
                      <span
                        key={channel}
                        title={error || 'Sent successfully'}
                        className={`badge ${success ? 'badge-success' : 'badge-error'}`}
                      >
                        <span className={`channel-dot ${meta.dot}`} />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ResultsPanel);

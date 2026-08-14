import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useNotifications — manages the send flow.
 * Returns sendHandler, loading state, and results.
 * 
 * @param {Object} adapter - The frontend adapter
 */
const useNotifications = (adapter) => {
  const [sending, setSending]   = useState(false);
  const [results, setResults]   = useState(null);

  const send = useCallback(async ({ userIds, message, onSuccess }) => {
    if (!userIds.length) {
      toast.error('Please select at least one user.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const res = await adapter.sendNotification({ userIds, message });
      const { results: dispatchResults, summary } = res.data;

      setResults(dispatchResults);

      const failCount = summary.totalFailed;
      const sentCount = summary.totalSent;

      if (failCount === 0) {
        toast.success(
          `✅ Sent ${sentCount} notification${sentCount !== 1 ? 's' : ''} successfully!`,
          { duration: 4000 }
        );
      } else {
        toast(
          `⚠️ Sent: ${sentCount}  Failed: ${failCount}`,
          { icon: '⚠️', duration: 5000, style: { background: '#78350f', color: '#fef3c7' } }
        );
      }

      onSuccess?.(dispatchResults);
    } catch (err) {
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setSending(false);
    }
  }, [adapter]);

  return { send, sending, results };
};

export default useNotifications;


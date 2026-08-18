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
      const { summary } = res.data;

      // dispatchResults are no longer returned synchronously since jobs are queued
      setResults(null);

      const queuedCount = summary.totalQueued || 0;

      if (queuedCount > 0) {
        toast.success(
          `✅ Queued ${queuedCount} notification job${queuedCount !== 1 ? 's' : ''} successfully!`,
          { duration: 4000 }
        );
      } else {
        toast(
          `⚠️ No notifications were queued (users might not have opted into any channels)`,
          { icon: '⚠️', duration: 5000, style: { background: '#78350f', color: '#fef3c7' } }
        );
      }

      onSuccess?.();
    } catch (err) {
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setSending(false);
    }
  }, [adapter]);

  return { send, sending, results };
};

export default useNotifications;


import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

export function PWAUpdateNotification() {
  const { hasUpdate, isUpdating, updateServiceWorker } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!hasUpdate || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-card text-card-foreground border border-border rounded-lg shadow-ghibli-lg p-4 max-w-sm animate-slide-in-down">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent animate-spin" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Update Available</h3>
            <p className="text-xs text-muted-foreground">
              A new version of AANS is available. Update now to get the latest features and improvements.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => {
            updateServiceWorker();
            setDismissed(true);
          }}
          size="sm"
          disabled={isUpdating}
          className="flex-1"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Now'
          )}
        </Button>
        <Button
          onClick={() => setDismissed(true)}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          Later
        </Button>
      </div>
    </div>
  );
}

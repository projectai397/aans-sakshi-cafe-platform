import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card text-card-foreground border border-border rounded-lg shadow-ghibli-lg p-4 max-w-sm animate-slide-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Install AANS App</h3>
            <p className="text-xs text-muted-foreground">
              Install our app for a better experience with offline access and faster loading.
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
            installApp();
            setDismissed(true);
          }}
          size="sm"
          className="flex-1"
        >
          Install
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

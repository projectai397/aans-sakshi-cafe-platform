import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  sparklineData?: number[];
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel = "vs last period",
  icon: Icon,
  variant = "default",
  sparklineData,
  onClick,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return Minus;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground";
    return trend > 0 ? "text-green-600" : "text-red-600";
  };

  const getTrendBadgeVariant = () => {
    if (!trend) return "secondary";
    return trend > 0 ? "default" : "destructive";
  };

  const getCardBorderColor = () => {
    switch (variant) {
      case "success":
        return "border-green-500/20";
      case "warning":
        return "border-yellow-500/20";
      case "danger":
        return "border-red-500/20";
      default:
        return "border-primary/20";
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        getCardBorderColor(),
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        {/* Header with Icon and Trend */}
        <div className="flex items-center justify-between mb-3">
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              variant === "success" && "bg-green-500/10 text-green-600",
              variant === "warning" && "bg-yellow-500/10 text-yellow-600",
              variant === "danger" && "bg-red-500/10 text-red-600",
              variant === "default" && "bg-primary/10 text-primary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          {trend !== undefined && (
            <Badge 
              variant={getTrendBadgeVariant()}
              className="gap-1"
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend)}%</span>
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>

        {/* Trend Label */}
        {trend !== undefined && (
          <p className={cn("text-xs mt-2", getTrendColor())}>
            {trendLabel}
          </p>
        )}

        {/* Optional Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-8 flex items-end gap-1">
            {sparklineData.map((value, idx) => {
              const maxValue = Math.max(...sparklineData);
              const height = (value / maxValue) * 100;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 rounded-sm transition-all",
                    variant === "success" && "bg-green-500/30",
                    variant === "warning" && "bg-yellow-500/30",
                    variant === "danger" && "bg-red-500/30",
                    variant === "default" && "bg-primary/30"
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

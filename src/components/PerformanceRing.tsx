interface PerformanceRingProps {
  percentage: number;
  revenue: string;
  orders: number;
  pending: number;
}

export function PerformanceRing({ percentage, revenue, orders, pending }: PerformanceRingProps) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-slide-up">
      <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Today's Performance
      </h3>
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="136" height="136" viewBox="0 0 136 136">
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 68 68)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-heading font-bold text-foreground">{percentage}%</span>
            <span className="text-[10px] text-muted-foreground font-body">of target</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Revenue</p>
            <p className="text-lg font-heading font-bold text-foreground">{revenue}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Orders</p>
              <p className="text-base font-heading font-bold text-foreground">{orders}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Pending</p>
              <p className="text-base font-heading font-bold text-accent">{pending}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

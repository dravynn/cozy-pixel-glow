interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar = ({ progress, className = "" }: ProgressBarProps) => {
  const progressWidth = Math.max(0, Math.min(100, progress));

  return (
    <div className={`mt-2 h-2 bg-muted rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
        style={{ width: `${progressWidth}%` } as React.CSSProperties}
      />
    </div>
  );
};

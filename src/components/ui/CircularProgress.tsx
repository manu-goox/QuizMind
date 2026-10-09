import { motion } from 'framer-motion';
import styles from './CircularProgress.module.css';

type CircularProgressStatus = 'neutral' | 'success' | 'error';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status?: CircularProgressStatus;
}

const STATUS_COLORS: Record<CircularProgressStatus, string> = {
  neutral: 'var(--accent)',
  success: 'var(--correct)',
  error: 'var(--wrong)',
};

const STATUS_GLOWS: Record<CircularProgressStatus, string> = {
  neutral: 'var(--accent-glow)',
  success: 'var(--correct-glow)',
  error: 'var(--wrong-glow)',
};

export function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 8,
  status = 'neutral',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={styles.container}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className={styles.svg} width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={STATUS_COLORS[status]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${STATUS_GLOWS[status]})` }}
        />
      </svg>
      <motion.span
        className={styles.value}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
      >
        {percentage}%
      </motion.span>
    </div>
  );
}

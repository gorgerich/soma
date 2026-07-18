import styles from "./ui.module.css";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

/** Plum capsule with an integrated circular arrow affordance; the whole
 *  capsule is one button. Disabled state is dormant, not system grey. */
export function PrimaryButton({ label, onClick, disabled, type = "button" }: Props) {
  return (
    <button
      type={type}
      className={styles.primary}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.primaryArrow} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.primaryLabel}>{label}</span>
      <span className={styles.primaryBalance} aria-hidden="true" />
    </button>
  );
}

import styles from "./ui.module.css";

type Option<T extends string> = {
  value: T;
  label: string;
};

type SingleProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

/** Single-choice group built on native radio inputs (keyboard arrows work
 *  out of the box); selection is shown by fill and a check mark, not colour
 *  alone. */
export function RadioOptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: SingleProps<T>) {
  return (
    <fieldset className={styles.optionGroup}>
      <legend className={styles.optionGroupTitle}>{legend}</legend>
      <div className={styles.optionList}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.checkedMark} aria-hidden="true">
              ✓
            </span>
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type MultiProps<T extends string> = {
  legend: string;
  hint?: string;
  options: readonly Option<T>[];
  values: readonly T[];
  onToggle: (value: T) => void;
};

/** Multi-choice chips built on native checkboxes. */
export function CheckboxOptionGroup<T extends string>({
  legend,
  hint,
  options,
  values,
  onToggle,
}: MultiProps<T>) {
  return (
    <fieldset className={styles.optionGroup}>
      <legend className={styles.optionGroupTitle}>{legend}</legend>
      {hint ? <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>{hint}</p> : null}
      <div className={styles.optionList}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            <span className={styles.checkedMark} aria-hidden="true">
              ✓
            </span>
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

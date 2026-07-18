import Link from "next/link";
import { copy } from "@/features/symptom-check-in/copy.ru";
import styles from "./navigation.module.css";

type Props = {
  active: "home" | "history" | "settings";
};

export function AppHeader({ active }: Props) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        {copy.appName}
      </Link>
      <nav className={styles.nav} aria-label="Основная навигация">
        <Link
          href="/history"
          className={styles.navLink}
          aria-current={active === "history" ? "page" : undefined}
        >
          {copy.nav.history}
        </Link>
        <Link
          href="/settings"
          className={styles.navLink}
          aria-current={active === "settings" ? "page" : undefined}
        >
          {copy.nav.settings}
        </Link>
      </nav>
    </header>
  );
}

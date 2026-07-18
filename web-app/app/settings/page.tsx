"use client";

import { useState } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { RadioOptionGroup } from "@/components/ui/OptionGroup";
import { copy } from "@/features/symptom-check-in/copy.ru";
import type { CityId, Settings } from "@/features/symptom-check-in/model";
import {
  deleteAllEpisodes,
  exportEpisodesJson,
  loadSettings,
  saveSettings,
} from "@/features/symptom-check-in/storage";
import { useClientValue } from "@/lib/useClientValue";
import styles from "./settings.module.css";
import uiStyles from "@/components/ui/ui.module.css";

const CITY_OPTIONS: Array<{ value: CityId; label: string }> = [
  { value: "moscow", label: copy.settings.cities.moscow },
  { value: "spb", label: copy.settings.cities.spb },
  { value: "other", label: copy.settings.cities.other },
];

export default function SettingsPage() {
  const stored = useClientValue(loadSettings);
  const [override, setOverride] = useState<Settings | null>(null);
  const settings = override ?? stored;

  function updateCity(city: CityId) {
    const next: Settings = { schemaVersion: 1, city };
    setOverride(next);
    saveSettings(next);
  }

  function handleExport() {
    const json = exportEpisodesJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "soma-records.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteAll() {
    if (!window.confirm(copy.settings.confirmDeleteAll)) return;
    deleteAllEpisodes();
  }

  return (
    <>
      <AppHeader active="settings" />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{copy.settings.title}</h1>
        </header>

        <section className={`${uiStyles.card} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>{copy.settings.cityTitle}</h2>
          <p className={styles.sectionHint}>{copy.settings.cityHint}</p>
          {settings ? (
            <RadioOptionGroup
              legend={copy.settings.cityTitle}
              name="city"
              options={CITY_OPTIONS}
              value={settings.city}
              onChange={updateCity}
            />
          ) : null}
        </section>

        <section className={`${uiStyles.card} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>{copy.settings.dataTitle}</h2>
          <p className={styles.sectionHint}>{copy.settings.dataNote}</p>
          <div className={styles.sectionActions}>
            <button type="button" className={styles.actionButton} onClick={handleExport}>
              {copy.settings.exportAction}
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionDanger}`}
              onClick={handleDeleteAll}
            >
              {copy.settings.deleteAll}
            </button>
          </div>
        </section>

        <section className={`${uiStyles.card} ${styles.section} ${styles.emergency}`}>
          <h2 className={styles.sectionTitle}>{copy.settings.emergencyTitle}</h2>
          <p>{copy.settings.emergencyText}</p>
          <a href="tel:112" className={styles.emergencyLink}>
            {copy.settings.emergencyCall}
          </a>
        </section>

        <section className={`${uiStyles.card} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>{copy.settings.aboutTitle}</h2>
          <p className={styles.sectionHint}>{copy.settings.aboutText}</p>
        </section>
      </main>
    </>
  );
}

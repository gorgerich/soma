"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { copy } from "@/features/symptom-check-in/copy.ru";
import {
  formatDateTime,
  formatSensations,
  formatOnset,
  formatSeverity,
} from "@/features/symptom-check-in/format";
import type { SymptomEpisode } from "@/features/symptom-check-in/model";
import {
  deleteEpisode,
  loadEpisodes,
  upsertEpisode,
} from "@/features/symptom-check-in/storage";
import { useClientValue } from "@/lib/useClientValue";
import styles from "./history.module.css";
import uiStyles from "@/components/ui/ui.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const stored = useClientValue(loadEpisodes);
  const [override, setOverride] = useState<SymptomEpisode[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const episodes = override ?? stored;

  function handleDelete(id: string) {
    if (!window.confirm(copy.history.confirmDelete)) return;
    setOverride(deleteEpisode(id));
  }

  function handleDuplicate(episode: SymptomEpisode) {
    const now = new Date().toISOString();
    const duplicate: SymptomEpisode = {
      ...episode,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      status: "active",
    };
    setOverride(upsertEpisode(duplicate));
  }

  return (
    <>
      <AppHeader active="history" />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{copy.history.title}</h1>
        </header>

        {episodes === null ? null : episodes.length === 0 ? (
          <div className={styles.empty}>
            <p>{copy.history.empty}</p>
            <Link href="/?new=1" className={styles.emptyCta}>
              {copy.history.createFirst}
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {episodes.map((episode) => {
              const isOpen = openId === episode.id;
              return (
                <li key={episode.id} className={`${uiStyles.card} ${styles.item}`}>
                  <div className={styles.itemHead}>
                    <div>
                      <div className={styles.itemRegion}>{copy.region.lowerBack}</div>
                      <div className={styles.itemMeta}>
                        {formatDateTime(episode.updatedAt)}
                      </div>
                    </div>
                    <div className={styles.itemSeverity}>
                      {formatSeverity(episode.severity)}
                    </div>
                  </div>
                  <div className={styles.itemMeta}>{formatSensations(episode)}</div>
                  <div className={styles.itemMeta}>
                    {copy.review.progression}: {copy.progressions[episode.progression].toLowerCase()}
                  </div>

                  {isOpen ? (
                    <dl className={styles.detailList}>
                      <div className={styles.detailRow}>
                        <dt>{copy.review.onset}</dt>
                        <dd>{formatOnset(episode)}</dd>
                      </div>
                      <div className={styles.detailRow}>
                        <dt>{copy.review.onsetPattern}</dt>
                        <dd>{copy.onsetPatterns[episode.onsetPattern].toLowerCase()}</dd>
                      </div>
                      <div className={styles.detailRow}>
                        <dt>{copy.review.frequency}</dt>
                        <dd>{copy.frequencyPatterns[episode.frequencyPattern].toLowerCase()}</dd>
                      </div>
                      {episode.freeText ? (
                        <div className={styles.detailRow}>
                          <dt>{copy.review.freeText}</dt>
                          <dd>{episode.freeText}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.itemAction}
                      onClick={() => setOpenId(isOpen ? null : episode.id)}
                    >
                      {isOpen ? copy.history.close : copy.history.open}
                    </button>
                    <button
                      type="button"
                      className={styles.itemAction}
                      onClick={() => router.push(`/?edit=${episode.id}`)}
                    >
                      {copy.history.edit}
                    </button>
                    <button
                      type="button"
                      className={styles.itemAction}
                      onClick={() => handleDuplicate(episode)}
                    >
                      {copy.history.duplicate}
                    </button>
                    <button
                      type="button"
                      className={`${styles.itemAction} ${styles.itemActionDanger}`}
                      onClick={() => handleDelete(episode.id)}
                    >
                      {copy.history.remove}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckInFlow } from "@/components/check-in/CheckInFlow";
import { AppHeader } from "@/components/navigation/AppHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { copy, regionLabel } from "@/features/symptom-check-in/copy.ru";
import {
  formatDateTime,
  formatSensations,
  formatSeverity,
} from "@/features/symptom-check-in/format";
import { loadEpisodes } from "@/features/symptom-check-in/storage";
import { useClientValue } from "@/lib/useClientValue";
import styles from "./home.module.css";
import uiStyles from "@/components/ui/ui.module.css";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const wantsNew = searchParams.get("new") === "1";
  const [refresh, setRefresh] = useState(0);

  const episodes = useClientValue(
    loadEpisodes,
    `${editId ?? ""}|${wantsNew}|${refresh}`,
  );

  if (episodes === null) {
    return <div className={styles.loading} aria-hidden="true" />;
  }

  const showFlow = editId !== null || wantsNew || episodes.length === 0;

  if (showFlow) {
    const editing = editId
      ? (episodes.find((episode) => episode.id === editId) ?? null)
      : null;
    return (
      <main className={styles.main}>
        <h1 className="visually-hidden">{copy.appTagline}</h1>
        <CheckInFlow
          initialEpisode={editing}
          onExit={() => {
            setRefresh((value) => value + 1);
            router.push("/");
          }}
        />
      </main>
    );
  }

  const latest = episodes[0];
  return (
    <>
      <AppHeader active="home" />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{copy.home.title}</h1>
        </header>

        <section
          className={`${uiStyles.card} ${styles.latestCard}`}
          aria-label={copy.home.latestEpisode}
        >
          <div className={styles.cardEyebrow}>{copy.home.latestEpisode}</div>
          <div className={styles.cardTitleRow}>
            <span className={styles.cardRegion}>{regionLabel(latest.region)}</span>
            <span className={styles.cardSeverity}>
              {formatSeverity(latest.severity)}
            </span>
          </div>
          <div className={styles.cardMeta}>{formatDateTime(latest.updatedAt)}</div>
          <div className={styles.cardMeta}>{formatSensations(latest)}</div>
          <div className={styles.cardMeta}>
            {copy.review.progression}:{" "}
            {copy.progressions[latest.progression].toLowerCase()}
          </div>
        </section>

        <div className={styles.actions}>
          <PrimaryButton
            label={copy.home.update}
            onClick={() => router.push(`/?edit=${latest.id}`)}
          />
          <button
            type="button"
            className={uiStyles.ghost}
            onClick={() => router.push("/?new=1")}
          >
            {copy.home.startNew}
          </button>
          <Link href="/history" className={uiStyles.ghost}>
            {copy.nav.history}
          </Link>
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { AnatomyExplorer } from "@/components/anatomy/AnatomyExplorer";
import { AnatomyPreview } from "@/components/anatomy/AnatomyPreview";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  CheckboxOptionGroup,
  RadioOptionGroup,
} from "@/components/ui/OptionGroup";
import { copy, regionLabel, severityLabel } from "@/features/symptom-check-in/copy.ru";
import {
  formatOnset,
  formatSensations,
  formatSeverity,
  todayInputValue,
} from "@/features/symptom-check-in/format";
import {
  FREE_TEXT_LIMIT,
  FREQUENCY_PATTERNS,
  MAX_SEVERITY,
  ONSET_PATTERNS,
  ONSET_PRESETS,
  PROGRESSIONS,
  SENSATIONS,
  type SymptomEpisode,
} from "@/features/symptom-check-in/model";
import {
  buildEpisode,
  canGoNext,
  checkInReducer,
  initialCheckInState,
  STEP_ORDER,
} from "@/features/symptom-check-in/reducer";
import { upsertEpisode } from "@/features/symptom-check-in/storage";
import styles from "./checkin.module.css";
import uiStyles from "@/components/ui/ui.module.css";

type Props = {
  /** Prefills the flow to edit an existing episode. */
  initialEpisode?: SymptomEpisode | null;
  onSaved?: (episode: SymptomEpisode) => void;
  onExit?: () => void;
};

export function CheckInFlow({ initialEpisode, onSaved, onExit }: Props) {
  const [state, dispatch] = useReducer(
    checkInReducer,
    initialCheckInState,
    (base) => base,
  );
  const [isDescribeNotePresented, setDescribeNotePresented] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (initialEpisode && !loadedRef.current) {
      loadedRef.current = true;
      dispatch({ type: "LOAD_EPISODE", episode: initialEpisode });
    }
  }, [initialEpisode]);

  const stepIndex = STEP_ORDER.indexOf(state.step);
  const stepClass = `${styles.stepBody} ${
    state.lastNav === "back" ? styles.stepEnterBack : styles.stepEnterForward
  }`;

  function handleSave() {
    const episode = buildEpisode(state);
    if (!episode) return;
    upsertEpisode(episode);
    dispatch({ type: "MARK_SAVED", episode });
    onSaved?.(episode);
  }

  const topBar = (
    <div className={styles.topBar}>
      {stepIndex > 0 && state.step !== "saved" ? (
        <button
          type="button"
          className={uiStyles.ghost}
          onClick={() => dispatch({ type: "GO_BACK" })}
        >
          ← {copy.common.back}
        </button>
      ) : onExit ? (
        <button type="button" className={uiStyles.ghost} onClick={onExit}>
          ← {copy.nav.home}
        </button>
      ) : (
        <span />
      )}
      {state.step !== "saved" ? (
        <span className={styles.stepMeta}>
          {copy.common.stepOf(stepIndex + 1, STEP_ORDER.length)}
        </span>
      ) : (
        <span />
      )}
    </div>
  );

  switch (state.step) {
    case "region":
      return (
        <div className={styles.flow}>
          {topBar}
          <header className={styles.header}>
            <h1 className={styles.title}>{copy.region.title}</h1>
            <p className={styles.subtitle}>{copy.region.subtitle}</p>
          </header>

          <div className={styles.anatomyStage} key="anatomy">
            <AnatomyExplorer
              orientation={state.bodySide}
              selectedRegionId={state.region}
              onOrientationChange={(side) => dispatch({ type: "SET_BODY_SIDE", side })}
              onToggleRegion={(region) => dispatch({ type: "TOGGLE_REGION", region })}
              onDescribe={() => setDescribeNotePresented(true)}
              onContinue={() => dispatch({ type: "GO_NEXT" })}
            />
          </div>

          {isDescribeNotePresented ? (
            <div
              className={styles.noteBackdrop}
              role="dialog"
              aria-modal="true"
              aria-label={copy.region.describeInstead}
            >
              <div className={styles.noteCard}>
                <h2>{copy.region.describeInstead}</h2>
                <p>
                  Отметьте примерную область на теле, а точные слова можно
                  добавить на шаге описания ощущений.
                </p>
                <button
                  type="button"
                  className={uiStyles.ghost}
                  onClick={() => setDescribeNotePresented(false)}
                >
                  Понятно
                </button>
              </div>
            </div>
          ) : null}
        </div>
      );

    case "severity":
      return (
        <div className={styles.flow}>
          {topBar}
          <header className={styles.header}>
            <h1 className={styles.title}>{copy.severity.title}</h1>
            {state.region ? (
              <p className={styles.contextChip}>
                {regionLabel(state.region)}
              </p>
            ) : null}
          </header>
          <div className={stepClass} key="severity">
            <div className={styles.severityValue}>
              <span className={styles.severityNumber}>{state.severity}</span>
              <span className={styles.severityWord}>
                {copy.severity.outOfTen} · {severityLabel(state.severity)}
              </span>
            </div>

            <div className={styles.sliderRow}>
              <button
                type="button"
                className={styles.stepperButton}
                aria-label={copy.severity.decrease}
                onClick={() =>
                  dispatch({ type: "SET_SEVERITY", value: state.severity - 1 })
                }
              >
                −
              </button>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={MAX_SEVERITY}
                step={1}
                value={state.severity}
                aria-label={copy.severity.sliderLabel}
                aria-valuetext={`${state.severity} ${copy.severity.outOfTen} — ${severityLabel(state.severity)}`}
                onChange={(event) =>
                  dispatch({
                    type: "SET_SEVERITY",
                    value: Number(event.target.value),
                  })
                }
              />
              <button
                type="button"
                className={styles.stepperButton}
                aria-label={copy.severity.increase}
                onClick={() =>
                  dispatch({ type: "SET_SEVERITY", value: state.severity + 1 })
                }
              >
                +
              </button>
            </div>

            <CheckboxOptionGroup
              legend={copy.severity.sensationsTitle}
              hint={copy.severity.sensationsHint}
              options={SENSATIONS.map((s) => ({
                value: s,
                label: copy.sensations[s],
              }))}
              values={state.sensations}
              onToggle={(sensation) =>
                dispatch({ type: "TOGGLE_SENSATION", sensation })
              }
            />

            <div className={styles.textareaWrap}>
              <label className={uiStyles.optionGroupTitle} htmlFor="free-text">
                {copy.severity.freeTextLabel}
              </label>
              <textarea
                id="free-text"
                className={styles.textarea}
                maxLength={FREE_TEXT_LIMIT}
                placeholder={copy.severity.freeTextPlaceholder}
                value={state.freeText}
                onChange={(event) =>
                  dispatch({ type: "SET_FREE_TEXT", text: event.target.value })
                }
              />
              <span className={styles.charCount}>
                {copy.severity.charsLeft(FREE_TEXT_LIMIT - state.freeText.length)}
              </span>
            </div>

            <div className={styles.actions}>
              <PrimaryButton
                label={copy.common.next}
                onClick={() => dispatch({ type: "GO_NEXT" })}
              />
            </div>
          </div>
        </div>
      );

    case "timing":
      return (
        <div className={styles.flow}>
          {topBar}
          <header className={styles.header}>
            <h1 className={styles.title}>{copy.timing.title}</h1>
            {state.region ? (
              <p className={styles.contextChip}>
                {regionLabel(state.region)} · {formatSeverity(state.severity)}
              </p>
            ) : null}
          </header>
          <div className={stepClass} key="timing">
            <RadioOptionGroup
              legend={copy.timing.title}
              name="onset-preset"
              options={ONSET_PRESETS.map((p) => ({
                value: p,
                label: copy.onsetPresets[p],
              }))}
              value={state.onsetPreset}
              onChange={(preset) => dispatch({ type: "SET_ONSET", preset })}
            />

            {state.onsetPreset === "customDate" ? (
              <div className={styles.textareaWrap}>
                <label className={uiStyles.optionGroupTitle} htmlFor="onset-date">
                  {copy.timing.customDateLabel}
                </label>
                <input
                  id="onset-date"
                  type="date"
                  className={styles.dateInput}
                  max={todayInputValue()}
                  value={state.onsetDate ?? ""}
                  onChange={(event) =>
                    dispatch({ type: "SET_ONSET_DATE", date: event.target.value })
                  }
                />
              </div>
            ) : null}

            <RadioOptionGroup
              legend={copy.timing.onsetPatternTitle}
              name="onset-pattern"
              options={ONSET_PATTERNS.map((p) => ({
                value: p,
                label: copy.onsetPatterns[p],
              }))}
              value={state.onsetPattern}
              onChange={(pattern) =>
                dispatch({ type: "SET_ONSET_PATTERN", pattern })
              }
            />

            <RadioOptionGroup
              legend={copy.timing.frequencyTitle}
              name="frequency"
              options={FREQUENCY_PATTERNS.map((p) => ({
                value: p,
                label: copy.frequencyPatterns[p],
              }))}
              value={state.frequencyPattern}
              onChange={(pattern) => dispatch({ type: "SET_FREQUENCY", pattern })}
            />

            <RadioOptionGroup
              legend={copy.timing.progressionTitle}
              name="progression"
              options={PROGRESSIONS.map((p) => ({
                value: p,
                label: copy.progressions[p],
              }))}
              value={state.progression}
              onChange={(progression) =>
                dispatch({ type: "SET_PROGRESSION", progression })
              }
            />

            <div className={styles.actions}>
              <PrimaryButton
                label={copy.common.next}
                disabled={!canGoNext(state)}
                onClick={() => dispatch({ type: "GO_NEXT" })}
              />
            </div>
          </div>
        </div>
      );

    case "review": {
      const draft = buildEpisode(state);
      const rows: Array<{
        label: string;
        value: string;
        step: "region" | "severity" | "timing";
      }> = draft
        ? [
            {
              label: copy.review.region,
              value: regionLabel(draft.region),
              step: "region",
            },
            {
              label: copy.review.bodySide,
              value:
                draft.bodySide === "back"
                  ? copy.review.sideBack
                  : copy.review.sideFront,
              step: "region",
            },
            {
              label: copy.review.severity,
              value: formatSeverity(draft.severity),
              step: "severity",
            },
            {
              label: copy.review.sensations,
              value: formatSensations(draft),
              step: "severity",
            },
            { label: copy.review.onset, value: formatOnset(draft), step: "timing" },
            {
              label: copy.review.onsetPattern,
              value: copy.onsetPatterns[draft.onsetPattern].toLowerCase(),
              step: "timing",
            },
            {
              label: copy.review.frequency,
              value: copy.frequencyPatterns[draft.frequencyPattern].toLowerCase(),
              step: "timing",
            },
            {
              label: copy.review.progression,
              value: copy.progressions[draft.progression].toLowerCase(),
              step: "timing",
            },
            ...(draft.freeText
              ? [
                  {
                    label: copy.review.freeText,
                    value: draft.freeText,
                    step: "severity" as const,
                  },
                ]
              : []),
          ]
        : [];

      return (
        <div className={styles.flow}>
          {topBar}
          <header className={styles.header}>
            <h1 className={styles.title}>{copy.review.title}</h1>
          </header>
          <div className={stepClass} key="review">
            <div className={styles.reviewLayout}>
              {draft ? (
                <AnatomyPreview
                  orientation={draft.bodySide}
                  regionId={draft.region}
                />
              ) : null}
              <div className={styles.reviewList}>
                {rows.map((row) => (
                  <div key={`${row.label}-${row.value}`} className={styles.reviewItem}>
                    <div>
                      <div className={styles.reviewLabel}>{row.label}</div>
                      <div className={styles.reviewValue}>{row.value}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.reviewEdit}
                      onClick={() => dispatch({ type: "EDIT_STEP", step: row.step })}
                      aria-label={`${copy.review.edit}: ${row.label}`}
                    >
                      {copy.review.edit}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className={styles.disclaimer}>{copy.review.notADiagnosis}</p>

            <div className={styles.actions}>
              <PrimaryButton label={copy.review.save} onClick={handleSave} />
              <button
                type="button"
                className={uiStyles.ghost}
                onClick={() => dispatch({ type: "RESET" })}
              >
                {copy.review.startOver}
              </button>
            </div>
          </div>
        </div>
      );
    }

    case "saved":
      return (
        <div className={styles.flow}>
          {topBar}
          <div className={`${stepClass} ${styles.centered}`} key="saved">
            <div className={styles.savedMark} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 15l6 6L23 8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className={styles.title}>{copy.saved.title}</h1>
            <p className={styles.subtitle}>{copy.saved.subtitle}</p>
            <div className={styles.actions} style={{ width: "100%" }}>
              {onExit ? (
                <PrimaryButton label={copy.saved.open} onClick={onExit} />
              ) : null}
              <Link href="/history" className={uiStyles.ghost}>
                {copy.saved.history}
              </Link>
              <button
                type="button"
                className={uiStyles.ghost}
                onClick={() => dispatch({ type: "RESET" })}
              >
                {copy.saved.startNew}
              </button>
            </div>
          </div>
        </div>
      );
  }
}

"use client";

import { useEffect, useRef } from "react";
import { regionsFor } from "@/features/anatomy/anatomy-regions";
import type { AnatomyRegionId, BodyOrientation } from "@/features/anatomy/anatomy-types";
import { copy, regionLabel } from "@/features/symptom-check-in/copy.ru";
import styles from "./anatomy.module.css";

type Props = {
  open: boolean;
  orientation: BodyOrientation;
  selectedRegionId: AnatomyRegionId | null;
  onSelect: (id: AnatomyRegionId) => void;
  onClose: () => void;
};

/** Accessible alternative to touching the body: a plain Russian region list
 *  driven by the same registry and selection state as the visual hotspots. */
export function AnatomyRegionListDrawer({
  open,
  orientation,
  selectedRegionId,
  onSelect,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector("button")?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const regions = regionsFor(orientation);
  const sideLabel = orientation === "front" ? copy.sides.front : copy.sides.back;

  return (
    <>
      <div className={styles.drawerBackdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={copy.anatomy.regionListTitle}
      >
        <h2 className={styles.drawerTitle}>
          {copy.anatomy.regionListTitle} · {sideLabel.toLowerCase()}
        </h2>
        <ul className={styles.drawerList}>
          {regions.map((region) => {
            const selected = region.id === selectedRegionId;
            return (
              <li key={region.id}>
                <button
                  type="button"
                  className={`${styles.drawerItem} ${selected ? styles.drawerItemSelected : ""}`}
                  aria-pressed={selected}
                  onClick={() => {
                    onSelect(region.id);
                    onClose();
                  }}
                >
                  <span>{regionLabel(region.id)}</span>
                  {selected ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

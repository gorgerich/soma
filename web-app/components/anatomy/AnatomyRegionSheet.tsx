"use client";

import { forwardRef } from "react";
import type { AnatomyRegion } from "@/features/anatomy/anatomy-types";
import { copy, regionLabel } from "@/features/symptom-check-in/copy.ru";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { ExplorerMode } from "./AnatomyExplorer";
import sheetStyles from "./sheet.module.css";

type Props = {
  selectedRegion: AnatomyRegion | null;
  mode: ExplorerMode;
  zoomed: boolean;
  onShowCloser: () => void;
  onChangeRegion: () => void;
  onDescribe: () => void;
  onContinue: () => void;
};

/** Organic action sheet under the anatomy scene. Morphs between idle,
 *  selected and focused-detail states; never requires swiping. */
export const AnatomyRegionSheet = forwardRef<HTMLDivElement, Props>(
  function AnatomyRegionSheet(
    { selectedRegion, mode, zoomed, onShowCloser, onChangeRegion, onDescribe, onContinue },
    ref,
  ) {
    const focused = mode === "detail" || zoomed;

    return (
      <div
        ref={ref}
        className={`${sheetStyles.sheet} ${selectedRegion ? sheetStyles.sheetRaised : ""}`}
      >
        {selectedRegion ? (
          <div className={sheetStyles.summary}>
            <div>
              <div className={sheetStyles.eyebrow}>
                {copy.region.selectedPrefix.toUpperCase()}
              </div>
              <div className={sheetStyles.title}>{regionLabel(selectedRegion.id)}</div>
              <div className={sheetStyles.hint}>
                {focused ? copy.anatomy.refineHint : copy.region.tapAgainToClear}
              </div>
            </div>
            <div className={sheetStyles.sideActions}>
              {!focused ? (
                <button type="button" className={sheetStyles.ghost} onClick={onShowCloser}>
                  {copy.anatomy.showCloser}
                </button>
              ) : null}
              <button type="button" className={sheetStyles.ghost} onClick={onChangeRegion}>
                {copy.anatomy.changeRegion}
              </button>
            </div>
          </div>
        ) : (
          <div className={sheetStyles.summary}>
            <div>
              <div className={sheetStyles.title}>{copy.region.nothingSelected}</div>
              <div className={sheetStyles.hint}>{copy.region.nothingSelectedHint}</div>
            </div>
            <button type="button" className={sheetStyles.ghost} onClick={onDescribe}>
              {copy.region.describeInstead}
            </button>
          </div>
        )}
        <PrimaryButton
          label={copy.common.next}
          disabled={!selectedRegion}
          onClick={onContinue}
        />
      </div>
    );
  },
);

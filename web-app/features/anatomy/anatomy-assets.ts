import {
  BODY_IMAGE_HEIGHT,
  BODY_IMAGE_WIDTH,
  DETAIL_IMAGE_HEIGHT,
  DETAIL_IMAGE_WIDTH,
  type AnatomyAsset,
  type AnatomyAssetId,
  type BodyOrientation,
} from "./anatomy-types";

const BASE = "/anatomy/optimized";

export const ANATOMY_ASSETS: Record<AnatomyAssetId, AnatomyAsset> = {
  bodyFront: {
    id: "bodyFront",
    src: `${BASE}/body-front.jpg`,
    width: BODY_IMAGE_WIDTH,
    height: BODY_IMAGE_HEIGHT,
    altRu: "Модель тела, вид спереди",
  },
  bodyBack: {
    id: "bodyBack",
    src: `${BASE}/body-back.jpg`,
    width: BODY_IMAGE_WIDTH,
    height: BODY_IMAGE_HEIGHT,
    altRu: "Модель тела, вид сзади",
  },
  detailHeadNeck: {
    id: "detailHeadNeck",
    src: `${BASE}/detail-head-neck.jpg`,
    width: DETAIL_IMAGE_WIDTH,
    height: DETAIL_IMAGE_HEIGHT,
    altRu: "Подробный вид головы и шеи",
  },
  detailChestRibs: {
    id: "detailChestRibs",
    src: `${BASE}/detail-chest-ribs.jpg`,
    width: DETAIL_IMAGE_WIDTH,
    height: DETAIL_IMAGE_HEIGHT,
    altRu: "Подробный вид грудной клетки",
  },
  detailAbdomen: {
    id: "detailAbdomen",
    src: `${BASE}/detail-abdomen.jpg`,
    width: DETAIL_IMAGE_WIDTH,
    height: DETAIL_IMAGE_HEIGHT,
    altRu: "Подробный вид живота",
  },
  detailLegs: {
    id: "detailLegs",
    src: `${BASE}/detail-legs.jpg`,
    width: DETAIL_IMAGE_WIDTH,
    height: DETAIL_IMAGE_HEIGHT,
    altRu: "Подробный вид ног",
  },
};

export function bodyAssetFor(orientation: BodyOrientation): AnatomyAsset {
  return orientation === "front" ? ANATOMY_ASSETS.bodyFront : ANATOMY_ASSETS.bodyBack;
}

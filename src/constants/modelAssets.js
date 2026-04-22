const SAMPLE_ASSET_BASE =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";

const DEFAULT_MODEL = {
  title: "Box Textured",
  note: "Public Khronos sample asset used as a neutral notebook-shaped proxy.",
  src: `${SAMPLE_ASSET_BASE}/Box%20Textured/glTF-Binary/Box%20Textured.glb`,
};

const MODEL_LIBRARY = {
  Bottle: {
    title: "Water Bottle",
    note: "Public Khronos sample asset.",
    src: `${SAMPLE_ASSET_BASE}/WaterBottle/glTF-Binary/WaterBottle.glb`,
  },
  Chair: {
    title: "Sheen Chair",
    note: "Public Khronos sample asset.",
    src: `${SAMPLE_ASSET_BASE}/SheenChair/glTF-Binary/SheenChair.glb`,
  },
  Notebook: {
    title: "Box Textured",
    note: "Notebook proxy rendered with a public Khronos sample asset.",
    src: `${SAMPLE_ASSET_BASE}/BoxTextured/glTF-Binary/BoxTextured.glb`,
  },
  Lamp: {
    title: "Iridescence Lamp",
    note: "Public Khronos sample asset.",
    src: `${SAMPLE_ASSET_BASE}/IridescenceLamp/glTF-Binary/IridescenceLamp.glb`,
  },
  Apple: {
    title: "Avocado",
    note: "Apple proxy rendered with a public Khronos sample asset.",
    src: `${SAMPLE_ASSET_BASE}/Avocado/glTF-Binary/Avocado.glb`,
  },
};

export function getIdentifyModelAsset(label) {
  return MODEL_LIBRARY[label] ?? DEFAULT_MODEL;
}

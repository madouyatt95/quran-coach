// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { useListeningNotebookStore as notebook } from "./listeningNotebookStore";
import { createMemoryStorage } from "../test/memoryStorage";
import type { PlaylistItem } from "../types";
it("conserve une note par verset et voix après rechargement sans écraser une note existante", async () => {
  vi.stubGlobal("localStorage", createMemoryStorage());
  notebook.persist.setOptions({
    storage: createJSONStorage(() => localStorage),
  });
  notebook.setState({ notes: [] });
  const item: PlaylistItem = {
    surahNumber: 1,
    surahName: "Fatiha",
    surahNameAr: "",
    totalAyahs: 7,
    reciterId: "ar.alafasy",
    verse: {
      number: 2,
      globalNumber: 2,
      text: "Arabe",
      translation: "Français",
    },
  };
  notebook.getState().save(item, "Ma réflexion");
  notebook.getState().save(item);
  notebook.getState().save({ ...item, reciterId: "ar.husary" });
  expect(notebook.getState().notes).toHaveLength(2);
  expect(
    notebook.getState().notes.find((n) => n.item.reciterId === "ar.alafasy")
      ?.note,
  ).toBe("Ma réflexion");
  await notebook.persist.rehydrate();
  expect(notebook.getState().notes).toHaveLength(2);
  notebook.getState().remove("1:2:ar.husary");
  expect(notebook.getState().notes).toHaveLength(1);
  vi.unstubAllGlobals();
});

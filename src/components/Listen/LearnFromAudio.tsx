import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOpenReader } from "../../hooks/useOpenReader";
import { useAudioPlayerStore } from "../../stores/audioPlayerStore";
import { useQuranStore } from "../../stores/quranStore";
import type { PlaylistItem } from "../../types";
import "./Listen.css";

export function LearnFromAudio({
  item,
  onClose,
}: {
  item: PlaylistItem;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const openReader = useOpenReader("Retour à l’écoute");
  const total =
    useQuranStore(
      (s) => s.surahs.find((s) => s.number === item.surahNumber)?.numberOfAyahs,
    ) || item.totalAyahs;
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const valid =
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 1 &&
    end >= start &&
    end <= total;
  const pause = () => {
    const p = useAudioPlayerStore.getState();
    if (p.currentSurahNumber) p.stop();
  };
  return (
    <dialog
      ref={dialog}
      className="listen-dialog"
      onCancel={onClose}
      aria-labelledby="listen-learn-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <span>ÉCOUTER PUIS APPRENDRE</span>
        <button aria-label="Fermer" onClick={onClose}>
          ✕
        </button>
      </header>
      <h2 id="listen-learn-title">{item.surahName}</h2>
      <p>
        Choisissez les versets à travailler. Le fichier de cette récitation ne
        fournit pas de repère exact au verset.
      </p>
      {total > 0 ? (
        <>
          <div className="listen-range-fields">
            <label>
              Du verset
              <input
                type="number"
                min={1}
                max={total}
                value={start}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setStart(n);
                  if (n > end) setEnd(n);
                }}
              />
            </label>
            <label>
              Au verset
              <input
                type="number"
                min={start}
                max={total}
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
              />
            </label>
          </div>
          <small>
            {total} versets · La mémorisation utilise son récitateur et ses
            audios découpés par verset.
          </small>
          <button
            className="listen-primary"
            disabled={!valid}
            onClick={() => {
              pause();
              navigate(
                `/hifdh?surah=${item.surahNumber}&ayah=${start}&end=${end}`,
              );
              onClose();
            }}
          >
            Mémoriser ce passage →
          </button>
          <button
            className="listen-secondary"
            disabled={!valid}
            onClick={() => {
              pause();
              openReader({ surah: item.surahNumber, ayah: start });
              onClose();
            }}
          >
            Ouvrir le Mushaf au verset {start}
          </button>
        </>
      ) : (
        <button
          className="listen-primary"
          onClick={() => {
            pause();
            navigate(`/hifdh?surah=${item.surahNumber}&ayah=1`);
            onClose();
          }}
        >
          Choisir un passage en mémorisation →
        </button>
      )}
    </dialog>
  );
}

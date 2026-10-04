import { Link } from "react-router-dom";
import { passageUrl, type Passage } from "../../lib/learning";
import "./Learning.css";
export function PassageActions({ surah, ayah }: Passage) {
  return (
    <div className="learning-actions">
      <Link className="learning-btn" to={passageUrl({ surah, ayah })}>
        Comprendre · Écouter · Mémoriser {surah}:{ayah}
      </Link>
    </div>
  );
}

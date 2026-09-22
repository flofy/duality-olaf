import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";
import { BallCharacter, SquareCharacter } from "../components/Characters";

export function CompletionOverlay({ worldIndex, worldLength, hasNextWorld, completed, moves, onReset, onNext }: { worldIndex: number; worldLength: number; hasNextWorld: boolean; completed: boolean; moves: number; onReset: () => void; onNext: () => void }) {
  if (!completed) return null;
  const changingWorld = worldIndex === worldLength - 1 && hasNextWorld;
  return <div className="overlay"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="completion-title">
    {changingWorld ? <div className="overlay-character-pair" aria-hidden="true"><BallCharacter size={76} expression="happy" className="celebration-character" /><span className="celebration-arrow">→</span><SquareCharacter size={76} expression="happy" className="celebration-character" /></div> : <div className="overlay-character" aria-hidden="true"><BallCharacter size={76} expression="happy" /></div>}
    <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
    <p>{moves} coups</p>
    {changingWorld && <p className="world-transition-message">Bravo ! On change de monde… et notre deuxième héros arrive !</p>}
    <div className="modal-actions"><Button icon={<Reset size={18} />} label="REJOUER" onClick={onReset} variant="primary" /><Button icon={<ArrowRight size={18} />} label={worldIndex < worldLength - 1 ? "SUIVANT" : hasNextWorld ? "MONDE SUIVANT" : "NIVEAUX"} onClick={onNext} variant="primary" /></div>
  </div></div>;
}

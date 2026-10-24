import type { ReactNode } from "react";

export function SettingsScreen({ updatesSection }: { updatesSection: ReactNode }) {
  return (
    <section className="module-screen optic-settings" aria-labelledby="settings-title">
      <div className="eyebrow">APPLICATION / PRÉFÉRENCES</div>
      <h1 id="settings-title">Paramètres</h1>
      <p className="intro">Gérez la version d'Optic et retrouvez ici ses réglages locaux.</p>
      <div className="settings-section-heading">APPLICATION</div>
      {updatesSection}
      <p className="settings-hint">Les autres réglages de l'interface UI D seront ajoutés progressivement. Aucun paramètre du Bridge n'est modifié ici.</p>
    </section>
  );
}

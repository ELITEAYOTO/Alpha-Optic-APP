import type { ReactNode } from "react";

/** Settings owns the settings layout; App composes appearance through the Themes public API. */
export function SettingsScreen({ updatesSection, appearanceSection }: {
  updatesSection: ReactNode;
  appearanceSection: ReactNode;
}) {
  return (
    <section className="module-screen optic-settings" aria-labelledby="settings-title">
      <div className="eyebrow">APPLICATION / PRÉFÉRENCES</div>
      <h1 id="settings-title">Paramètres</h1>
      <p className="intro">Personnalisez l'apparence d'Optic sans modifier son fonctionnement.</p>
      {appearanceSection}
      <div className="settings-section-heading">APPLICATION</div>
      {updatesSection}
      <p className="settings-hint">Le thème est une préférence locale d'affichage uniquement. Le Bridge reste l'autorité des sessions et des droits.</p>
    </section>
  );
}

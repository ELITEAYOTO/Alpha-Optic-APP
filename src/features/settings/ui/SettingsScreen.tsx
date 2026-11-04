import type { CSSProperties, ReactNode } from "react";
import { BUILTIN_THEMES } from "../../themes/model/builtin-themes";
import { themeToCssVariables } from "../../themes/model/theme-manifest";

interface Props {
  updatesSection: ReactNode;
  activeThemeId: string;
  previewThemeId: string | null;
  onPreviewTheme: (id: string | null) => void;
  onSelectTheme: (id: string) => void;
}

export function SettingsScreen({ updatesSection, activeThemeId, previewThemeId,
  onPreviewTheme, onSelectTheme }: Props) {
  return (
    <section className="module-screen optic-settings" aria-labelledby="settings-title">
      <div className="eyebrow">APPLICATION / PRÉFÉRENCES</div>
      <h1 id="settings-title">Paramètres</h1>
      <p className="intro">Personnalisez l'apparence d'Optic sans modifier son fonctionnement.</p>

      <section aria-labelledby="appearance-title" className="settings-appearance">
        <div className="settings-section-heading" id="appearance-title">APPARENCE</div>
        <p className="settings-hint">Survolez un thème pour prévisualiser ses couleurs dans l'application. Cliquez pour le conserver.</p>
        <div className="theme-grid" aria-label="Choix de thème">
          {BUILTIN_THEMES.map(theme => {
            const selected = activeThemeId === theme.id;
            const previewed = previewThemeId === theme.id;
            return (
              <button className="theme-option" key={theme.id} type="button"
                aria-pressed={selected}
                aria-label={theme.name + (selected ? " — thème sélectionné" : "")}
                onMouseEnter={() => onPreviewTheme(theme.id)}
                onMouseLeave={() => onPreviewTheme(null)}
                onFocus={() => onPreviewTheme(theme.id)}
                onBlur={() => onPreviewTheme(null)}
                onClick={() => onSelectTheme(theme.id)}>
                <div className="theme-mini" style={themeToCssVariables(theme) as CSSProperties}
                  aria-hidden="true">
                  <span className="theme-mini-rail"/>
                  <span className="theme-mini-body">
                    <span className="theme-mini-head"/>
                    <span className="theme-mini-line"/>
                    <span className="theme-mini-line short"/>
                    <span className="theme-mini-button"/>
                  </span>
                </div>
                <span className="theme-option-foot">
                  <span className="theme-option-name">{theme.name}</span>
                  <span className="theme-option-indicator">{selected ? "✓" : previewed ? "Aperçu" : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="theme-preview-status" aria-live="polite">
          {previewThemeId ? "Aperçu temporaire — cliquez pour appliquer ce thème." : "Les thèmes ne modifient ni l'agencement ni les autorisations du Bridge."}
        </p>
      </section>

      <div className="settings-section-heading">APPLICATION</div>
      {updatesSection}
      <p className="settings-hint">Le thème est une préférence locale d'affichage uniquement. Le Bridge reste l'autorité des sessions et des droits.</p>
    </section>
  );
}

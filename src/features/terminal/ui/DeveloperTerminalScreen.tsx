export function DeveloperTerminalScreen() {
  return (
    <section className="module-screen" aria-labelledby="terminal-title">
      <div className="eyebrow">OUTIL DÉVELOPPEUR / EXÉCUTION CONTRÔLÉE</div>
      <h1 id="terminal-title">Terminal développeur</h1>
      <p className="intro">Le terminal interactif sera séparé du journal de supervision, avec des sessions et des commandes soumises aux autorisations Rust.</p>
      <div className="tool-panel">
        <div className="tool-panel-header">
          <strong>Terminal 1</strong>
          <span className="state-pill">DÉSACTIVÉ</span>
        </div>
        <div className="console-empty" role="status">
          <span className="console-prompt">$ Terminal indisponible</span>
          <p>Aucun pseudoterminal ni interpréteur de commandes n'est lancé.</p>
        </div>
      </div>
      <div className="notice">ConPTY, stdin, stdout/stderr et le contrôle des processus natifs exigent une validation de sécurité distincte. Ne pas remplacer cette vue par un shell non autorisé.</div>
    </section>
  );
}

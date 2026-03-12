function initialsFromName(name) {
  const groups = name
    .split('&')
    .map((group) => group.trim())
    .filter(Boolean);

  const initials = groups
    .map((group) => group.match(/[A-Za-zÄÖÜäöü]/)?.[0] ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .map((char) => char.toUpperCase());

  if (initials.length >= 2) {
    return initials.join('');
  }

  const fallback = name.match(/[A-Za-zÄÖÜäöü]/g) ?? [];
  return (fallback[0] ?? '?').toUpperCase();
}

export default function PartyPicker({ onSelectParty, parties, loading, error, onRetry }) {
  return (
    <section className="party-picker">
      <div className="party-hero">
        <p className="party-hero-kicker">Familienküche digital</p>
        <h2>Rezepte eurer Familie, an einem Ort</h2>
        <p>Wähle eine Familie und öffne direkt eure gemeinsame Rezeptwelt.</p>
      </div>

      {loading ? <p className="loading-note">Wird geladen ...</p> : null}
      {error ? <p className="info-note">{error}</p> : null}
      {error && onRetry ? (
        <div className="card-actions">
          <button type="button" onClick={onRetry}>Erneut laden</button>
        </div>
      ) : null}

      {!loading && !error && parties.length === 0 ? (
        <p className="info-note">Noch keine Familien registriert. Melde dich an, um die erste zu erstellen!</p>
      ) : null}

      <div className="party-grid">
        {parties.map((party) => (
          <button
            key={party.id}
            type="button"
            className="party-card"
            onClick={() => onSelectParty(party)}
          >
            <span className="party-card-badge">
              {party.recipe_count} {party.recipe_count === 1 ? 'Rezept' : 'Rezepte'}
            </span>
            <span className="party-card-avatar">{initialsFromName(party.name)}</span>
            <span className="party-card-name">{party.name}</span>
            <span className="party-card-count">Tippen zum Öffnen</span>
          </button>
        ))}
      </div>
    </section>
  );
}

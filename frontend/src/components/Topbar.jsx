export default function Topbar({ user, logout, dateText, timeText, onNewRecipe, onLogin, onBackToParties, onPartyRecipes, partyName }) {
  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="topbar-title-row">
          {onBackToParties ? (
            <button type="button" className="topbar-back" onClick={onBackToParties} title="Zur Familienauswahl">&larr;</button>
          ) : null}
          <h1>Familien-Rezepte</h1>
          {partyName ? <span className="topbar-party">{partyName}</span> : null}
        </div>
        <p className="topbar-meta">{dateText} · {timeText} Uhr</p>
      </div>
      <div className="topbar-side">
        {user ? (
          <>
            <button className="secondary-btn profile-btn" type="button" onClick={onPartyRecipes}>
              Rezeptverwaltung
            </button>
            <button className="primary-btn" type="button" onClick={onNewRecipe}>
              Neues Rezept
            </button>
            <button className="secondary-btn" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button className="primary-btn" type="button" onClick={onLogin}>
            Anmelden
          </button>
        )}
      </div>
    </header>
  );
}

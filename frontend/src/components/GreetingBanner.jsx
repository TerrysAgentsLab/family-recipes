const GREETINGS = {
  fruehstueck: 'Guten Morgen',
  mittag: 'Mahlzeit',
  snack: 'Guten Nachmittag',
  abend: 'Guten Abend',
  nachts: 'Gute Nacht',
};

const TAGLINES = {
  fruehstueck: 'Was darf es zum Frühstück sein?',
  mittag: 'Zeit für etwas Leckeres!',
  snack: 'Ein kleiner Snack gefällig?',
  abend: 'Was kochen wir heute Abend?',
  nachts: 'Schon ans Frühstück gedacht?',
};

export default function GreetingBanner({ user, partyName, mealSlot, dateText }) {
  const greeting = GREETINGS[mealSlot.currentMealSlot.key] || 'Hallo';
  const tagline = TAGLINES[mealSlot.currentMealSlot.key] || '';
  const displayName = partyName || (user ? user.display_name : '');

  return (
    <section className="greeting-banner">
      <div>
        <h2 className="greeting-text">{greeting}{displayName ? `, ${displayName}` : ''}!</h2>
        <p className="greeting-tagline">{tagline}</p>
        {partyName ? <p className="greeting-area">Bereich: {partyName}</p> : null}
        <p className="greeting-date">{dateText}</p>
      </div>
    </section>
  );
}

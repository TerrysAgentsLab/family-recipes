import { useEffect, useMemo, useState } from 'react';
import useAuth from './hooks/useAuth';
import useMealSlot from './hooks/useMealSlot';
import useChat from './hooks/useChat';
import { fetchParties } from './api';
import AuthForm from './components/AuthForm';
import Topbar from './components/Topbar';
import PartyPicker from './components/PartyPicker';
import Dashboard from './components/Dashboard';
import MyRecipes from './components/MyRecipes';
import RecipeModal from './components/RecipeModal';
import RecipeDetail from './components/RecipeDetail';
import ChatPanel from './components/ChatPanel';

function slugifyPartyName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const familyOnly = normalized.match(/^\/familie\/([^/]+)$/);
  if (familyOnly) {
    return { view: 'dashboard', partySlug: decodeURIComponent(familyOnly[1]) };
  }
  const familyMyRecipes = normalized.match(/^\/familie\/([^/]+)\/meine-rezepte$/);
  if (familyMyRecipes) {
    return { view: 'my-recipes', partySlug: decodeURIComponent(familyMyRecipes[1]) };
  }
  return { view: 'home', partySlug: null };
}

function routeToPath(route) {
  if (!route.partySlug) return '/';
  if (route.view === 'my-recipes') return `/familie/${encodeURIComponent(route.partySlug)}/meine-rezepte`;
  return `/familie/${encodeURIComponent(route.partySlug)}`;
}

export default function App() {
  const auth = useAuth();
  const mealSlot = useMealSlot();
  const chat = useChat();
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(true);
  const [partiesError, setPartiesError] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [viewRecipeId, setViewRecipeId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const selectedParty = useMemo(() => {
    if (!route.partySlug) return null;
    return parties.find((party) => slugifyPartyName(party.name) === route.partySlug) ?? null;
  }, [parties, route.partySlug]);

  function navigate(nextRoute, replace = false) {
    const nextPath = routeToPath(nextRoute);
    if (replace) {
      window.history.replaceState({}, '', nextPath);
    } else if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRoute(nextRoute);
  }

  function loadParties() {
    setPartiesLoading(true);
    setPartiesError('');
    fetchParties()
      .then((items) => setParties(items))
      .catch((err) => setPartiesError(err.message || 'Familien konnten nicht geladen werden.'))
      .finally(() => setPartiesLoading(false));
  }

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    function onPopState() {
      setRoute(parseRoute(window.location.pathname));
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (partiesLoading || !route.partySlug) return;
    if (!selectedParty) {
      navigate({ view: 'home', partySlug: null }, true);
    }
  }, [partiesLoading, route.partySlug, selectedParty]);

  function handleSelectParty(party) {
    navigate({ view: 'dashboard', partySlug: slugifyPartyName(party.name) });
  }

  function handleBackToParties() {
    navigate({ view: 'home', partySlug: null });
  }

  function handlePartyRecipes() {
    if (!selectedParty) return;
    navigate({ view: 'my-recipes', partySlug: slugifyPartyName(selectedParty.name) });
  }

  function handleBackFromMyRecipes() {
    if (selectedParty) {
      navigate({ view: 'dashboard', partySlug: slugifyPartyName(selectedParty.name) });
    } else {
      navigate({ view: 'home', partySlug: null });
    }
  }

  function handleLogout() {
    auth.logout();
  }

  const showSubpageUi = route.view !== 'home' && !!selectedParty;

  return (
    <div className="app-shell">
      {showSubpageUi ? (
        <Topbar
          user={auth.user}
          logout={handleLogout}
          dateText={mealSlot.dateText}
          timeText={mealSlot.timeText}
          onNewRecipe={() => setShowRecipeModal(true)}
          onLogin={() => setShowAuthModal(true)}
          onBackToParties={selectedParty ? handleBackToParties : null}
          onPartyRecipes={handlePartyRecipes}
          partyName={selectedParty?.name}
        />
      ) : null}

      <main className="content">
        {route.view === 'home' ? (
          <PartyPicker
            onSelectParty={handleSelectParty}
            parties={parties}
            loading={partiesLoading}
            error={partiesError}
            onRetry={loadParties}
          />
        ) : null}

        {route.view !== 'home' && !selectedParty && partiesLoading ? (
          <p className="loading-note">Familienbereich wird geladen ...</p>
        ) : null}

        {route.view === 'dashboard' && selectedParty ? (
          <Dashboard
            mealSlot={mealSlot}
            user={auth.user}
            partyId={selectedParty.id}
            partyName={selectedParty.name}
            onSelectRecipe={setViewRecipeId}
          />
        ) : null}

        {route.view === 'my-recipes' && selectedParty ? (
          <MyRecipes onBack={handleBackFromMyRecipes} onSelectRecipe={setViewRecipeId} />
        ) : null}
      </main>

      {showSubpageUi ? <ChatPanel {...chat} /> : null}

      {showAuthModal ? (
        <AuthForm
          {...auth}
          isModal={true}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      ) : null}

      {showRecipeModal ? (
        <RecipeModal onClose={() => setShowRecipeModal(false)} />
      ) : null}

      {viewRecipeId != null ? (
        <RecipeDetail
          recipeId={viewRecipeId}
          onClose={() => setViewRecipeId(null)}
          user={auth.user}
        />
      ) : null}
    </div>
  );
}

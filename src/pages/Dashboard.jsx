import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Shield, User } from 'lucide-react';

const initialData = {
  user: {
    alias: "Runner_98",
    anonMode: false
  },
  connections: {
    strava: "connected",
    game: "connected"
  },
  proofs: [
    {
      id: "pf_001",
      source: "Strava",
      distance: "7.2 km",
      date: "2025-11-17",
      status: "ready"
    },
    {
      id: "pf_002",
      source: "Game",
      score: 1540,
      date: "2025-11-16",
      status: "submitted"
    }
  ],
  userRank: {
    rank: 7,
    total: 58,
    metric: "7.2 km",
    lastVerified: "2025-11-17"
  },
  stats: {
    verifiedRuns: 12,
    longestRun: "8.1 km",
    highestScore: 1610,
    streak: 6
  }
};

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const randomAnon = () => `anon_${Math.random().toString(16).slice(2, 8)}`;

const statusBadge = (status) => {
  const common = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium";
  if (status === "ready") return <span className={`${common} bg-emerald-100 text-emerald-700`}><CheckCircle className="h-4 w-4" /> Ready</span>;
  if (status === "submitted") return <span className={`${common} bg-blue-100 text-blue-700`}><CheckCircle className="h-4 w-4" /> Submitted</span>;
  if (status === "pending") return <span className={`${common} bg-amber-100 text-amber-700`}><AlertCircle className="h-4 w-4" /> Pending</span>;
  return <span className={`${common} bg-gray-100 text-gray-700`}>Unknown</span>;
};

export default function Dashboard() {
  const [data, setData] = useState(initialData);
  const [anonAlias] = useState(randomAnon());
  const [manualApproval, setManualApproval] = useState(false);
  const [banner, setBanner] = useState(null);

  // Edit alias UI state
  const [editingAccount, setEditingAccount] = useState(false);
  const [aliasInput, setAliasInput] = useState(initialData.user.alias);

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 2500);
  };

  const addProof = (proof) => {
    setData((prev) => ({
      ...prev,
      proofs: [{ ...proof, status: manualApproval ? 'pending' : 'ready' }, ...prev.proofs]
    }));
  };

  const handleSyncStrava = () => {
    const distances = ["6.3 km", "7.5 km", "5.8 km", "8.0 km"];
    const distance = distances[Math.floor(Math.random() * distances.length)];
    addProof({ id: `pf_${Date.now()}`, source: "Strava", distance, date: today() });
    setData((prev) => ({ ...prev, connections: { ...prev.connections, strava: "connected" } }));
    showBanner("success", manualApproval ? "Strava synced. Proof pending approval." : "Strava synced. Proof ready.");
  };

  const handleSyncGame = () => {
    const score = 1400 + Math.floor(Math.random() * 400);
    addProof({ id: `pf_${Date.now()}`, source: "Game", score, date: today() });
    setData((prev) => ({ ...prev, connections: { ...prev.connections, game: "connected" } }));
    showBanner("success", manualApproval ? "Game score synced. Proof pending approval." : "Game score synced. Proof ready.");
  };

  const handleCreateTodaysProof = () => {
    const distance = `${(6 + Math.random() * 3).toFixed(1)} km`;
    addProof({ id: `pf_${Date.now()}`, source: "Strava", distance, date: today() });
    showBanner("success", manualApproval ? "Proof generated. Pending approval." : "Proof generated and ready.");
  };

  const approveProof = (id) => {
    setData((prev) => ({
      ...prev,
      proofs: prev.proofs.map((p) => p.id === id ? { ...p, status: "ready" } : p)
    }));
    showBanner("success", "Proof approved and ready.");
  };

  const submitProof = (id) => {
    const target = data.proofs.find((p) => p.id === id);
    if (!target) return;
    setData((prev) => ({
      ...prev,
      proofs: prev.proofs.map((p) => p.id === id ? { ...p, status: "submitted" } : p),
      userRank: {
        ...prev.userRank,
        metric: target.source === "Strava" ? target.distance : `${target.score} points`,
        lastVerified: today()
      }
    }));
    showBanner("success", "Proof submitted to leaderboard.");
  };

  const deletePastProofs = () => {
    setData((prev) => ({ ...prev, proofs: [] }));
    showBanner("info", "All past proofs deleted.");
  };

  const disconnectIntegrations = () => {
    setData((prev) => ({ ...prev, connections: { strava: "not connected", game: "not connected" } }));
    showBanner("info", "Integrations disconnected.");
  };

  const toggleAnon = () => {
    setData((prev) => ({ ...prev, user: { ...prev.user, anonMode: !prev.user.anonMode } }));
  };

  const startEditAccount = () => {
    setAliasInput(data.user.alias);
    setEditingAccount(true);
  };

  const saveAlias = () => {
    setData((prev) => ({ ...prev, user: { ...prev.user, alias: aliasInput } }));
    setEditingAccount(false);
    showBanner("success", "Alias updated.");
  };

  const cancelEdit = () => {
    setEditingAccount(false);
    setAliasInput(data.user.alias);
  };

  const displayName = data.user.anonMode ? "anon mode enabled" : data.user.alias;

  const connectionChip = (label, status) => {
    const connected = status === "connected";
    const color = connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
    const Icon = connected ? CheckCircle : AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
        <Icon className="h-4 w-4" />
        {label}: {status}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {banner && (
        <div className={`mb-4 rounded-md p-3 text-sm ${banner.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
          {banner.message}
        </div>
      )}

      {/* Welcome Box */}
      <section className="mb-6 rounded-lg border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Welcome, {displayName}</h2>
            <p className="text-xs text-gray-600">
              {data.user.anonMode ? `Alias hidden as ${anonAlias}` : `Alias: ${data.user.alias}`}
            </p>
          </div>
          {!data.user.anonMode && (
            <button
              onClick={startEditAccount}
              className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              Change alias
            </button>
          )}
        </div>
      </section>

      {/* Connection Status + Actions */}
      <section className="mb-6 rounded-lg border bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {connectionChip("Strava", data.connections.strava)}
            {connectionChip("Game account", data.connections.game)}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSyncStrava} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Sync Strava now
            </button>
            <button onClick={handleSyncGame} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Sync game score
            </button>
            <button onClick={handleCreateTodaysProof} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Create today’s proof
            </button>
          </div>
        </div>
      </section>

      {/* Latest Generated Proofs */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Latest generated proofs</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.proofs.length === 0 ? (
            <div className="rounded-lg border bg-white p-5">
              <p className="text-sm text-gray-600">No proofs yet. Sync to create one.</p>
            </div>
          ) : (
            data.proofs.map((p) => (
              <div key={p.id} className="flex flex-col rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{p.source}</span>
                  {statusBadge(p.status)}
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {p.source === "Strava" ? (
                    <p><span className="font-medium">Distance:</span> {p.distance}</p>
                  ) : (
                    <p><span className="font-medium">Score:</span> {p.score} points</p>
                  )}
                  <p className="text-gray-600"><span className="font-medium">Date:</span> {p.date}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {p.status === "ready" && (
                    <button onClick={() => submitProof(p.id)} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                      Submit to leaderboard
                    </button>
                  )}
                  {p.status === "pending" && manualApproval && (
                    <button onClick={() => approveProof(p.id)} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                      Approve proof
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Your Rank */}
      <section className="mb-6 rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your current rank</h3>
            <p className="mt-1 text-sm text-gray-700">
              Rank {data.userRank.rank} / {data.userRank.total} • Metric: {data.userRank.metric}
            </p>
            <p className="text-xs text-gray-600">Last verified: {data.userRank.lastVerified === today() ? "today" : data.userRank.lastVerified}</p>
          </div>
          <Link to="/leaderboard" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            View public leaderboard
          </Link>
        </div>
      </section>

      {/* Personal Stats Overview */}
      <section className="mb-6 rounded-lg border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Shield className="h-5 w-5 text-emerald-600" />
          Personal stats overview
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs text-gray-600">Total verified runs</p>
            <p className="text-xl font-bold text-gray-900">{data.stats.verifiedRuns}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs text-gray-600">Longest verified run</p>
            <p className="text-xl font-bold text-gray-900">{data.stats.longestRun}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs text-gray-600">Highest game score</p>
            <p className="text-xl font-bold text-gray-900">{data.stats.highestScore}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs text-gray-600">Current streak (proof-based)</p>
            <p className="text-xl font-bold text-gray-900">{data.stats.streak}</p>
          </div>
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="rounded-lg border bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Privacy settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Anonymous mode</p>
              <p className="text-xs text-gray-600">
                {data.user.anonMode ? `Hidden as ${anonAlias}` : "Show your alias on this device"}
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={data.user.anonMode} onChange={toggleAnon} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
              <span className="ml-2 text-sm text-gray-700">Enable</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Manual proof approval</p>
              <p className="text-xs text-gray-600">New proofs require manual approval before submission.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={manualApproval} onChange={() => setManualApproval((v) => !v)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
              <span className="ml-2 text-sm text-gray-700">Enable</span>
            </label>
          </div>

          {/* Account alias edit simulation */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Account alias</p>
              <p className="text-xs text-gray-600">
                {data.user.anonMode ? `Hidden as ${anonAlias}` : `Current: ${data.user.alias}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {editingAccount ? (
                <>
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    className="h-8 w-36 rounded border border-gray-300 px-2 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="New alias"
                  />
                  <button onClick={saveAlias} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="rounded-md bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-300">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={startEditAccount} className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">
                  Change alias
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={deletePastProofs} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Delete past proofs
            </button>
            <button onClick={disconnectIntegrations} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300">
              Disconnect integrations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Admin() {
  const [gameTypes, setGameTypes] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [games, setGames] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [newGameType, setNewGameType] = useState('');

  async function load() {
    const [gt, pl] = await Promise.all([
      fetch(`${API}/game-types`).then(r => r.json()),
      fetch(`${API}/players`).then(r => r.json())
    ]);
    setGameTypes(gt);
    setPlayers(pl);
    if (gt.length && !selectedGameType) setSelectedGameType(gt[0].id);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedGameType) return;
    fetch(`${API}/games/${selectedGameType}`).then(r => r.json()).then(setGames);
  }, [selectedGameType]);

  async function addPlayer() {
    if (!newPlayer.trim()) return;
    await fetch(`${API}/players`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: newPlayer.trim() })
    });
    setNewPlayer('');
    load();
  }

  async function addGameType() {
    if (!newGameType.trim()) return;
    await fetch(`${API}/game-types`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: newGameType.trim() })
    });
    setNewGameType('');
    load();
  }

  async function generate() {
    if (!selectedGameType) return;
    await fetch(`${API}/games/generate/${selectedGameType}`, { method: 'POST' });
    const res = await fetch(`${API}/games/${selectedGameType}`);
    setGames(await res.json());
  }

  async function setWinner(gameId, winnerId) {
    await fetch(`${API}/games/${gameId}/winner`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ winner_id: winnerId })
    });
    const res = await fetch(`${API}/games/${selectedGameType}`);
    setGames(await res.json());
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Round Robin — Admin</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Game Types */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-center">Game Types</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none"
                value={newGameType}
                onChange={e => setNewGameType(e.target.value)}
                placeholder="New game type (e.g. Pool)"
              />
              <button
                onClick={addGameType}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2"
              >
                Add
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="flex-1 bg-gray-700 rounded-lg px-3 py-2 focus:outline-none"
                value={selectedGameType || ''}
                onChange={e => setSelectedGameType(e.target.value)}
              >
                {gameTypes.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button
                onClick={generate}
                className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2"
              >
                Generate
              </button>
            </div>
          </div>
        </section>

        {/* Players */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700 md:col-span-1 lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4 text-center">Players</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none"
                value={newPlayer}
                onChange={e => setNewPlayer(e.target.value)}
                placeholder="Player name"
              />
              <button
                onClick={addPlayer}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2"
              >
                Add
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700">
              {players.map(p => (
                <li key={p.id} className="py-2 px-1">{p.name}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Games */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700 md:col-span-2 lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Games for Selected Type
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-700 text-sm">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Player 1</th>
                  <th className="px-4 py-2 text-left">Player 2</th>
                  <th className="px-4 py-2 text-left">Winner</th>
                </tr>
              </thead>
              <tbody>
                {games.map(g => (
                  <tr key={g.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="px-4 py-2">{g.id}</td>
                    <td className="px-4 py-2">{g.player1_name}</td>
                    <td className="px-4 py-2">{g.player2_name}</td>
                    <td className="px-4 py-2">
                      {g.winner_id ? (
                        players.find(p => p.id === g.winner_id)?.name || '—'
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setWinner(g.id, g.player1_id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs"
                          >
                            {g.player1_name}
                          </button>
                          <button
                            onClick={() => setWinner(g.id, g.player2_id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs"
                          >
                            {g.player2_name}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Notes */}
      <section className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-semibold mb-2">Notes</h3>
        <ul className="list-disc ml-5 text-gray-400">
          <li>Generating games will create every pair once (round robin).</li>
          <li>Winner is stored as player ID. Draws not implemented.</li>
        </ul>
      </section>
    </div>
  );
}

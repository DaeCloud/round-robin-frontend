'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Display() {
  const [gameTypes, setGameTypes] = useState([]);
  const [data, setData] = useState({}); // { gameTypeId: { nextGame, leaderboard } }

  // Load all game types once
  async function loadTypes() {
    const types = await fetch(`${API}/game-types`).then(r => r.json());
    setGameTypes(types);
  }

  // Load next match + leaderboard for all types
  async function loadAll() {
    if (!gameTypes.length) return;

    const results = {};
    await Promise.all(
      gameTypes.map(async (type) => {
        const [games, leaderboard] = await Promise.all([
          fetch(`${API}/games/${type.id}`).then(r => r.json()),
          fetch(`${API}/leaderboard/${type.id}`).then(r => r.json())
        ]);

        // Sort games to find the next unplayed one (no winner)
        const nextGame = games.find(g => !g.winner_id);
        results[type.id] = { nextGame, leaderboard, games };
      })
    );
    setData(results);

    console.table(results);
  }

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (!gameTypes.length) return;
    loadAll();
    const id = setInterval(loadAll, 5000);
    return () => clearInterval(id);
  }, [gameTypes]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-10">
      <h1 className="text-4xl font-bold text-center mb-10">Current Matches & Leaderboards</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {gameTypes.map((type) => {
          const info = data[type.id];
          const next = info?.nextGame;
          const games = info?.games;
          const lb = info?.leaderboard || [];

          return (
            <div
              key={type.id}
              className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 flex flex-col justify-between"
            >
              <h2 className="text-2xl font-semibold text-center mb-4">{type.name}</h2>

              {/* Next Match */}
              {next ? (
                <div className="rounded-xl p-4 text-center mb-6 bg-green-600/30 border border-green-400 font-bold text-white">
                  <h3 className="text-lg font-semibold mb-2">Next Match</h3>
                  <div className="text-xl font-medium">
                    {next.player1_name} <span className="text-green-400">vs</span> {next.player2_name}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-xl p-4 text-center mb-6">
                  <p className="text-gray-400">No active matches</p>
                </div>
              )}

              {games ? (
                <div className="bg-gray-700 rounded-xl p-4 text-center mb-6">
                  <h3 className="text-lg font-semibold mb-3">All Matches</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {games.map((g) => {
                      const isActive = g.id === next.id;
                      return (
                        <div
                          key={g.id}
                          className={`px-2 py-1 transition-all ${isActive
                              ? 'bg-green-600/30 border border-green-400 rounded-lg font-bold text-white'
                              : 'text-gray-300 bg-gray-800/40 rounded-md'
                            }`}
                        >
                          <span
                            className={`px-2 py-0.5 rounded-md ${g.winner_id === g.player1_id
                                ? 'bg-green-600/30 border border-green-400 font-bold text-white'
                                : ''
                              }`}
                          >
                            {g.player1_name}
                          </span>{' '}
                          <span className={isActive ? 'text-green-300' : 'text-green-400'}>
                            vs
                          </span>{' '}
                          <span
                            className={`px-2 py-0.5 rounded-md ${g.winner_id === g.player2_id
                                ? 'bg-green-600/30 border border-green-400 font-bold text-white'
                                : ''
                              }`}
                          >
                            {g.player2_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div></div>
              )}


              {/* Leaderboard */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-center">Leaderboard</h3>
                <ol className="space-y-1">
                  {lb.map((l, i) => (
                    <li
                      key={l.id}
                      className={`flex justify-between rounded-lg px-3 py-1 ${i === 0 ? 'bg-green-700 font-bold' : 'bg-gray-700'
                        }`}
                    >
                      <span>{l.name}</span>
                      <span>{l.wins} wins</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

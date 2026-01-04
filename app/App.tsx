import React, { useEffect, useState } from 'react';
import './App.css';

interface Crossing {
  id: string;
  source_id: string;
  name: string;
  device_type: string;
  lat: number;
  lon: number;
  created_at: string;
}

export default function App() {
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCrossings();
  }, []);

  async function fetchCrossings() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/crossings');
      if (!response.ok) throw new Error('Failed to fetch crossings');
      const data = await response.json();
      setCrossings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const filtered = crossings.filter(crossing =>
    crossing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crossing.source_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Railroad Crossings Tracker</h1>
        <p>Track and monitor railroad crossings</p>
      </header>

      <main className="app-main">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchCrossings} className="refresh-btn">
            Refresh
          </button>
        </div>

        {loading && <div className="loading">Loading crossings...</div>}
        {error && <div className="error">Error: {error}</div>}

        <div className="crossings-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? 'No results found' : 'No crossings loaded'}
            </div>
          ) : (
            filtered.map(crossing => (
              <div key={crossing.id} className="crossing-card">
                <h3>{crossing.name}</h3>
                <p className="source-id">ID: {crossing.source_id}</p>
                <p className="device-type">Type: {crossing.device_type || 'Unknown'}</p>
                <p className="location">
                  📍 {crossing.lat.toFixed(4)}, {crossing.lon.toFixed(4)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="stats">
          <p>Total crossings: {filtered.length}</p>
        </div>
      </main>
    </div>
  );
}
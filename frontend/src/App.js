import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('Health check failed');
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Users fetch failed');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHealth();
    fetchUsers();
  }, []);

  return (
    <div className="App" style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>TP05 CI/CD </h1>
      {error && (
        <div style={{ background: '#ffd7d7', color: '#b00020', padding: 12, borderRadius: 8 }}>
          Error: {error}
        </div>
      )}
      <section style={{ marginTop: 16 }}>
        <h2>Health</h2>
        <pre style={{ textAlign: 'left', background: '#111', color: '#0f0', padding: 12, borderRadius: 8 }}>
{health ? JSON.stringify(health, null, 2) : 'Cargando...'}
        </pre>
      </section>
      <section style={{ marginTop: 16 }}>
        <h2>Usuarios</h2>
        {users.length === 0 ? (
          <p>No hay usuarios para mostrar.</p>
        ) : (
          <ul style={{ textAlign: 'left' }}>
            {users.map((u) => (
              <li key={u.id}>
                #{u.id} - {u.name} ({u.role})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { fetchActiveLocations } from '../services/locationService';
import { formatCurrency } from '../utils/formatCurrency';

export default function LocationSelectorModal({ isOpen, onClose, onSelectLocation }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadActiveLocations();
    }
  }, [isOpen]);

  const loadActiveLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActiveLocations();
      setLocations(data);
    } catch (err) {
      setError(err.message || 'Failed to load active delivery locations.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLocations = locations.filter((loc) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      loc.pincode.includes(term) ||
      loc.city.toLowerCase().includes(term) ||
      loc.state.toLowerCase().includes(term)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Select Delivery Location"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="font-serif" style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-heading)' }}>
            Select Delivery Location 🔍
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0 0.5rem',
            }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Select your PIN code or city from our active delivery coverage list:
        </p>

        {/* Search Input */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by PIN, City, or State..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '0.6rem 0.9rem' }}
            autoFocus
          />
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading active delivery locations...
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-clay)' }}>
              {error}
            </div>
          ) : filteredLocations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active delivery locations found matching "{search}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease-in-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-leaf)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                      {loc.pincode} — {loc.city}, {loc.state}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Est. Delivery: {loc.estimated_delivery_days} days
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      {loc.delivery_charge > 0 ? formatCurrency(loc.delivery_charge) : 'FREE Delivery'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

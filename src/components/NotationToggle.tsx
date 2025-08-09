export type NotationType = 'spanish' | 'english'

interface NotationToggleProps {
  notation: NotationType
  onChange: (notation: NotationType) => void
}

export function NotationToggle({ notation, onChange }: NotationToggleProps) {
  return (
    <div className="notation-toggle">
      <label className="toggle-label">
        <span>Notación:</span>
        <div className="toggle-buttons">
          <button
            type="button"
            className={`toggle-btn ${notation === 'spanish' ? 'active' : ''}`}
            onClick={() => onChange('spanish')}
          >
            Do-Re-Mi
          </button>
          <button
            type="button"
            className={`toggle-btn ${notation === 'english' ? 'active' : ''}`}
            onClick={() => onChange('english')}
          >
            C-D-E
          </button>
        </div>
      </label>
    </div>
  )
}
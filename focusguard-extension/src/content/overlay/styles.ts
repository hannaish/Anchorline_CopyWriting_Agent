export const overlayStyles = `
:host {
  all: initial;
}
.fg-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 18, 32, 0.97);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f1f5f9;
  animation: fg-fade-in 120ms ease-out;
}
@keyframes fg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fg-card {
  width: min(420px, 90vw);
  background: #111a2e;
  border: 1px solid #1f2a44;
  border-radius: 16px;
  padding: 28px 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.fg-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #a5b4fc;
  margin-bottom: 14px;
}
.fg-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #6366f1;
}
.fg-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
}
.fg-reason {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0 0 22px;
  line-height: 1.5;
}
.fg-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fg-btn {
  appearance: none;
  border: 1px solid #2a3654;
  background: #182238;
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}
.fg-btn:hover {
  background: #202c47;
}
.fg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.fg-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
}
.fg-btn-primary:hover {
  background: #4338ca;
}
.fg-btn-sub {
  display: block;
  font-weight: 400;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.fg-panel {
  margin-top: 12px;
  padding: 14px;
  border-radius: 10px;
  background: #0d1424;
  border: 1px solid #1f2a44;
  display: none;
  flex-direction: column;
  gap: 10px;
}
.fg-panel.fg-open {
  display: flex;
}
.fg-textarea {
  width: 100%;
  min-height: 60px;
  resize: vertical;
  background: #111a2e;
  border: 1px solid #2a3654;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 13px;
  padding: 8px 10px;
  box-sizing: border-box;
  font-family: inherit;
}
.fg-hint {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}
`

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import Button from '../../components/Button';
import StatusBanner from '../../components/StatusBanner';
import {
  getPaymentSettings,
  savePaymentSettings,
} from '../../services/paymentSettingsService';

export default function AdminSettingsScreen() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => getPaymentSettings());
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => {
    setSettings((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    savePaymentSettings(settings);
    setSaved(true);
  };

  return (
    <AdminShell>
      <button type="button" className="link-btn" onClick={() => navigate('/admin')}>
        &larr; Back to Admin
      </button>

      <h1 className="admin-title">Payment Settings</h1>
      <p className="admin-subtitle">Configure QR code and UPI details shown on the payment page.</p>

      {saved && <StatusBanner type="success">Settings saved successfully.</StatusBanner>}

      <div className="home-card">
        <div className="review-stack">
          <div className="review-section">
            <div className="review-section__head">
              <h2>File Submission Charge</h2>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="admin-amount">
                Amount (₹)
              </label>
              <div className="field__control">
                <input
                  id="admin-amount"
                  className="field__input"
                  type="text"
                  value={settings.amount}
                  onChange={set('amount')}
                  placeholder="499"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="admin-upi">
                UPI ID
              </label>
              <div className="field__control">
                <input
                  id="admin-upi"
                  className="field__input"
                  type="text"
                  value={settings.upiId}
                  onChange={set('upiId')}
                  placeholder="tvme@upi"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="admin-qr">
                QR Code Image URL
              </label>
              <p className="field__message field__message--hint">
                Paste a URL to your UPI QR code image. Leave blank to use the default QR.
              </p>
              <div className="field__control">
                <input
                  id="admin-qr"
                  className="field__input"
                  type="url"
                  value={settings.qrImageUrl}
                  onChange={set('qrImageUrl')}
                  placeholder="https://example.com/qr.png"
                />
              </div>
            </div>

            {settings.qrImageUrl && (
              <div className="payment-card" style={{ marginTop: 12 }}>
                <div className="payment-card__qr">
                  <img
                    src={settings.qrImageUrl}
                    alt="QR Preview"
                    style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 8 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button block onClick={handleSave} style={{ marginTop: 16 }}>
          Save Settings
        </Button>
      </div>
    </AdminShell>
  );
}

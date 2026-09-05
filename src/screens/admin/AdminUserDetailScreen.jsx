import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import Button from '../../components/Button';
import StatusBanner from '../../components/StatusBanner';
import TextField from '../../components/TextField';
import { CheckCircleIcon, CheckIcon, CloseIcon, FileTextIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import {
  approveUserApplication,
  disburseUserLoan,
  findUser,
  rejectUserApplication,
  rejectUserKyc,
  resetUserKyc,
  updateUserLoanLimit,
  verifyUserKyc,
} from '../../services/adminService';
import { getKyc, KYC_BADGES } from '../../services/kycService';
import { formatCurrency, formatDate, formatFileSize, initialsOf } from '../../utils/format';

const APP_STATUS_META = {
  under_review: { chip: 'status-chip--review', label: 'Under Review' },
  approved: { chip: 'status-chip--success', label: 'Approved' },
  rejected: { chip: 'status-chip--rejected', label: 'Rejected' },
  disbursed: { chip: 'status-chip--success', label: 'Disbursed' },
};

export default function AdminUserDetailScreen() {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const [user, setUser] = useState(() => findUser(mobile));
  const [acting, setActing] = useState('');
  const [actionError, setActionError] = useState('');
  const [limitDraft, setLimitDraft] = useState(String(user?.loanLimit ?? 50000));

  useEffect(() => {
    const id = setInterval(() => {
      const refreshed = findUser(mobile);
      if (refreshed) setUser(refreshed);
    }, 3000);
    return () => clearInterval(id);
  }, [mobile]);

  if (!user) {
    return (
      <AdminShell>
        <div className="home-card">
          <div className="empty-state">
            <h3>User not found</h3>
            <p>This user may have been removed.</p>
          </div>
        </div>
        <Button variant="outline" block onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </AdminShell>
    );
  }

  const kyc = getKyc(user);
  const kycBadge = KYC_BADGES[kyc.status];
  const applications = user.applications ?? [];
  const loan = user.activeLoan;
  const nextDue = loan?.schedule?.find((item) => item.status === 'pending');

  const sync = (updated) => {
    setUser(updated);
    setLimitDraft(String(updated.loanLimit ?? 50000));
    if (session.mobile === user.mobile) updateUser(updated);
  };

  const run = (key, action) => async () => {
    if (acting) return;
    setActing(key);
    setActionError('');
    try {
      const updated = await action();
      if (updated) sync(updated);
    } catch (err) {
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setActing('');
    }
  };

  const documents = [
    { label: 'Identity Proof', doc: kyc.identityDocument },
    { label: 'Address Proof', doc: kyc.addressDocument },
    { label: 'Bank Statement', doc: kyc.bankStatement },
    { label: 'Selfie', doc: kyc.selfie },
  ];

  return (
    <AdminShell>
      <button type="button" className="link-btn" onClick={() => navigate('/admin')}>
        &larr; Back to Admin
      </button>

      <div className="home-card">
        <div className="admin-user-head">
          <span className="avatar avatar--lg">{initialsOf(user.fullName)}</span>
          <div>
            <h1>{user.fullName}</h1>
            <p>
              +91 {user.mobile} &middot; Joined {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <div className="limit-editor">
          <TextField
            label="Loan Limit (₹)"
            inputMode="numeric"
            maxLength={7}
            value={limitDraft}
            onChange={(event) =>
              setLimitDraft(event.target.value.replace(/\D/g, '').slice(0, 7))
            }
          />
          <Button
            size="md"
            variant="secondary"
            loading={acting === 'limit'}
            onClick={run('limit', () => updateUserLoanLimit(user.mobile, limitDraft || 0))}
          >
            Save Limit
          </Button>
        </div>
      </div>

      {actionError && <StatusBanner type="error">{actionError}</StatusBanner>}

      <div className="home-card">
        <div className="home-card__head">
          <h2>KYC &amp; Documents</h2>
          <span className={`status-chip ${kycBadge.chipClass}`}>{kycBadge.label}</span>
        </div>

        <div className="review-section__row">
          <span className="review-section__label">PAN</span>
          <span className="review-section__value app-meta__value--mono">{kyc.pan ?? '—'}</span>
        </div>
        <div className="review-section__row">
          <span className="review-section__label">ID Type</span>
          <span className="review-section__value">{kyc.idType ?? '—'}</span>
        </div>
        <div className="review-section__row">
          <span className="review-section__label">Submitted</span>
          <span className="review-section__value">
            {kyc.submittedAt ? formatDate(kyc.submittedAt) : '—'}
          </span>
        </div>
        <div className="review-section__row">
          <span className="review-section__label">Verified</span>
          <span className="review-section__value">
            {kyc.verifiedAt ? formatDate(kyc.verifiedAt) : '—'}
          </span>
        </div>

        <div className="admin-doc-list">
          {documents.map(({ label, doc }) => (
            <div key={label} className="admin-doc-row">
              {doc?.dataUrl && doc.type?.startsWith('image/') ? (
                <img src={doc.dataUrl} alt={label} className="admin-doc-thumb" />
              ) : (
                <span className="admin-doc-icon">
                  <FileTextIcon size={20} />
                </span>
              )}
              <div className="admin-doc-body">
                <p className="admin-doc-name">{label}</p>
                {doc ? (
                  <p className="admin-doc-meta">
                    {doc.name} &middot; {formatFileSize(doc.size)}
                    {doc.dataUrl && doc.type === 'application/pdf' && (
                      <>
                        {' '}
                        &middot;{' '}
                        <a href={doc.dataUrl} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="admin-doc-meta">Not uploaded</p>
                )}
              </div>
              {doc ? (
                <span className="status-chip status-chip--success">
                  <CheckIcon size={10} /> Uploaded
                </span>
              ) : (
                <span className="status-chip status-chip--neutral">Missing</span>
              )}
            </div>
          ))}
        </div>

        {kyc.status === 'under_review' && (
          <div className="admin-actions">
            <Button
              variant="success"
              loading={acting === 'verify'}
              onClick={run('verify', () => verifyUserKyc(user.mobile))}
            >
              Confirm KYC
            </Button>
            <Button
              variant="danger"
              loading={acting === 'rejectKyc'}
              onClick={run('rejectKyc', () => rejectUserKyc(user.mobile))}
            >
              Reject KYC
            </Button>
          </div>
        )}
        {kyc.status === 'rejected' && kyc.rejectionReason && (
          <div className="kyc-reason">
            <strong>Reason:</strong> {kyc.rejectionReason}
          </div>
        )}
        <div className="admin-actions">
          <Button
            variant="ghost"
            size="md"
            loading={acting === 'resetKyc'}
            onClick={run('resetKyc', () => resetUserKyc(user.mobile))}
          >
            Reset KYC
          </Button>
        </div>
      </div>

      {kyc.bank && kyc.bank.accountNumber && (
        <div className="home-card">
          <div className="home-card__head">
            <h2>Bank Details</h2>
            <span className="status-chip status-chip--success">Verified</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Account Holder</span>
            <span className="review-section__value">{kyc.bank.accountHolder}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Account Number</span>
            <span className="review-section__value app-meta__value--mono">{kyc.bank.accountNumber}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">IFSC</span>
            <span className="review-section__value app-meta__value--mono">{kyc.bank.ifsc}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Bank Name</span>
            <span className="review-section__value">{kyc.bank.bankName}</span>
          </div>
        </div>
      )}

      {kyc.payment && (
        <div className="home-card">
          <div className="home-card__head">
            <h2>Payment Details</h2>
            <span className="status-chip status-chip--success">Submitted</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Name</span>
            <span className="review-section__value">{kyc.payment.name}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Mobile</span>
            <span className="review-section__value">+91 {kyc.payment.phone}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">UTR</span>
            <span className="review-section__value app-meta__value--mono">{kyc.payment.utr}</span>
          </div>
          {kyc.payment.receipt && (
            <div className="admin-doc-row">
              {kyc.payment.receipt.dataUrl && kyc.payment.receipt.type?.startsWith('image/') ? (
                <img src={kyc.payment.receipt.dataUrl} alt="Receipt" className="admin-doc-thumb" />
              ) : (
                <span className="admin-doc-icon">
                  <FileTextIcon size={20} />
                </span>
              )}
              <div className="admin-doc-body">
                <p className="admin-doc-name">Payment Receipt</p>
                <p className="admin-doc-meta">
                  {kyc.payment.receipt.name} &middot; {formatFileSize(kyc.payment.receipt.size)}
                </p>
              </div>
              <span className="status-chip status-chip--success">
                <CheckIcon size={10} /> Uploaded
              </span>
            </div>
          )}
          {kyc.payment.paidAt && (
            <div className="review-section__row">
              <span className="review-section__label">Paid At</span>
              <span className="review-section__value">{formatDate(kyc.payment.paidAt)}</span>
            </div>
          )}
        </div>
      )}

      <div className="home-card">
        <div className="home-card__head">
          <h2>Loan Applications</h2>
          <span className="status-chip status-chip--neutral">{applications.length}</span>
        </div>
        {applications.length === 0 ? (
          <div className="empty-state">
            <h3>No applications</h3>
            <p>Loan applications submitted by this user will appear here.</p>
          </div>
        ) : (
          <div className="admin-app-list">
            {applications.map((application) => {
              const meta = APP_STATUS_META[application.status] ?? APP_STATUS_META.under_review;
              return (
                <div key={application.id} className="admin-app-row">
                  <div className="admin-app-row__body">
                    <p className="admin-doc-name">
                      <span className="app-meta__value--mono">{application.id}</span>
                    </p>
                    <p className="admin-doc-meta">
                      {formatCurrency(application.amount)} &middot; {application.tenureMonths}{' '}
                      months &middot; EMI {formatCurrency(application.emiAmount)} &middot;{' '}
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <span className={`status-chip ${meta.chip}`}>{meta.label}</span>
                  {application.status === 'under_review' && (
                    <div className="admin-app-row__actions">
                      <Button
                        size="md"
                        variant="success"
                        loading={acting === `approve-${application.id}`}
                        onClick={run(`approve-${application.id}`, () =>
                          approveUserApplication(user.mobile, application.id)
                        )}
                      >
                        Approve
                      </Button>
                      <Button
                        size="md"
                        variant="danger"
                        loading={acting === `reject-${application.id}`}
                        onClick={run(`reject-${application.id}`, () =>
                          rejectUserApplication(user.mobile, application.id)
                        )}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {application.status === 'approved' && (
                    <div className="admin-app-row__actions">
                      <Button
                        size="md"
                        variant="secondary"
                        loading={acting === `disburse-${application.id}`}
                        onClick={run(`disburse-${application.id}`, () =>
                          disburseUserLoan(user.mobile, application.id)
                        )}
                      >
                        Disburse
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loan && (
        <div className="home-card">
          <div className="home-card__head">
            <h2>Active Loan</h2>
            <span className="badge badge--active">Active</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Loan ID</span>
            <span className="review-section__value app-meta__value--mono">{loan.loanId}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Amount</span>
            <span className="review-section__value">{formatCurrency(loan.approvedAmount)}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Monthly EMI</span>
            <span className="review-section__value">{formatCurrency(loan.emiAmount)}</span>
          </div>
          <div className="review-section__row">
            <span className="review-section__label">Outstanding</span>
            <span className="review-section__value">{formatCurrency(loan.outstanding)}</span>
          </div>
          {nextDue && (
            <div className="review-section__row">
              <span className="review-section__label">Next Due</span>
              <span className="review-section__value">{formatDate(nextDue.dueDate)}</span>
            </div>
          )}
        </div>
      )}

      <div className="home-card">
        <div className="home-card__head">
          <h2>Recent Activity</h2>
        </div>
        {(user.activity ?? []).length === 0 ? (
          <div className="empty-state">
            <h3>No activity</h3>
            <p>User activity events will appear here.</p>
          </div>
        ) : (
          <div className="activity-list">
            {user.activity.map((item) => (
              <div key={item.id} className="activity-item">
                <span className="activity-item__icon activity-item__icon--status">
                  {item.status === 'success' ? (
                    <CheckCircleIcon size={18} />
                  ) : item.status === 'rejected' ? (
                    <CloseIcon size={18} />
                  ) : (
                    <CheckCircleIcon size={18} />
                  )}
                </span>
                <div className="activity-item__body">
                  <p className="activity-item__title">{item.title}</p>
                  <p className="activity-item__detail">{item.detail}</p>
                </div>
                <div className="activity-item__meta">
                  <span>{formatDate(item.at)}</span>
                  {item.status && (
                    <span className={`status-chip status-chip--${item.status}`}>
                      {item.status === 'success'
                        ? 'Success'
                        : item.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

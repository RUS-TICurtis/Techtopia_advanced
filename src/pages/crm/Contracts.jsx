import React, { useState, useRef } from 'react';
import { FileSignature, Plus, X, Upload, FileText, CheckCircle, Clock, Edit3 } from 'lucide-react';
import { useContracts } from '../../hooks/useCrmData';
import './Contracts.css';

const TYPES   = ['Service Agreement', 'NDA', 'SOW', 'Employment', 'Vendor', 'Other'];
const emptyForm = {
  title: '', client: '', type: 'Service Agreement',
  startDate: '', endDate: '', status: 'Draft',
  notes: '', file: null, fileName: ''
};

const statusColors = {
  Draft: 'badge-neutral', 'Pending Signature': 'badge-warning',
  Signed: 'badge-success', Expired: 'badge-danger'
};

const STATUSES = ['Draft', 'Pending Signature', 'Signed', 'Expired'];

export default function Contracts({ searchValue = '' }) {
  const { contracts = [], isLoading, createContract } = useContracts();
  const [showModal, setShowModal]  = useState(false);
  const [form, setForm]            = useState(emptyForm);
  const fileRef                    = useRef();

  const metrics = [
    { label: 'Total',             value: contracts.length,                                        icon: FileText,    color: 'var(--brand-blue)' },
    { label: 'Signed',            value: contracts.filter(c=>c.status==='Signed').length,          icon: CheckCircle, color: 'var(--brand-green)' },
    { label: 'Pending Signature', value: contracts.filter(c=>c.status==='Pending Signature').length,icon: Clock,       color: 'var(--brand-chartreuse)' },
    { label: 'Draft',             value: contracts.filter(c=>c.status==='Draft').length,            icon: Edit3,       color: 'var(--brand-purple)' },
  ];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setForm(f => ({ ...f, file, fileName: file.name }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setForm(f => ({ ...f, file, fileName: file.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContract({
        title: form.title,
        client: form.client,
        type: form.type,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status,
        value: 5000.0,
        contractNumber: `CON-${String(contracts.length + 1).padStart(4, '0')}`,
        slaTerms: form.notes || ''
      });
      setForm(emptyForm);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create contract.');
    }
  };

  const filtered = contracts.filter(c =>
    (c.title || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    (c.client || '').toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contracts</h1>
          <p className="page-subtitle">Manage contracts and e-signatures</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Contract
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card">
              <div className="metric-icon-wrapper" style={{ background: `${m.color}22` }}>
                <Icon size={22} style={{ color: m.color }} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <span className="metric-value">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <FileSignature size={48} className="empty-icon" />
          <h3>No contracts yet</h3>
          <p>Create your first contract to start managing agreements.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Contract
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr><th>Title</th><th>Client</th><th>Type</th><th>Start</th><th>End</th><th>File</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>{c.client}</td>
                  <td>{c.type || 'Service Agreement'}</td>
                  <td>{c.startDate || 'â€”'}</td>
                  <td>{c.endDate || 'â€”'}</td>
                  <td>
                    {c.fileName
                      ? <span className="contract-file-tag"><FileText size={13}/> {c.fileName}</span>
                      : 'â€”'}
                  </td>
                  <td><span className={`badge ${statusColors[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Contract</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {/* Template shortcuts */}
              <div className="contract-templates">
                {['NDA', 'Service Agreement', 'SOW'].map(t => (
                  <button type="button" key={t}
                    className={`contract-template-btn ${form.type === t ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, type: t }))}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contract Title *</label>
                  <input className="form-input" required value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client *</label>
                  <input className="form-input" required value={form.client}
                    onChange={e => setForm({...form, client: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select className="form-input" value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select className="form-input" value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input className="form-input" type="date" value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date</label>
                  <input className="form-input" type="date" value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="form-group">
                <label>Upload Contract (PDF)</label>
                <div
                  className={`contract-upload-zone ${form.fileName ? 'has-file' : ''}`}
                  onClick={() => fileRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFile} />
                  {form.fileName ? (
                    <div className="contract-upload-file">
                      <FileText size={20} style={{ color: 'var(--primary)' }} />
                      <span>{form.fileName}</span>
                      <button type="button" className="btn-icon" onClick={(e) => { e.stopPropagation(); setForm(f => ({...f, file: null, fileName:''})); }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} className="upload-icon" />
                      <p>Drag & drop or <span>click to upload</span></p>
                      <small>PDF, DOC, DOCX supported</small>
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input form-textarea" value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

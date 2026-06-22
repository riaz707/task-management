import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import toast from 'react-hot-toast';
import './projects.css';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6'];

export function ProjectModal({ project, onClose }) {
  const { createProject, updateProject } = useProjectStore();
  const isNew = !project;
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    color: project?.color || '#6366f1',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      if (isNew) {
        await createProject(form);
        toast.success('Project created!');
      } else {
        await updateProject(project._id, form);
        toast.success('Project updated!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'New Project' : 'Edit Project'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Website Redesign"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this project about?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  className={`color-swatch ${form.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isNew ? 'Create Project' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

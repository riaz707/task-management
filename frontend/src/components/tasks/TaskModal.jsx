import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { commentAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './tasks.css';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export function TaskModal({ task, projectId, initialStatus = 'todo', members = [], onClose }) {
  const { createTask, updateTask, deleteTask, toggleChecklist } = useTaskStore();
  const { user } = useAuthStore();
  const isNew = !task;

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || initialStatus,
    priority: task?.priority || 'medium',
    assignees: task?.assignees?.map((a) => a._id) || [],
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    labels: task?.labels?.join(', ') || '',
    checklist: task?.checklist || [],
  });

  const [newCheckItem, setNewCheckItem] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('details');

  useEffect(() => {
    if (task) {
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    try {
      const { data } = await commentAPI.getAll(task._id);
      setComments(data.comments || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        labels: form.labels ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || undefined,
      };
      if (isNew) {
        await createTask(payload);
        toast.success('Task created!');
      } else {
        await updateTask(task._id, payload);
        toast.success('Task updated!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(task._id);
      toast.success('Task deleted');
      onClose();
    } catch { toast.error('Failed to delete'); }
  };

  const addCheckItem = (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    setForm((f) => ({ ...f, checklist: [...f.checklist, { text: newCheckItem, completed: false }] }));
    setNewCheckItem('');
  };

  const toggleCheckItem = async (idx, itemId) => {
    if (task && itemId) {
      await toggleChecklist(task._id, itemId);
    } else {
      setForm((f) => ({
        ...f,
        checklist: f.checklist.map((c, i) => i === idx ? { ...c, completed: !c.completed } : c),
      }));
    }
  };

  const removeCheckItem = (idx) => {
    setForm((f) => ({ ...f, checklist: f.checklist.filter((_, i) => i !== idx) }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await commentAPI.create({ task: task._id, content: commentText });
      setCommentText('');
      loadComments();
    } catch { toast.error('Failed to add comment'); }
  };

  const toggleAssignee = (memberId) => {
    setForm((f) => ({
      ...f,
      assignees: f.assignees.includes(memberId)
        ? f.assignees.filter((id) => id !== memberId)
        : [...f.assignees, memberId],
    }));
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal task-modal">
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'New Task' : 'Task Details'}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            )}
            <button className="btn-ghost" onClick={onClose}>✕</button>
          </div>
        </div>

        {!isNew && (
          <div className="modal-tabs">
            {['details', 'checklist', 'comments'].map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'comments' && comments.length > 0 && <span className="tab-count">{comments.length}</span>}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {(tab === 'details' || isNew) && (
            <div className="task-form-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Labels (comma separated)</label>
                  <input
                    value={form.labels}
                    onChange={(e) => setForm({ ...form, labels: e.target.value })}
                    placeholder="bug, feature, urgent..."
                  />
                </div>
              </div>

              {members.length > 0 && (
                <div className="form-group">
                  <label>Assignees</label>
                  <div className="assignee-picker">
                    {members.map((m) => (
                      <button
                        key={m._id} type="button"
                        className={`assignee-chip ${form.assignees.includes(m._id) ? 'selected' : ''}`}
                        onClick={() => toggleAssignee(m._id)}
                      >
                        <div className="avatar">{m.name?.[0]}</div>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isNew && (
                <div className="form-group">
                  <label>Checklist</label>
                  <div className="checklist-editor">
                    {form.checklist.map((item, i) => (
                      <div key={i} className="checklist-item">
                        <input
                          type="checkbox" checked={item.completed}
                          onChange={() => toggleCheckItem(i, null)}
                        />
                        <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                        <button type="button" className="btn-ghost" onClick={() => removeCheckItem(i)}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={newCheckItem}
                        onChange={(e) => setNewCheckItem(e.target.value)}
                        placeholder="Add checklist item..."
                      />
                      <button type="button" className="btn-ghost" onClick={addCheckItem}>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'checklist' && !isNew && (
            <div className="task-form-body">
              <div className="checklist-editor">
                {form.checklist.map((item, i) => (
                  <div key={item._id || i} className="checklist-item">
                    <input
                      type="checkbox" checked={item.completed}
                      onChange={() => toggleCheckItem(i, item._id)}
                    />
                    <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                    <button type="button" className="btn-ghost" onClick={() => removeCheckItem(i)}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    placeholder="Add checklist item..."
                  />
                  <button type="button" className="btn-ghost" onClick={addCheckItem}>Add</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'comments' && !isNew && (
            <div className="task-form-body">
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment">
                    <div className="avatar">{c.author?.name?.[0] || 'U'}</div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{c.author?.name}</span>
                        <span className="comment-time">
                          {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="comment-text">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                    No comments yet
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment(e)}
                />
                <button type="button" className="btn-primary" onClick={handleComment}>Send</button>
              </div>
            </div>
          )}

          {(tab === 'details' || isNew) && (
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : isNew ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

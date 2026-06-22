import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { format, isPast, isToday } from 'date-fns';
import '../pages/pages.css';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
];

export function MyTasksPage() {
  const { myTasks, fetchMyTasks } = useTaskStore();
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => { fetchMyTasks(); }, []);

  const filtered = myTasks.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">{myTasks.length} tasks assigned to you</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >{f.label}</button>
          ))}
        </div>
        <div className="filter-group">
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`filter-btn ${priorityFilter === p ? 'active' : ''} ${p !== 'all' ? `priority-${p}` : ''}`}
              onClick={() => setPriorityFilter(p)}
            >{p === 'all' ? 'All Priority' : p}</button>
          ))}
        </div>
      </div>

      <div className="tasks-table card">
        <div className="table-header">
          <span>Task</span>
          <span>Project</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Due Date</span>
        </div>
        {filtered.map((task) => {
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const overdue = dueDate && isPast(dueDate) && task.status !== 'done';
          const dueToday = dueDate && isToday(dueDate);
          return (
            <div key={task._id} className="table-row">
              <div className="task-cell">
                <span className="task-name">{task.title}</span>
                {task.description && (
                  <span className="task-desc-small">{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</span>
                )}
              </div>
              <div>
                <span className="project-pill" style={{ background: `${task.project?.color}20`, color: task.project?.color }}>
                  {task.project?.title}
                </span>
              </div>
              <div>
                <span className={`badge badge-${task.status.replace('-', '')}`}>{task.status}</span>
              </div>
              <div>
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              </div>
              <div>
                {dueDate ? (
                  <span className={`due-pill ${overdue ? 'overdue' : dueToday ? 'today' : ''}`}>
                    {overdue ? '🔴' : dueToday ? '🟡' : '📅'} {format(dueDate, 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ borderTop: '1px solid var(--border)', borderRadius: 0 }}>
            <div className="icon">✓</div>
            <p>No tasks match the filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

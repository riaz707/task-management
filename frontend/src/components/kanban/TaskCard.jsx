import { format, isPast, isToday } from 'date-fns';
import './kanban.css';

const PRIORITY_ICONS = { low: '↓', medium: '→', high: '↑', urgent: '⚠' };

export function TaskCard({ task, onClick }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const isDueToday = dueDate && isToday(dueDate);

  const completedItems = task.checklist?.filter((c) => c.completed).length || 0;
  const totalItems = task.checklist?.length || 0;
  const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-top">
        <span className={`badge badge-${task.priority}`}>
          {PRIORITY_ICONS[task.priority]} {task.priority}
        </span>
        {task.labels?.slice(0, 2).map((label) => (
          <span key={label} className="tag">{label}</span>
        ))}
      </div>

      <h4 className="task-title">{task.title}</h4>

      {task.description && (
        <p className="task-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
      )}

      {totalItems > 0 && (
        <div className="checklist-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${checklistProgress}%` }} />
          </div>
          <span className="progress-label">{completedItems}/{totalItems}</span>
        </div>
      )}

      <div className="task-footer">
        <div className="assignees">
          {task.assignees?.slice(0, 3).map((a) => (
            <div key={a._id} className="avatar avatar-sm" title={a.name}>{a.name?.[0]}</div>
          ))}
          {task.assignees?.length > 3 && (
            <div className="avatar avatar-sm">+{task.assignees.length - 3}</div>
          )}
        </div>

        {dueDate && (
          <span className={`due-date ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : ''}`}>
            📅 {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(dueDate, 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

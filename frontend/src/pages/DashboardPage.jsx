import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { ProjectModal } from '../components/projects/ProjectModal';
import '../components/projects/projects.css';
import { format, isPast } from 'date-fns';

export function DashboardPage() {
  const { projects, loading } = useProjectStore();
  const { myTasks, fetchMyTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const overdueTasks = myTasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
  const urgentTasks = myTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle">Here's what's happening across your projects</div>
        </div>
        <button className="btn-primary" onClick={() => setShowNewProject(true)}>+ New Project</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ color: '#6366f1' }}>📁</div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ color: '#10b981' }}>✓</div>
          <div className="stat-value">{myTasks.length}</div>
          <div className="stat-label">Assigned Tasks</div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ color: '#ef4444' }}>⚠</div>
          <div className="stat-value">{overdueTasks.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>🔥</div>
          <div className="stat-value">{urgentTasks.length}</div>
          <div className="stat-label">Urgent</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Projects */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
            <Link to="/projects" className="btn-ghost" style={{ fontSize: 13 }}>View all</Link>
          </div>
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : projects.length === 0 ? (
            <div className="empty-state card">
              <div className="icon">📁</div>
              <p>No projects yet</p>
              <button className="btn-primary" onClick={() => setShowNewProject(true)}>Create your first project</button>
            </div>
          ) : (
            <div className="projects-grid" style={{ gridTemplateColumns: '1fr' }}>
              {projects.slice(0, 4).map((p) => (
                <Link key={p._id} to={`/project/${p._id}`} className="project-card card" style={{ textDecoration: 'none' }}>
                  <div className="project-card-top">
                    <div className="project-color-bar" style={{ background: `${p.color}20`, color: p.color }}>
                      📋
                    </div>
                    <span className="badge" style={{ background: `${p.color}20`, color: p.color }}>
                      {p.members?.length} members
                    </span>
                  </div>
                  <div className="project-card-title">{p.title}</div>
                  {p.description && <div className="project-card-desc">{p.description}</div>}
                  <div className="project-card-footer">
                    <div className="member-avatars">
                      {p.members?.slice(0, 4).map((m) => (
                        <div key={m._id} className="avatar">{m.name?.[0]}</div>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {format(new Date(p.createdAt), 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div>
          <div className="section-header">
            <h2 className="section-title">My Tasks</h2>
            <Link to="/my-tasks" className="btn-ghost" style={{ fontSize: 13 }}>View all</Link>
          </div>
          <div className="my-tasks-list">
            {myTasks.slice(0, 6).map((t) => (
              <div key={t._id} className="card my-task-item">
                <div className="my-task-left">
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                  <div>
                    <div className="my-task-title">{t.title}</div>
                    <div className="my-task-project" style={{ color: t.project?.color }}>
                      {t.project?.title}
                    </div>
                  </div>
                </div>
                <div className="my-task-right">
                  <span className={`badge badge-${t.status.replace('-', '')}`}>{t.status}</span>
                  {t.dueDate && (
                    <span className={`due-small ${isPast(new Date(t.dueDate)) && t.status !== 'done' ? 'overdue' : ''}`}>
                      {format(new Date(t.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="empty-state card">
                <div className="icon">✓</div>
                <p>No tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewProject && <ProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

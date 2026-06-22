import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import './layout.css';

const NAV = [
  { to: '/', icon: '⊞', label: 'Dashboard', exact: true },
  { to: '/my-tasks', icon: '✓', label: 'My Tasks' },
];

export function Sidebar({ projects }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          {!collapsed && <span className="logo-text">TaskFlow</span>}
        </div>
        <button className="btn-ghost collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to} to={to}
            end={exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-projects">
          <div className="projects-label">Projects</div>
          {projects.map((p) => (
            <NavLink
              key={p._id}
              to={`/project/${p._id}`}
              className={({ isActive }) => `nav-item project-item ${isActive ? 'active' : ''}`}
            >
              <span className="project-dot" style={{ background: p.color || '#6366f1' }} />
              <span className="project-name">{p.title}</span>
            </NavLink>
          ))}
          {projects.length === 0 && (
            <p className="no-projects">No projects yet</p>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.name?.[0] || 'U'}</div>
          {!collapsed && (
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          )}
        </div>
        <button className="btn-ghost logout-btn" onClick={handleLogout} title="Logout">
          ⇥
        </button>
      </div>
    </aside>
  );
}

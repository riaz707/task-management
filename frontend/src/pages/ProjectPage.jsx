import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/tasks/TaskModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import toast from 'react-hot-toast';

export function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProject, fetchProject, deleteProject, addMember, removeMember } = useProjectStore();
  const { fetchTasks, loading, setActiveTask } = useTaskStore();
  const { user } = useAuthStore();

  const [taskModal, setTaskModal] = useState(null); // { task?, initialStatus? }
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [memberInput, setMemberInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => navigate('/'));
      fetchTasks(id);
    }
  }, [id]);

  if (!activeProject) return (
    <div className="page-content">
      <div className="empty-state"><div className="spinner" /></div>
    </div>
  );

  const isOwner = activeProject.owner?._id === user?._id || activeProject.owner === user?._id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberInput.trim()) return;
    try {
      await addMember(id, memberInput.trim());
      setMemberInput('');
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-content" style={{ paddingBottom: 0 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38,
            background: `${activeProject.color}20`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: activeProject.color
          }}>📋</div>
          <div>
            <div className="page-title">{activeProject.title}</div>
            {activeProject.description && (
              <div className="page-subtitle">{activeProject.description}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="member-avatars" style={{ display: 'flex' }}>
            {activeProject.members?.slice(0, 5).map((m) => (
              <div
                key={m._id}
                className="avatar"
                title={m.name}
                style={{ marginRight: -6, border: '2px solid var(--bg-primary)', cursor: 'pointer' }}
                onClick={() => setShowMembers(!showMembers)}
              >{m.name?.[0]}</div>
            ))}
          </div>
          {isOwner && (
            <>
              <button className="btn-ghost" onClick={() => setEditProjectModal(true)}>⚙ Settings</button>
              <button className="btn-danger" onClick={handleDeleteProject}>Delete</button>
            </>
          )}
          <button className="btn-primary" onClick={() => setTaskModal({ initialStatus: 'todo' })}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Member management */}
      {showMembers && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Team Members</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {activeProject.members?.map((m) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: 20 }}>
                <div className="avatar">{m.name?.[0]}</div>
                <span style={{ fontSize: 13 }}>{m.name}</span>
                {isOwner && m._id !== activeProject.owner?._id && (
                  <button
                    className="btn-ghost"
                    style={{ padding: '0 4px', fontSize: 12 }}
                    onClick={() => removeMember(id, m._id)}
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8 }}>
              <input
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="User ID to add..."
                style={{ maxWidth: 280 }}
              />
              <button className="btn-primary" type="submit">Add</button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="spinner" /></div>
      ) : (
        <KanbanBoard
          projectId={id}
          onTaskClick={(task) => setTaskModal({ task })}
          onAddTask={(status) => setTaskModal({ initialStatus: status })}
        />
      )}

      {taskModal && (
        <TaskModal
          task={taskModal.task}
          projectId={id}
          initialStatus={taskModal.initialStatus}
          members={activeProject.members || []}
          onClose={() => setTaskModal(null)}
        />
      )}

      {editProjectModal && (
        <ProjectModal
          project={activeProject}
          onClose={() => setEditProjectModal(false)}
        />
      )}
    </div>
  );
}

import { create } from 'zustand';
import { projectAPI } from '../api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { data } = await projectAPI.getAll();
      set({ projects: data.projects });
    } finally {
      set({ loading: false });
    }
  },

  fetchProject: async (id) => {
    const { data } = await projectAPI.getOne(id);
    set({ activeProject: data.project });
    return data.project;
  },

  createProject: async (payload) => {
    const { data } = await projectAPI.create(payload);
    set((s) => ({ projects: [data.project, ...s.projects] }));
    return data.project;
  },

  updateProject: async (id, payload) => {
    const { data } = await projectAPI.update(id, payload);
    set((s) => ({
      projects: s.projects.map((p) => p._id === id ? data.project : p),
      activeProject: s.activeProject?._id === id ? data.project : s.activeProject,
    }));
  },

  deleteProject: async (id) => {
    await projectAPI.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p._id !== id),
      activeProject: s.activeProject?._id === id ? null : s.activeProject,
    }));
  },

  addMember: async (projectId, userId) => {
    const { data } = await projectAPI.addMember(projectId, userId);
    set((s) => ({
      activeProject: s.activeProject ? { ...s.activeProject, members: data.members } : null,
    }));
  },

  removeMember: async (projectId, userId) => {
    await projectAPI.removeMember(projectId, userId);
    set((s) => ({
      activeProject: s.activeProject
        ? { ...s.activeProject, members: s.activeProject.members.filter((m) => m._id !== userId) }
        : null,
    }));
  },
}));

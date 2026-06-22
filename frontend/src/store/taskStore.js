import { create } from 'zustand';
import { taskAPI } from '../api';

export const useTaskStore = create((set, get) => ({
  columns: { todo: [], 'in-progress': [], review: [], done: [] },
  myTasks: [],
  activeTask: null,
  loading: false,

  fetchTasks: async (projectId, filters = {}) => {
    set({ loading: true });
    try {
      const { data } = await taskAPI.getAll({ project: projectId, ...filters });
      set({ columns: data.columns });
    } finally {
      set({ loading: false });
    }
  },

  fetchMyTasks: async () => {
    const { data } = await taskAPI.getMyTasks();
    set({ myTasks: data.tasks });
  },

  fetchTask: async (id) => {
    const { data } = await taskAPI.getOne(id);
    set({ activeTask: data.task });
    return data.task;
  },

  createTask: async (payload) => {
    const { data } = await taskAPI.create(payload);
    const task = data.task;
    set((s) => ({
      columns: {
        ...s.columns,
        [task.status]: [...(s.columns[task.status] || []), task],
      },
    }));
    return task;
  },

  updateTask: async (id, payload) => {
    const { data } = await taskAPI.update(id, payload);
    const task = data.task;
    set((s) => {
      const newCols = { ...s.columns };
      Object.keys(newCols).forEach((col) => {
        newCols[col] = newCols[col].map((t) => t._id === id ? task : t);
      });
      return { columns: newCols, activeTask: s.activeTask?._id === id ? task : s.activeTask };
    });
  },

  moveTask: async (taskId, fromStatus, toStatus, newOrder) => {
    set((s) => {
      const newCols = { ...s.columns };
      const task = newCols[fromStatus]?.find((t) => t._id === taskId);
      if (!task) return s;
      newCols[fromStatus] = newCols[fromStatus].filter((t) => t._id !== taskId);
      const updated = { ...task, status: toStatus };
      const dest = [...(newCols[toStatus] || [])];
      dest.splice(newOrder, 0, updated);
      newCols[toStatus] = dest;
      return { columns: newCols };
    });
    try {
      await taskAPI.move(taskId, { status: toStatus, order: newOrder });
    } catch {}
  },

  deleteTask: async (id) => {
    await taskAPI.delete(id);
    set((s) => {
      const newCols = { ...s.columns };
      Object.keys(newCols).forEach((col) => {
        newCols[col] = newCols[col].filter((t) => t._id !== id);
      });
      return { columns: newCols };
    });
  },

  toggleChecklist: async (taskId, itemId) => {
    const { data } = await taskAPI.toggleChecklist(taskId, itemId);
    set((s) => {
      const update = (task) => task._id === taskId ? { ...task, checklist: data.checklist } : task;
      const newCols = { ...s.columns };
      Object.keys(newCols).forEach((col) => { newCols[col] = newCols[col].map(update); });
      return {
        columns: newCols,
        activeTask: s.activeTask?._id === taskId ? { ...s.activeTask, checklist: data.checklist } : s.activeTask,
      };
    });
  },

  setActiveTask: (task) => set({ activeTask: task }),
}));

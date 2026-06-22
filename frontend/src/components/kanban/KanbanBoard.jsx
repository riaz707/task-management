import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../../store/taskStore';
import { TaskCard } from './TaskCard';
import './kanban.css';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#8b98b5' },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#10b981' },
];

function SortableTaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={() => onClick(task)} />
    </div>
  );
}

export function KanbanBoard({ projectId, onTaskClick, onAddTask }) {
  const { columns, moveTask } = useTaskStore();
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findColumn = (taskId) => {
    for (const col of COLUMNS) {
      if (columns[col.id]?.some((t) => t._id === taskId)) return col.id;
    }
    return null;
  };

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    const col = findColumn(active.id);
    if (col) setActiveTask(columns[col].find((t) => t._id === active.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    setActiveTask(null);
    if (!over) return;

    const fromCol = findColumn(active.id);
    const toColId = COLUMNS.find((c) => c.id === over.id)?.id
      || findColumn(over.id);

    if (!fromCol || !toColId) return;
    if (fromCol === toColId && active.id === over.id) return;

    const toColTasks = columns[toColId] || [];
    const newOrder = toColTasks.findIndex((t) => t._id === over.id);
    moveTask(active.id, fromCol, toColId, newOrder === -1 ? toColTasks.length : newOrder);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const tasks = columns[col.id] || [];
          return (
            <div key={col.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot" style={{ background: col.color }} />
                  <span>{col.label}</span>
                </div>
                <div className="column-meta">
                  <span className="task-count">{tasks.length}</span>
                  <button className="btn-ghost add-task-btn" onClick={() => onAddTask(col.id)}>+</button>
                </div>
              </div>
              <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy} id={col.id}>
                <div className="column-body">
                  {tasks.map((task) => (
                    <SortableTaskCard key={task._id} task={task} onClick={onTaskClick} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="column-empty">
                      <span>Drop tasks here</span>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

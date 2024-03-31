import { kv } from "@vercel/kv";

/**
 * The number of days after which a completed task is considered for
 * auto-deletion.
 *
 * Defaults to a fortnight (14 days).
 */
const AUTO_DELETE_COMPLETED_TASKS_DAYS = 14;

type TaskStatus = "pending" | "completed";

type BaseModel = {
  id: number;
  created_at: string;
  updated_at: string;
};

type CreateTask = {
  title: string;
  status: TaskStatus;
};

export type Task = CreateTask & BaseModel;

export default function Tasks(user: string) {
  if (!user.trim()) {
    throw "User cannot be empty";
  }

  const getTasks = async () => {
    let resultSet: Task[] = (await kv.get(`${user}:tasks`)) || [];
    resultSet = resultSet.filter((task) => !taskEligibleForAutoDelete(task));
    return resultSet;
  };

  /**
   * Sets the tasks of a user.
   * Also excludes any tasks that are eligible for exclusion.
   */
  const setTasks = async (tasks: Task[]) => {
    const resultSet = tasks.filter((task) => !taskEligibleForAutoDelete(task));
    return await kv.set(`${user}:tasks`, resultSet);
  };

  return {
    /**
     * Adds a task to the user.
     *
     * @returns The numeric identifier of the created task which can be used for
     * lookups. Unique for a user.
     */
    add: async (task: CreateTask) => {
      const now = new Date().toISOString();
      const count = await kv.incr(`${user}:task-counter`);

      const tasks = await getTasks();

      tasks.push({
        ...task,
        id: count,
        created_at: now,
        updated_at: now,
      });

      await setTasks(tasks);

      return { id: count, tasks };
    },

    /**
     * Lists all tasks grouped by the status.
     */
    groupedByStatus: async () => {
      const tasks = await getTasks();

      const groupedByStatus: Record<Task["status"], Task[]> = {
        pending: [],
        completed: [],
      };

      tasks.forEach((task) => groupedByStatus[task.status].push(task));

      return groupedByStatus;
    },

    /**
     * Updates a task.
     * @returns The task that was updated, `false` if not found.
     */
    update: async (id: Task["id"], data: Partial<CreateTask>) => {
      const tasks = await getTasks();

      let instance = tasks.find((task) => task.id === id);
      if (!instance) {
        return false;
      }

      const now = new Date().toISOString();
      const updated = { ...instance, ...data, updated_at: now };

      await setTasks(tasks.map((task) => (task.id === id ? updated : task)));
      return updated;
    },

    /**
     * Deletes a task
     * @returns The task that was deleted, `false` if not found.
     */
    delete: async (id: Task["id"]) => {
      const tasks = await getTasks();

      let instance = tasks.find((task) => task.id === id);
      if (!instance) {
        return false;
      }

      await setTasks(tasks.filter((task) => task.id !== id));
      return instance;
    },
  };
}

/**
 * A filter fn. to check whether the task can be skipped from the result set
 * or auto-deleted.
 */
const taskEligibleForAutoDelete = (task: Task) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - AUTO_DELETE_COMPLETED_TASKS_DAYS);

  return (
    task.status === "completed" &&
    new Date(task.updated_at).getTime() < threshold.getTime()
  );
};

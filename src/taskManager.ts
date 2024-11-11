import * as vscode from 'vscode';

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    date: string;
}

export class TaskManager {
    private tasks: Task[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadTasks();
    }

    private loadTasks() {
        this.tasks = this.context.globalState.get('tasks', []);
    }

    private saveTasks() {
        this.context.globalState.update('tasks', this.tasks);
    }

    public addTask(title: string, description: string) {
        const task: Task = {
            id: Date.now().toString(),
            title,
            description,
            completed: false,
            date: new Date().toISOString().split('T')[0]
        };
        this.tasks.push(task);
        this.saveTasks();
    }

    public toggleTask(taskId: string) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    public deleteTask(taskId: string) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
    }

    public getTasks(): Task[] {
        return this.tasks;
    }

    public getTasksByDate(): Map<string, Task[]> {
        const tasksByDate = new Map<string, Task[]>();
        
        this.tasks.forEach(task => {
            const tasks = tasksByDate.get(task.date) || [];
            tasks.push(task);
            tasksByDate.set(task.date, tasks);
        });

        return new Map([...tasksByDate.entries()].sort().reverse());
    }
}
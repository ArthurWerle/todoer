import * as vscode from 'vscode';
import { TaskManager } from './taskManager';

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskTreeItem | undefined | null | void> = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private taskManager: TaskManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TaskTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TaskTreeItem): Thenable<TaskTreeItem[]> {
        if (!element) {
            const tasksByDate = this.taskManager.getTasksByDate();
            const items: TaskTreeItem[] = [];
            
            tasksByDate.forEach((tasks, date) => {
                const dateItem = new TaskTreeItem(
                    date,
                    vscode.TreeItemCollapsibleState.Expanded
                );
                dateItem.id = date
                dateItem.contextValue = 'date'
                dateItem.iconPath = new vscode.ThemeIcon('calendar')
                items.push(dateItem)
            });
            
            return Promise.resolve(items);
        } else if (element.contextValue === 'date') {
            const tasksByDate = this.taskManager.getTasksByDate()
            const tasks = tasksByDate.get(element.id!) || []
            
            return Promise.resolve(
                tasks.map(task => {
                    const taskItem = new TaskTreeItem(
                        task.title,
                        vscode.TreeItemCollapsibleState.None
                    );
                    taskItem.id = task.id;
                    taskItem.contextValue = 'task';
                    taskItem.description = task.description;
                    taskItem.tooltip = task.description || task.title;
                    
                    if (task.completed) {
                        taskItem.iconPath = new vscode.ThemeIcon('check');
                        taskItem.description = `✓ ${task.description || ''}`;
                    } else {
                        taskItem.iconPath = new vscode.ThemeIcon('circle-outline');
                    }

                    taskItem.command = {
                        command: 'taskManager.toggleTask',
                        title: 'Toggle Task',
                        arguments: [task.id]
                    };

                    return taskItem;
                })
            );
        }
        
        return Promise.resolve([]);
    }
}

class TaskTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}
import * as vscode from 'vscode';
import { TaskTreeProvider } from './taskTreeProvider';
import { Task, TaskManager } from './taskManager';

export function activate(context: vscode.ExtensionContext) {
    const taskManager = new TaskManager(context);
    const treeProvider = new TaskTreeProvider(taskManager);

    vscode.window.registerTreeDataProvider('taskManager', treeProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.addTask', async () => {
            const taskTitle = await vscode.window.showInputBox({
                placeHolder: 'title'
            });
            
            if (taskTitle) {
                const description = await vscode.window.showInputBox({
                    placeHolder: 'description (optional)'
                });
                
                taskManager.addTask(taskTitle, description || '');
                treeProvider.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.toggleTask', (taskId: string) => {
            taskManager.toggleTask(taskId);
            treeProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.deleteTask', (task: Task) => {
            taskManager.deleteTask(task.id);
            treeProvider.refresh();
        })
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.refresh', () => {
            treeProvider.refresh();
        })
    );
}
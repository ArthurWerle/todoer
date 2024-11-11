import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { TaskManager } from '../taskManager';
import { TaskTreeProvider } from '../taskTreeProvider';

suite('Extension Test Suite', () => {
    let taskManager: TaskManager;
    let treeProvider: TaskTreeProvider;
    let context: vscode.ExtensionContext;

    setup(() => {
        context = {
            globalState: {
                get: sinon.stub().returns([]),
                update: sinon.stub().resolves()
            }
        } as unknown as vscode.ExtensionContext;

        taskManager = new TaskManager(context);
        treeProvider = new TaskTreeProvider(taskManager);
    });

    test('TaskManager - Add Task', async () => {
        const title = 'Test Task';
        const description = 'Test Description';
        
        taskManager.addTask(title, description);
        const tasks = taskManager.getTasks();
        
        assert.strictEqual(tasks.length, 1);
        assert.strictEqual(tasks[0].title, title);
        assert.strictEqual(tasks[0].description, description);
        assert.strictEqual(tasks[0].completed, false);
    });

    test('TaskManager - Toggle Task', async () => {
        const title = 'Test Task';
        taskManager.addTask(title, '');
        const tasks = taskManager.getTasks();
        const taskId = tasks[0].id;

        taskManager.toggleTask(taskId);
        assert.strictEqual(tasks[0].completed, true);

        taskManager.toggleTask(taskId);
        assert.strictEqual(tasks[0].completed, false);
    });

    test('TaskManager - Delete Task', async () => {
        const title = 'Test Task';
        taskManager.addTask(title, '');
        const tasks = taskManager.getTasks();
        const taskId = tasks[0].id;

        taskManager.deleteTask(taskId);
        assert.strictEqual(taskManager.getTasks().length, 0);
    });

    test('TaskManager - Group Tasks by Date', async () => {
        const clock = sinon.useFakeTimers(new Date('2024-01-01').getTime());

        taskManager.addTask('Task 1', '');
        
        clock.tick(24 * 60 * 60 * 1000);
        taskManager.addTask('Task 2', '');

        const tasksByDate = taskManager.getTasksByDate();
        assert.strictEqual(tasksByDate.size, 2);
        
        clock.restore();
    });

    test('TreeProvider - Root Level Items', async () => {
        const title = 'Test Task';
        taskManager.addTask(title, '');

        const rootItems = await treeProvider.getChildren();
        assert.strictEqual(rootItems.length, 1); // One date group
        assert.strictEqual(rootItems[0].contextValue, 'date');
    });

    test('TreeProvider - Task Level Items', async () => {
        const title = 'Test Task';
        taskManager.addTask(title, '');

        const rootItems = await treeProvider.getChildren();
        const taskItems = await treeProvider.getChildren(rootItems[0]);

        assert.strictEqual(taskItems.length, 1); // One task
        assert.strictEqual(taskItems[0].label, title);
        assert.strictEqual(taskItems[0].contextValue, 'task');
    });

    test('TreeProvider - Task Completion Visual State', async () => {
        const title = 'Test Task';
        taskManager.addTask(title, '');
        const tasks = taskManager.getTasks();
        const taskId = tasks[0].id;

        const rootItems = await treeProvider.getChildren();
        const taskItems = await treeProvider.getChildren(rootItems[0]);
        const initialIcon = (taskItems[0].iconPath as vscode.ThemeIcon).id;
        assert.strictEqual(initialIcon, 'circle-outline');

        taskManager.toggleTask(taskId);
        treeProvider.refresh();

        const updatedRootItems = await treeProvider.getChildren();
        const updatedTaskItems = await treeProvider.getChildren(updatedRootItems[0]);
        const updatedIcon = (updatedTaskItems[0].iconPath as vscode.ThemeIcon).id;
        assert.strictEqual(updatedIcon, 'check');
    });
});
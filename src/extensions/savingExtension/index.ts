import { ExtensionHostKind, registerExtension } from 'vscode/extensions';
import { MenuRegistry, MenuId, ContextKeyExpr } from 'vscode/monaco';

const { getApi } = registerExtension({
    name: 'savingExtension',
    version: '0.0.1',
    publisher: 'omega365',
    engines: {
        vscode: "*"
    }
}, ExtensionHostKind.LocalProcess, {
    system: true
});

void getApi().then(async vscode => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return;
    }
    
    overrideMenu();
    
    vscode.commands.registerCommand("omega365.save", async (pEvent) => {
        console.log("save", pEvent);
    });
    
    vscode.commands.registerCommand("omega365.saveAll", async (pEvent) => {
        console.log("saveAll", pEvent);
    });
})

function overrideMenu() {
    const saveActions = MenuRegistry.getMenuItems(MenuId.MenubarFileMenu)
        .filter(item => item.group === "4_save");
    console.log(saveActions);
    
    for (const action of saveActions) {
        if ("command" in action && action.command) {
            if (action.command.id === "workbench.action.files.saveAs") {
                action.when = ContextKeyExpr.false();
            } else if (action.command.id === "workbench.action.files.save") {
                action.command.id = "omega365.save";
            } else if (action.command.id === "workbench.action.files.saveAll") {
                action.command.id = "omega365.saveAll";
            }
        }
    }
    
    const autosaveAction = MenuRegistry.getMenuItems(MenuId.MenubarFileMenu)
        .find(item => item.group === "5_autosave");
    
    if (autosaveAction) {
        autosaveAction.when = ContextKeyExpr.false();
    }
}
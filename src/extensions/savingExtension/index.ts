import { ExtensionHostKind, registerExtension } from 'vscode/extensions';
//import FunctionBroadcastChannel from "../../tools/functionBroadcastChannel.ts";
import { MenuRegistry, MenuId } from 'vscode/monaco';

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
})

function overrideMenu() {
    MenuRegistry.getMenuItems(MenuId.MenubarFileMenu).forEach(item => {
        console.log(item);
    })
}
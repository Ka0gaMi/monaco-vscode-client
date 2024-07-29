import Omega365IDE from "./client.ts";
import FunctionBroadcastChannel from "./tools/functionBroadcastChannel.ts";

const vscode = Omega365IDE.Vscode;

const workspaceUri = vscode.Uri.file("/workspace.code-workspace")

const omega365IDE = new Omega365IDE({
    constructOptions: {
        enableWorkspaceTrust: false,
        windowIndicator: {
            label: 'o365-ide',
            tooltip: '',
            command: ''
        },
        workspaceProvider: {
            trusted: true,
            async open() {
                return false;
            },
            workspace: {
                workspaceUri: workspaceUri
            }
        },
        configurationDefaults: {
            // eslint-disable-next-line no-template-curly-in-string
            'window.title': 'o365-ide${separator}${dirty}${activeEditorShort}'
        },
        defaultLayout: {
            layout: {
                editors: {
                    orientation: 0,
                    groups: [{ size: 1 }]
                }
            }
        },
        productConfiguration: {
            nameShort: 'o365-ide',
            nameLong: 'o365-ide',
        }
    }
});

// @ts-ignore
const broadcast = new FunctionBroadcastChannel({
    id: 'Omega365-vscode-wrapper',
    functions: {
        "getTypesFlat": async (value) => {
            try {
                const res = await fetch(`https://data.jsdelivr.com/v1/package/npm/${value}@3.4.34/flat`)
                if (res.status === 200) {
                    return await res.json();
                }
            } catch (e) {
                return JSON.stringify({})
            }
        },
        "getTypes": async (value) => {
            try {
                const res = await fetch(`https://cdn.jsdelivr.net/npm/${value}`);
                if (res.status === 200) {
                    return await res.text();
                }
                return "";
            } catch {
                return "";
            }
        }
    }
});

omega365IDE.initialize(document.getElementById("app")!).then(async () => {
    omega365IDE.registerFileSystemOverlay(1);

    const projectUri = vscode.Uri.file('/project');
    
    await omega365IDE.reinitializeWorkspace({
        id: 'project-test',
        uri: projectUri
    });

    omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/project/src/test.ts"), "console.log('Hello World!')"));
    omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/project/tsconfig.json"), "{\n" +
        "  \"compilerOptions\": {\n" +
        "    \"lib\": [\n" +
        "      \"ES2020\",\n" +
        "      \"DOM\"\n" +
        "    ],\n" +
        "    \"target\": \"ES2020\",\n" +
        "    \"module\": \"ESNext\",\n" +
        "    \"moduleResolution\": \"Bundler\",\n" +
        "    \"allowImportingTsExtensions\": true,\n" +
        "    \"allowArbitraryExtensions\": true,\n" +
        "    \"verbatimModuleSyntax\": true,\n" +
        "    \"noUnusedParameters\": true,\n" +
        "    \"esModuleInterop\": true,\n" +
        "    \"noUnusedLocals\": true,\n" +
        "    \"skipLibCheck\": true,\n" +
        "    \"noEmit\": true,\n" +
        "    \"strict\": true\n" +
        "  },\n" +
        "  \"include\": [\n" +
        "    \"src\",\n" +
        "    \"node_modules/**/*.d.ts\"\n" +
        "  ],\n" +
        "  \"exclude\": []\n" +
        "}"));

    // omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(workspaceUri, JSON.stringify({
    //     folders: [{
    //         path: `/project`
    //     }]
    // }, null, 2)))
});

// @ts-ignore
window["vscode"] = vscode;

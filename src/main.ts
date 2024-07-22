import Omega365IDE from "./client.ts";

const vscode = Omega365IDE.Vscode;

const workspaceUri = vscode.Uri.file('/Omega365/project');

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
                workspaceUri: workspaceUri,
                label: 'TestLabel',
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

omega365IDE.initialize(document.getElementById("app")!).then(async () => {
    omega365IDE.registerFileSystemOverlay(1);
    
    await omega365IDE.reinitializeWorkspace({
        id: 'project-test',
        uri: workspaceUri,
    });

    omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/Omega365/project/src/test.ts"), "console.log('Hello World!')"));
    omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/Omega365/project/tsconfig.json"), "{\n" +
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
        "    \"src\"\n" +
        "    \"node_modules/**/*.d.ts\"\n" +
        "  ],\n" +
        "  ],\n" +
        "  \"exclude\": []\n" +
        "}"));
});

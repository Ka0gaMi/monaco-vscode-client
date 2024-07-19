import Omega365IDE from "./client.ts";

const monaco = Omega365IDE.Monaco;
const vscode = Omega365IDE.Vscode;


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
                window.open(window.location.href)
                return true
            },
            workspace: {
                // workspaceUri: workspaceFile
                workspaceUri: monaco.Uri.file('/workspace.code-workspace')
            }
        },
        configurationDefaults: {
            // eslint-disable-next-line no-template-curly-in-string
            'window.title': 'o365-ide${separator}${dirty}${activeEditorShort}'
        },
        defaultLayout: {
            // editors: [{
            //     uri: monaco.Uri.file('/workspace/test.js'),
            //     viewColumn: 1
            // }, {
            //     uri: monaco.Uri.file('/workspace/test.md'),
            //     viewColumn: 2
            // }],
            layout: {
                editors: {
                    orientation: 0,
                    groups: [{ size: 1 }, { size: 1 }]
                }
            },
            // views: [{
            //     id: 'custom-view'
            // }]
        },
        productConfiguration: {
            nameShort: 'o365-ide',
            nameLong: 'o365-ide',
            // extensionsGallery: {
            //     serviceUrl: 'https://open-vsx.org/vscode/gallery',
            //     itemUrl: 'https://open-vsx.org/vscode/item',
            //     resourceUrlTemplate: 'https://open-vsx.org/vscode/unpkg/{publisher}/{name}/{version}/{path}',
            //     controlUrl: '',
            //     nlsBaseUrl: '',
            //     publisherUrl: ''
            // }
        }
    }
});

omega365IDE.initialize(document.getElementById("app")!);
omega365IDE.registerFileSystemOverlay(1);

omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/workspace/test.ts"), "console.log('Hello World!')"));
omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(vscode.Uri.file("/workspace/tsconfig.json"), "{\n" +
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
    "  ],\n" +
    "  \"exclude\": [\n" +
    "    \"node_modules\"\n" +
    "  ]\n" +
    "}"));

omega365IDE.fileSystemProvider.registerFile(new Omega365IDE.RegisteredMemoryFile(monaco.Uri.file('/workspace.code-workspace'), JSON.stringify({
    folders: [{
        path: `/workspace`
    }]
}, null, 2)))

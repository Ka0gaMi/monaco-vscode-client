import { RegisteredFileSystemProvider, RegisteredMemoryFile, RegisteredReadOnlyFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override';
import { IWorkbenchConstructionOptions, IEditorOverrideServices, StandaloneServices } from 'vscode/services';
import { ExtensionHostKind, registerExtension } from 'vscode/extensions';
import getConfigurationServiceOverride, { initUserConfiguration, reinitializeWorkspace } from '@codingame/monaco-vscode-configuration-service-override'
import getKeybindingsServiceOverride, { initUserKeybindings } from '@codingame/monaco-vscode-keybindings-service-override'
import { EnvironmentOverride } from 'vscode/workbench';
import { workerConfig } from './tools/extHostWorker';
import { IStorageService, IWorkbenchLayoutService, getService, initialize as initializeMonacoService, createInstance } from 'vscode/services';
import './externalExtensions/volar-2.0.26.vsix';
import './externalExtensions/vscode-typescript-web-0.1.2.vsix';

/*
*   Service Overrides
*/
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override';
import getNotificationServiceOverride from '@codingame/monaco-vscode-notifications-service-override';
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getScmServiceOverride from '@codingame/monaco-vscode-scm-service-override';
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override';
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override';
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override';
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override';
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override';
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override';
import getMarkersServiceOverride from '@codingame/monaco-vscode-markers-service-override';
import getLanguageDetectionWorkerServiceOverride from '@codingame/monaco-vscode-language-detection-worker-service-override';
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getWorkspaceTrustOverride from '@codingame/monaco-vscode-workspace-trust-service-override';
import getLogServiceOverride from '@codingame/monaco-vscode-log-service-override';
import getWorkingCopyServiceOverride from '@codingame/monaco-vscode-working-copy-service-override';
import getChatServiceOverride from '@codingame/monaco-vscode-chat-service-override';
import getUserDataSyncServiceOverride from '@codingame/monaco-vscode-user-data-sync-service-override';
import getUserDataProfileServiceOverride from '@codingame/monaco-vscode-user-data-profile-service-override';
import getAiServiceOverride from '@codingame/monaco-vscode-ai-service-override';
import getOutlineServiceOverride from '@codingame/monaco-vscode-outline-service-override';
import getTimelineServiceOverride from '@codingame/monaco-vscode-timeline-service-override';
import getCommentsServiceOverride from '@codingame/monaco-vscode-comments-service-override';
import getEditSessionsServiceOverride from '@codingame/monaco-vscode-edit-sessions-service-override';
import getEmmetServiceOverride from '@codingame/monaco-vscode-emmet-service-override';
import getMultiDiffEditorServiceOverride from '@codingame/monaco-vscode-multi-diff-editor-service-override';
import getPerformanceServiceOverride from '@codingame/monaco-vscode-performance-service-override';
import getRelauncherServiceOverride from '@codingame/monaco-vscode-relauncher-service-override';
import getUpdateServiceOverride from '@codingame/monaco-vscode-update-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getWorkbenchServiceOverride, { Parts } from '@codingame/monaco-vscode-workbench-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'

import defaultKeybindings from './user/keybindings.json?raw';
import defaultConfiguration from './user/configuration.json?raw';
import * as monaco from 'monaco-editor'
import * as vscode from "vscode";
import { BrowserStorageService } from '@codingame/monaco-vscode-storage-service-override'

export type WorkerLoader = () => Worker

export default class Omega365IDE {
    static get Monaco(): typeof monaco {
        return monaco;
    }
    static get Vscode(): typeof vscode {
        return vscode;
    }
    static get StandaloneServices(): typeof StandaloneServices{
        return StandaloneServices;
    }
    static get VscodeWorkbenchServiceOverride() {
        // @ts-ignore
        return { Parts: Parts };
    }
    static get BrowserStorageService() {
        return BrowserStorageService;
    }
    static get RegisteredMemoryFile() {
        return RegisteredMemoryFile;
    }
    static get RegisteredReadOnlyFile() {
        return RegisteredReadOnlyFile;
    }
    private _fileSystemProvider: RegisteredFileSystemProvider = new RegisteredFileSystemProvider(false);
    private static _workerLoaders: Partial<Record<string, WorkerLoader>> = {
        editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
        textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
        languageDetectionWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
        localFileSearchWorker: () => new Worker(new URL('@codingame/monaco-vscode-search-service-override/worker', import.meta.url), { type: 'module' })
    };
    private _keybindings: any = defaultKeybindings;
    private _configuration: any = defaultConfiguration;
    private _constructOptions: IWorkbenchConstructionOptions;
    private _envOptions: EnvironmentOverride = {
        userHome: vscode.Uri.file('/Omega365/project')
    }
    private _defaultServices: IEditorOverrideServices = {
        ...getLogServiceOverride(),
        ...getExtensionServiceOverride(workerConfig),
        ...getModelServiceOverride(),
        ...getNotificationServiceOverride(),
        ...getDialogsServiceOverride(),
        ...getConfigurationServiceOverride(),
        ...getKeybindingsServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getThemeServiceOverride(),
        ...getLanguagesServiceOverride(),
        ...getPreferencesServiceOverride(),
        ...getOutlineServiceOverride(),
        ...getTimelineServiceOverride(),
        ...getBannerServiceOverride(),
        ...getStatusBarServiceOverride(),
        ...getTitleBarServiceOverride(),
        ...getSnippetServiceOverride(),
        ...getSearchServiceOverride(),
        ...getMarkersServiceOverride(),
        ...getLanguageDetectionWorkerServiceOverride(),
        ...getStorageServiceOverride({
            fallbackOverride: {
                'workbench.activity.showAccounts': false
            }
        }),
        ...getLifecycleServiceOverride(),
        ...getEnvironmentServiceOverride(),
        ...getWorkspaceTrustOverride(),
        ...getWorkingCopyServiceOverride(),
        ...getScmServiceOverride(),
        ...getChatServiceOverride(),
        ...getUserDataProfileServiceOverride(),
        ...getUserDataSyncServiceOverride(),
        ...getAiServiceOverride(),
        ...getCommentsServiceOverride(),
        ...getEditSessionsServiceOverride(),
        ...getEmmetServiceOverride(),
        ...getMultiDiffEditorServiceOverride(),
        ...getPerformanceServiceOverride(),
        ...getRelauncherServiceOverride(),
        ...getUpdateServiceOverride(),
        ...getExplorerServiceOverride(),
        ...getWorkbenchServiceOverride(),
        ...getQuickAccessServiceOverride({
            isKeybindingConfigurationVisible: () => true,
            shouldUseGlobalPicker: (_editor) => true
        })
    }

    private static _serviceOverrideFunctions: Record<string, Function> = {
        'getLogServiceOverride': getLogServiceOverride,
        'getExtensionServiceOverride': getExtensionServiceOverride,
        'getModelServiceOverride': getModelServiceOverride,
        'getNotificationServiceOverride': getNotificationServiceOverride,
        'getDialogsServiceOverride': getDialogsServiceOverride,
        'getConfigurationServiceOverride': getConfigurationServiceOverride,
        'getKeybindingsServiceOverride': getKeybindingsServiceOverride,
        'getTextmateServiceOverride': getTextmateServiceOverride,
        'getThemeServiceOverride': getThemeServiceOverride,
        'getLanguagesServiceOverride': getLanguagesServiceOverride,
        'getPreferencesServiceOverride': getPreferencesServiceOverride,
        'getOutlineServiceOverride': getOutlineServiceOverride,
        'getTimelineServiceOverride': getTimelineServiceOverride,
        'getBannerServiceOverride': getBannerServiceOverride,
        'getStatusBarServiceOverride': getStatusBarServiceOverride,
        'getTitleBarServiceOverride': getTitleBarServiceOverride,
        'getSnippetServiceOverride': getSnippetServiceOverride,
        'getSearchServiceOverride': getSearchServiceOverride,
        'getMarkersServiceOverride': getMarkersServiceOverride,
        'getLanguageDetectionWorkerServiceOverride': getLanguageDetectionWorkerServiceOverride,
        'getStorageServiceOverride': getStorageServiceOverride,
        'getLifecycleServiceOverride': getLifecycleServiceOverride,
        'getEnvironmentServiceOverride': getEnvironmentServiceOverride,
        'getWorkspaceTrustOverride': getWorkspaceTrustOverride,
        'getWorkingCopyServiceOverride': getWorkingCopyServiceOverride,
        'getScmServiceOverride': getScmServiceOverride,
        'getChatServiceOverride': getChatServiceOverride,
        'getUserDataProfileServiceOverride': getUserDataProfileServiceOverride,
        'getUserDataSyncServiceOverride': getUserDataSyncServiceOverride,
        'getAiServiceOverride': getAiServiceOverride,
        'getCommentsServiceOverride': getCommentsServiceOverride,
        'getEditSessionsServiceOverride': getEditSessionsServiceOverride,
        'getEmmetServiceOverride': getEmmetServiceOverride,
        'getMultiDiffEditorServiceOverride': getMultiDiffEditorServiceOverride,
        'getPerformanceServiceOverride': getPerformanceServiceOverride,
        'getRelauncherServiceOverride': getRelauncherServiceOverride,
        'getUpdateServiceOverride': getUpdateServiceOverride,
        'getExplorerServiceOverride': getExplorerServiceOverride,
        'getWorkbenchServiceOverride': getWorkbenchServiceOverride,
        'getQuickAccessServiceOverride': getQuickAccessServiceOverride
    }

    get fileSystemProvider(): RegisteredFileSystemProvider {
        return this._fileSystemProvider;
    }

    get keybindings(): any {
        return this._keybindings;
    }

    set keybindings(value: any) {
        this._keybindings = value;
    }

    get configuration(): any {
        return this._configuration;
    }

    set configuration(value: any) {
        this._configuration = value;
    }

    get constructOptions(): IWorkbenchConstructionOptions {
        return this._constructOptions;
    }

    set constructOptions(value: IWorkbenchConstructionOptions) {
        this._constructOptions = value;
    }

    get envOptions(): EnvironmentOverride {
        return this._envOptions;
    }

    set envOptions(value: EnvironmentOverride) {
        this._envOptions = value;
    }

    get defaultServices(): IEditorOverrideServices {
        return this._defaultServices;
    }

    set defaultServices(value: IEditorOverrideServices) {
        this._defaultServices = value;
    }

    constructor(pOptions: {
        keybindings?: string,
        configuration?: string,
        constructOptions: IWorkbenchConstructionOptions,
        envOptions?: EnvironmentOverride
    }) {
        if (pOptions.keybindings != undefined) {
            this._keybindings = pOptions.keybindings;
        }
        if (pOptions.configuration != undefined) {
            this._configuration = pOptions.configuration;
        }
        if (pOptions.constructOptions == undefined) {
            throw new Error('constructOptions is required');
        }
        this._constructOptions = pOptions.constructOptions;
        if (pOptions.envOptions != undefined) {
            this._envOptions = pOptions.envOptions;
        }
    }

    async initialize(container: HTMLElement, overrides?: IEditorOverrideServices): Promise<void> {
        await Promise.all([
            import('vscode/localExtensionHost'),
            import('@codingame/monaco-vscode-csharp-default-extension'),
            import('@codingame/monaco-vscode-css-default-extension'),
            import('@codingame/monaco-vscode-diff-default-extension'),
            import('@codingame/monaco-vscode-html-default-extension'),
            import('@codingame/monaco-vscode-javascript-default-extension'),
            import('@codingame/monaco-vscode-json-default-extension'),
            import('@codingame/monaco-vscode-markdown-basics-default-extension'),
            import('@codingame/monaco-vscode-scss-default-extension'),
            import('@codingame/monaco-vscode-sql-default-extension'),
            import('@codingame/monaco-vscode-typescript-basics-default-extension'),
            import('@codingame/monaco-vscode-xml-default-extension'),
            import('@codingame/monaco-vscode-yaml-default-extension'),
            import('@codingame/monaco-vscode-theme-defaults-default-extension'),
            import('@codingame/monaco-vscode-theme-seti-default-extension'),
            import('@codingame/monaco-vscode-references-view-default-extension'),
            import('@codingame/monaco-vscode-search-result-default-extension'),
            import('@codingame/monaco-vscode-configuration-editing-default-extension'),
            import('@codingame/monaco-vscode-json-language-features-default-extension'),
            import('@codingame/monaco-vscode-html-language-features-default-extension'),
            import('@codingame/monaco-vscode-css-language-features-default-extension'),
            import('@codingame/monaco-vscode-markdown-language-features-default-extension'),
            import('@codingame/monaco-vscode-typescript-language-features-default-extension'),
            import('@codingame/monaco-vscode-emmet-default-extension'),
            initUserConfiguration(this._configuration),
            initUserKeybindings(this._keybindings)
        ]);

        window.MonacoEnvironment = {
            getWorker: function (moduleId, label) {
                const workerFactory = Omega365IDE._workerLoaders[label]
                if (workerFactory != null) {
                    return workerFactory()
                }
                throw new Error(`Unimplemented worker ${label} (${moduleId})`)
            }
        }

        const overrideObject: IEditorOverrideServices = overrides ?? {
            ...this._defaultServices
        };

        await initializeMonacoService(overrideObject, container, this._constructOptions, this._envOptions);
    }

    registerExtension(config: {
        name: string,
        publisher?: string,
        version?: string
    }, kind: ExtensionHostKind = ExtensionHostKind.LocalProcess): {
        getApi(): Promise<typeof import("vscode")>;
        setAsDefaultApi(): Promise<void>;
    } {
        // @ts-ignore
        return registerExtension({
            name: config.name,
            publisher: config.publisher ?? 'omega365',
            version: config.version ?? '1.0.0',
            engines: {
                vscode: '*'
            }
        }, kind);
    }

    async createCustomEditorInput(editorClass: any, options?: any): Promise<any> {
        return await createInstance(editorClass, options);
    }

    async getLayoutService(): Promise<IWorkbenchLayoutService> {
        return await getService(IWorkbenchLayoutService);
    }

    async clearStorage(): Promise<void> {
        await (await getService(IStorageService) as BrowserStorageService).clear();
    }

    getServiceOverrideFunction(name: string): Function | undefined {
        return Omega365IDE._serviceOverrideFunctions[name];
    }

    registerFileSystemOverlay(priority: number) {
        registerFileSystemOverlay(priority, this._fileSystemProvider);
    }

    async reinitializeWorkspace(pOptions: {
        id: string,
        uri: vscode.Uri,
        configUri?: vscode.Uri
    }) {
        await reinitializeWorkspace({
            id: pOptions.id,
            uri: pOptions.uri,
            configPath: pOptions.configUri
        })
    }
}

Omega365IDE.Vscode
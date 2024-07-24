import { InMemoryFileSystemProvider } from '@codingame/monaco-vscode-files-service-override';
import { Uri as URI } from 'vscode';

class CustomFileSystem extends InMemoryFileSystemProvider {
    constructor() {
        super();
    }

    async registerFile(uri: URI, content: string) {
        await this.writeFile(uri, new TextEncoder().encode(content), {
            create: true,
            overwrite: true,
            unlock: true,
            atomic: false
        });
    }

    async registerReadOnlyFile(uri: URI, content: string) {
        await this.writeFile(uri, new TextEncoder().encode(content), {
            create: true,
            overwrite: true,
            unlock: false,
            atomic: false
        });
    }
}

export default CustomFileSystem;
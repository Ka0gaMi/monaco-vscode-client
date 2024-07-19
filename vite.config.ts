import { defineConfig } from "vite";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";
import vsixPlugin from "@codingame/monaco-vscode-rollup-vsix-plugin";
import * as fs from "fs";
import path from "path";

const filesToRemove = ["diagnosticMessages", "demo-", "debug-and-run", "create-a-js-file", "install-node-js", "learn-more"];
const filesToChange = ['webWorkerExtensionHostIframe', 'extensionHost'];

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (filesToRemove.some(file => assetInfo.name?.includes(file))) {
            return "todelete/[name]-[hash][extname]"
          } else if (filesToChange.some(file => assetInfo.name?.includes(file))) {
            return "assets/[name][extname]"
          } else if (assetInfo.name?.includes("main")) {
            console.log(assetInfo);
            return "[name][extname]"
          }
          return "assets/[name]-[hash][extname]"
        },
        entryFileNames: "assets/o365-main.js",
      },
      preserveEntrySignatures: "strict"
    }
  },
  worker: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]"
      }
    }
  },
  base: "./",
  plugins: [
    vsixPlugin(),
    {
      // For the *-language-features extensions which use SharedArrayBuffer
      name: "configure-response-headers",
      apply: "serve",
      configureServer: server => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "credentialless")
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
          next()
        })
      }
    },
    {
      name: "force-prevent-transform-assets",
      apply: "serve",
      configureServer (server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.originalUrl != null) {
              const pathname = new URL(req.originalUrl, import.meta.url).pathname
              if (pathname.endsWith(".html")) {
                res.setHeader("Content-Type", "text/html")
                res.writeHead(200)
                res.write(fs.readFileSync(path.join(__dirname, pathname)))
                res.end()
              }
            }

            next()
          })
        }
      }
    }
  ],
  optimizeDeps: {
    include: [
      "vscode/extensions", "vscode/services", "vscode/monaco", "vscode/localExtensionHost",
      "vscode-textmate", "vscode-oniguruma", "@vscode/vscode-languagedetection"
    ],
    exclude: [],
    esbuildOptions: {
      tsconfig: "./tsconfig.json",
      plugins: [importMetaUrlPlugin]
    }
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    fs: {
      allow: ["../"] // allow to load codicon.ttf from monaco-editor in the parent folder
    }
  },
  define: {
    rootDirectory: JSON.stringify(__dirname)
  },
  resolve: {
    dedupe: ["vscode"]
  }
})

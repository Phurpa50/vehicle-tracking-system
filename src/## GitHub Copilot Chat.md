## GitHub Copilot Chat

- Extension: 0.48.1 (prod)
- VS Code: 1.120.0 (0958016b2af9f09bb4257e0df4a95e2f90590f9f)
- OS: win32 10.0.26200 x64
- GitHub Account: Phurpa50

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: Error (24 ms): getaddrinfo EAI_AGAIN api.github.com
- DNS ipv6 Lookup: Error (4 ms): getaddrinfo EAI_AGAIN api.github.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): Error (35 ms): Error: net::ERR_NAME_NOT_RESOLVED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (20 ms): Error: getaddrinfo EAI_AGAIN api.github.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (40 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async n._fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
	at async n.fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
	at async u (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
	at async Ig._executeContributedCommand (file:///c:/Users/Dell/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: getaddrinfo EAI_AGAIN api.github.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: Error (7 ms): getaddrinfo EAI_AGAIN api.githubcopilot.com
- DNS ipv6 Lookup: Error (17 ms): getaddrinfo EAI_AGAIN api.githubcopilot.com
- Proxy URL: None (4 ms)
- Electron fetch (configured): Error (46 ms): Error: net::ERR_NAME_NOT_RESOLVED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (23 ms): Error: getaddrinfo EAI_AGAIN api.githubcopilot.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (29 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async n._fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
	at async n.fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
	at async u (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
	at async Ig._executeContributedCommand (file:///c:/Users/Dell/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: getaddrinfo EAI_AGAIN api.githubcopilot.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: Error (264 ms): getaddrinfo EAI_AGAIN copilot-proxy.githubusercontent.com
- DNS ipv6 Lookup: Error (142 ms): getaddrinfo EAI_AGAIN copilot-proxy.githubusercontent.com
- Proxy URL: None (2 ms)
- Electron fetch (configured): Error (34 ms): Error: net::ERR_NAME_NOT_RESOLVED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (17 ms): Error: getaddrinfo EAI_AGAIN copilot-proxy.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (22 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async n._fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
	at async n.fetch (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
	at async u (c:\Users\Dell\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
	at async Ig._executeContributedCommand (file:///c:/Users/Dell/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: getaddrinfo EAI_AGAIN copilot-proxy.githubusercontent.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (2949 ms)
Connecting to https://dc.services.visualstudio.com: Error (34 ms): Error: net::ERR_NAME_NOT_RESOLVED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (18 ms): Error: getaddrinfo EAI_AGAIN copilot-telemetry.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (12 ms): Error: getaddrinfo EAI_AGAIN copilot-telemetry.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://default.exp-tas.com: Error (19 ms): Error: getaddrinfo EAI_AGAIN default.exp-tas.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Number of system certificates: 107

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
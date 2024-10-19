import { defineConfig } from 'wxt'

export default defineConfig({
  manifest: {
    permissions: [
      'activeTab',
      'scripting',
      'storage'
    ],
    host_permissions: [
      'https://*.linkedin.com/*'
    ]
  },
  vite: (env) => ({
    build: {
      target: 'esnext'
    }
  })
})

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    }
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true
    }
  },
  outputDir: 'docs',
  publicPath: '/',
  // devServer: {
  //   port: 8080,
  //   client: {
  //     webSocketURL: 'ws://0.0.0.0:8080/ws',
  //   },
  //   allowedHosts: 'all',
  // },
}
)
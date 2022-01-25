const { addBeforeLoader, loaderByName } = require('@craco/craco')

module.exports = {
    webpack: {
        configure: webpackConfig => {
            webpackConfig.optimization.splitChunks = {
                cacheGroups: {
                    default: false,
                },
            }
            webpackConfig.optimization.runtimeChunk = false
            const wasmExtensionRegExp = /\.wasm$/
            webpackConfig.resolve.extensions.push('.wasm')

            webpackConfig.module.rules.forEach(rule => {
                ;(rule.oneOf || []).forEach(oneOf => {
                    if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
                        oneOf.exclude.push(wasmExtensionRegExp)
                    }
                })
            })

            const wasmLoader = {
                test: /\.wasm$/,
                include: /node_modules\/(bridge|token-bridge)/,
                loaders: ['wasm-loader'],
            }

            addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader)

            return webpackConfig
        },
    },
}

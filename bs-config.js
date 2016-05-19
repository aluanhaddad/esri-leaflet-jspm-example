var options = {
    port: 3000
}

/**
 * Compatible with Browsersync and wrappers such as lite server.
 *
 */
module.exports = {
    port: options.port,
    injectChanges: true,
    files: ["**/*.{html,ts,js,css}"],
    server: {
        baseDir: options.baseDir,
        proxy: {
            target: "localhost:" + options.port,
            proxyRes: [function (proxyRes) {
                if (proxyRes.req.path.match(/jspm_packages/)) {
                    proxyRes.headers["cache-control"] = "max-age=604800, public";
                }
            }]
        },
    },
    watchOptions: {
        ignored: [
            "node_modules",
            "jspm_packages",
            "lib"
        ]
    }
};
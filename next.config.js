module.exports = {
    rewrites: () => [
        {
            source: "/:path*",
            destination: "/api/:path*",
        },
    ],
};
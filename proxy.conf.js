module.exports = [
  {
    context: [
      "/api/userservice",
      "/api/validate",
    ],
    target: "http://localhost:5001",
    secure: false,
    "pathRewrite": {
      "^/api": ""
    },
  },
];
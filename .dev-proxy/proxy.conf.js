module.exports = [
  {
    context: [
      "/userservice",
      "/validate",
    ],
    target: "http://127.0.0.1:5000",
    secure: false
  },
]

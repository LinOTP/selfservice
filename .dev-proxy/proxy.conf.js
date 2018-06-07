module.exports = [
  {
    context: [
      "/userservice",
      "/validate",
    ],
    target: "http://localhost:5000",
    secure: false
  },
]

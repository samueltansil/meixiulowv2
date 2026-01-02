module.exports = {
  apps: [
    {
      name: "meixiulow",
      script: "server/dist/index.cjs",
      env_file: ".env"
    }
  ]
};

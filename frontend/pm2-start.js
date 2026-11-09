process.env.PORT = process.env.PORT || "3002";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { execSync } = require("child_process");
execSync("node node_modules/.bin/next start", {
  stdio: "inherit",
  cwd: __dirname,
});

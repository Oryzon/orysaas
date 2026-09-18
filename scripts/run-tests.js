#!/usr/bin/env node

// npm test: start the test db, run the core suite, always tear the db back
// down. Plain Node so it behaves the same on macOS/Linux/Windows.

const { spawnSync } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

function run(command, args) {
    const result = spawnSync(command, args, { stdio: "inherit", cwd: repoRoot, shell: true });

    if (result.error) {
        throw result.error;
    }

    return result.status ?? 1;
}

console.log("> Starting test database...");
const dbUpCode = run("docker", ["compose", "-f", "docker-compose.test.yml", "up", "-d", "--wait"]);

if (dbUpCode !== 0) {
    console.error("Failed to start the test database. Is Docker running?");
    process.exit(dbUpCode);
}

let testCode = 1;

try {
    testCode = run("npm", ["--workspace", "core", "run", "test"]);
} finally {
    console.log("> Stopping test database...");
    run("docker", ["compose", "-f", "docker-compose.test.yml", "down"]);
}

process.exit(testCode);

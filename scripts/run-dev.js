const { spawn } = require('child_process');
const path = require('path');

// Run Vite in the frontend directory
const frontendDir = path.resolve(__dirname, '../frontend');
console.log('Starting HealthSync Frontend Dev Server...');

const vite = spawn('npx.cmd', ['vite'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

vite.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
});

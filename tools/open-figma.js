#!/usr/bin/env node

const FIGMA_URL = 'https://www.figma.com/design/LYdQCJSC4e6tetqSM9vio6/Modernize---Figma%E2%80%99s-Most-Trending-Powerful-UI-Kit-Design-System-Library---Design-Starter-Kit--Community-?node-id=0-1&t=9TT6wOblDVanfWXo-1';

const openUrl = () => {
  const { spawn } = require('node:child_process');
  const platform = process.platform;

  let command;
  let args;

  if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '""', FIGMA_URL];
  } else if (platform === 'darwin') {
    command = 'open';
    args = [FIGMA_URL];
  } else {
    command = 'xdg-open';
    args = [FIGMA_URL];
  }

  const child = spawn(command, args, { stdio: 'ignore', detached: true });
  child.unref();
  console.log(`Opened Figma URL:\n${FIGMA_URL}`);
};

openUrl();

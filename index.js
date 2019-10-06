#!/usr/bin/env node

const argv = require('yargs').argv;
const app = require('express')();
const { exec } = require('child_process');

const { PORT = '4242', HOST = '0.0.0.0' } = process.env;

const handler = cmd => (req, res, next) => {
  exec(cmd, (error, stdout, stderr) => {
    if (error)
      res.status(500);

    res.json({ error, stdout, stderr });
  });
};

const commands = argv._
  .reduce((arr, arg, n) => {
    if (n % 2 === 0) arr.push([arg]);
    else arr[arr.length - 1].push(arg);
    return arr;
  }, [])
  .reduce((obj, pair) => ({ ...obj, [pair[0]]: pair[1] }), {});

const len = Math.min(80, Math.max(...Object.keys(commands).map(s => s.length)));
Object.entries(commands).map(([path, cmd]) => {
  console.log(path.padEnd(len), cmd);
  app.post(path, handler(cmd));
});


app.listen(PORT, HOST, () => {
  console.log(`server started on ${HOST}:${PORT}`);
});

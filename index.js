#!/usr/bin/env node

const argv = require('yargs').argv;
const app = require('express')();
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const { PORT = '4242', HOST = '0.0.0.0' } = process.env;

const handler = cmd => (req, res) => {
  const stdout = [];
  const stderr = [];

  const child = spawn('bash', ['-c', cmd]);

  child.stdout.on('data', data => stdout.push(data));
  child.stderr.on('data', data => stderr.push(data));

  if (req.body) {
    child.stdin.setEncoding('utf-8');
    child.stdin.write(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    child.stdin.end();
  }

  child.on('close', (code) => {
    let out = stdout.join('');
    let err = stderr.join('');

    try { out = JSON.parse(out); } catch (e) {}
    try { err = JSON.parse(err); } catch (e) {}

    if (err)
      console.error(err);

    res.status(code === 0 ? 200 : 500);
    res.json({ stdout: out, stderr: err });
  });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

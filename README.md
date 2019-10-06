*ep2cmd*

TL; DR: this tool creates an express server listening for HTTP requests to
execute shels commands (_endpoints to commands_).

*Installation:*

```sh
42sh$ yarn add -D https://github.com/nilscox/ep2cmd.git
```

*Usage:*

```
42sh$ ep2cmd /reset_db "yarn db:reset" /restart_api "kill -USR1 $API_PID"
```

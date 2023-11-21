查看所有进程状态

bash
Copy code
`npx pm2 list`
或者

bash
Copy code
`npx pm2 status`
查看特定进程的日志

bash
Copy code
`npx pm2 logs [应用名称或ID]`
查看进程详细信息

bash
Copy code
`npx pm2 show [应用名称或ID]`
或者

bash
Copy code
`npx pm2 info [应用名称或ID]`
监控 CPU 和内存使用情况

bash
Copy code
`npx pm2 monit`
重启、停止和删除进程

重启：

bash
Copy code
`npx pm2 restart [应用名称或ID]`

停止：

bash
Copy code
`npx pm2 stop [应用名称或ID]`

删除：

bash
Copy code
`npx pm2 delete [应用名称或ID]`


配置corn schedule:

 分钟 (0 - 59)
 小时 (0 - 23)
 日期 (1 - 31)
 月份 (1 - 12)
 星期几 (0 - 7，其中 0 和 7 都表示星期日)
 example : "0 0,12 * * *" = 每12小时
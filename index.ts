import fs from 'fs';
import pm2 from 'pm2';
import { scheduleJob } from 'node-schedule';

// 读取配置文件
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// 启动 PM2 管理的部署进程
config.app.forEach((app: any) => {
    pm2.connect(err => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.start({
            script: 'deploy.ts', // 部署脚本路径
            name: app.name, // 使用配置中的应用名称
            args: [JSON.stringify(app)], // 将应用配置作为参数传递
            exec_mode: 'fork',
            max_memory_restart: '100M'
        }, err => {
            if (err) return console.error('Error while launching applications', err.stack || err);
            console.log(`PM2 and application has been succesfully started`);

            // 定时任务
            scheduleJob(app.schedule, () => {
                // 这里可以发送指令给 PM2 进程执行更新部署
                console.log(`Time to update ${app.name}`);
            });

            pm2.disconnect(); // Disconnects from PM2
        });
    });
});
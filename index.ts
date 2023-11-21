import fs from 'fs';
import pm2 from 'pm2';
import { scheduleJob } from 'node-schedule';

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// 启动 PM2 管理的部署进程
config.app.forEach((app: any) => {
    pm2.connect(err => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.start({
          script: 'deploy.ts',
          name: app.name,
          args: [JSON.stringify(app)],
          exec_mode: 'fork',
          max_memory_restart: '600M',
          interpreter: './node_modules/.bin/ts-node'
        }, err => {
            if (err) return console.error('Error while launching applications', err.stack || err);
            console.log(`PM2 and application has been successfully started`);

            // 设置定时任务
            scheduleJob(app.schedule, () => {
                console.log(`Scheduled update for ${app.name}`);

                // 重启应用以执行部署
                pm2.restart(app.name, err => {
                    if (err) console.error(`Error while restarting app ${app.name}`, err.stack || err);
                    else console.log(`Successfully restarted app ${app.name}`);
                });
            });
        });
    });
});

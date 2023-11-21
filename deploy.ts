import SimpleGit from 'simple-git';
import { NodeSSH } from 'node-ssh';
import { exec ,ExecOptions} from 'child_process';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf'; // 用于删除目录

// 将传递给脚本的参数解析为应用配置对象
const appConfig = JSON.parse(process.argv[2]);

async function deployApp() {
    const git = SimpleGit();
    const ssh = new NodeSSH();
    const repoPath = `/tmp/${appConfig.name}`; // 临时目录来克隆仓库

    // 克隆或更新仓库
    if (!fs.existsSync(repoPath)) {
        await git.clone(appConfig.giturl, repoPath);
    } else {
        await git.cwd(repoPath);
        await git.pull('origin', 'master');
    }

    // 构建 React 项目
    await execPromise(`npm install`, { cwd: repoPath });
    await execPromise(`npm run build`, { cwd: repoPath });

    // 传输构建结果到服务器
    await ssh.connect({
        host: appConfig.server.host,
        username: appConfig.server.username,
        password: appConfig.server.password
    });
    await ssh.putDirectory(path.join(repoPath, 'build'), appConfig.server.path);

    console.log(`Deployment completed for ${appConfig.name}`);
}

function execPromise(command: string, options:ExecOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

// 执行部署
deployApp().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
});
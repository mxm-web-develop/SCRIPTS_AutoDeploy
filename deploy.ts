import SimpleGit from 'simple-git';
import { NodeSSH } from 'node-ssh';
import { exec, ExecOptions } from 'child_process';
import fs from 'fs';
import path from 'path';

function deleteFolderRecursive(directoryPath: string) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const curPath = path.join(directoryPath, file);

            if (fs.lstatSync(curPath).isDirectory()) {
                // 递归删除目录
                deleteFolderRecursive(curPath);
            } else {
                // 删除文件
                fs.unlinkSync(curPath);
            }
        });

        // 删除目录本身
        fs.rmdirSync(directoryPath);
    }
}

// 将传递给脚本的参数解析为应用配置对象
const appConfig = JSON.parse(process.argv[2]);

async function deployApp() {
    const git = SimpleGit();
    const ssh = new NodeSSH();
    const repoPath = `${__dirname}/tmp/${appConfig.name}`; // 临时目录来克隆仓库
    console.log(fs.existsSync(repoPath))
    // 清理旧的临时目录
    if (fs.existsSync(repoPath)) {
      try {
        deleteFolderRecursive(repoPath);
      } catch (error) {
        console.error(`Error deleting temp directory: ${error}`);
        return;
      }
        deleteFolderRecursive(repoPath);
    }

    // 克隆指定分支的仓库
    await git.clone(appConfig.giturl, repoPath, ['--branch', appConfig.branche]);

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

function execPromise(command: string, options: ExecOptions): Promise<string> {
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

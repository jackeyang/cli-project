var inquirer = require('inquirer');
// 模板配置化
const template = require(`${__dirname}/../template`)

function inquirerFn() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'frame',
            message: '请选择开发用的脚手架:',
            choices: Object.keys(template)
        },
        {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称:'
        },
        {
            type: 'input',
            name: 'description',
            message: '请输入项目简介:'
        }
    ]);
}


const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const Promise = require('bluebird');
const download = Promise.promisify(require('download-git-repo'));
const spinner = ora('正在下载模板…');



/**
 * 从 github 上下载已有的模版
 * @param answers 命令行收集到的交互信息
 * @param dirname 最终生成的项目名
 */
function downloadFn(answers, dirname) {
    const { frame, projectName = dirname, description = dirname } = answers;
    if (!template[frame]) {
        console.log(chalk.red('\n Template does not exit! \n '))
        return
    }

    if (!projectName) {
        console.log(chalk.red('\n Project should not be empty! \n '))
        return
    }

    // console.log('url:', template[frame])
    let url = 'direct:' + template[frame]
    spinner.start();
    download(url, dirname, { clone: true })
    .then(() => {
        spinner.stop(); // 关闭 loading 动效
        console.log(chalk.green('download template success'));
        // 重写 package 中的 name、description 等项目信息
        const pkg = process.cwd() + `/${dirname}/package.json`;
        const content = JSON.parse(fs.readFileSync(pkg, 'utf8'));
        content.name = projectName;
        content.description = description;
        const result = JSON.stringify(content, null, '\n');
        fs.writeFileSync(pkg, result);
       
        })
        .catch(err => {
        spinner.stop(); // 关闭 loading 动效
        console.log(chalk.red('download template failed'));
        console.log(err);
        });
}

module.exports = {
    inquirerFn,
    downloadFn
}
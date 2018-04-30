---
layout: post
title: "Heroku 教程：使用 Heroku 快速搭建站点"
date: 2018-02-18 17:49:25 +0800
comments: true
categories: [Heroku]
---
## 简介
Heroku 是 Salesforce 旗下云服务商，提供方便便捷的各种云服务，如服务器，数据库，监控，计算等等。并且他提供了免费版本，这使得我们这些平时想搞一些小东西的人提供了莫大的便捷，虽然他有时长和宕机的限制，但是对于个人小程序来说已经足够了。
<!-- more -->
## 快速入门
### 注册账号
进入 [Heroku 官网](https://www.heroku.com)，因为 Heroku 是国外的站点，所以需要提前准备好翻墙。点击 Sign Up，根据要求填写好信息。这里需要注意的是，国内大部分的邮箱不支持，所以这里提前准备好 gmail 邮箱进行注册。
### 创建 App
Heroku 提供了便捷的网页控制台和终端，登录成功后我们直接进入 Heroku 的网页控制台，选择我们熟悉的语言进行创建，我们这里选择两种方式进行介绍，PHP 和 Java。

#### PHP
##### 准备
点击按钮以后进入开始界面，界面提示我们需要提前安装好 [PHP](http://php.net/) 和 [Composer](https://getcomposer.org/doc/00-intro.md)，使用 PHP 的朋友就不需要更多的介绍了，直接点击 `I'm ready to start`。
##### Set up
下载 Heroku CLI，这是 Heroku 的命令行工具，下载以后可以使用命令行直接进行代码更新和部署等操作，当然下文也会介绍更方便的部署方式。下载成功以后使用 `heroku login` 命令，输入邮箱和密码进行登录。
##### 准备项目
如果我们没有项目，可以直接使用如下命令下载项目源码，然后部署项目。
```
git clone https://github.com/heroku/php-getting-started.git sesamepaste
```
后面跟随的 sesamepaste 是我将来的项目名称，然后进入项目
```
cd sesamepaste
```
##### 创建App
这里说的 App 不再是我们本地的项目，我们目前可以简单理解为 Heroku 的一个用来存放我们项目的容器，只有先有了这个容器才能部署我们的项目。运行如下命令创建，其中 sesamepaste 是项目的名称，也是 Heroku 的唯一标识，后面我们运行成功了，也需要使用 sesamepaste.herokuapp.com 来访问 App。  
```sh
 heroku create sesamepaste
```
创建成功以后运行如下命令部署，其实就是把代码push 到 Heroku 的仓库，它会帮助我们自动化部署。
```sh
git push heroku master
```
最后使用 `heroku open` 命令就可以打开我们部署好的网站了。
#### Java
其他步骤和上面一样，除了项目地址，如下地址不是官方的例子，是笔者添加了一些spring，mybatis，flyway等集成的版本。
```
https://github.com/codedrinker/heroku-spring-boot-mybatis-mysql-flyway-example.git sesamepaste
```
#### 其他
如果是其他语言直接访问 Heroku帮助页面，[https://devcenter.heroku.com](https://devcenter.heroku.com)

#### 注意事项
主要注意的是，笔者自己写的这个 JAVA 项目使用的是 MySQL，所以需要使用的人在创建好了 App 之后执行如下命令。删除默认数据库，添加MySQL数据库
```
heroku addons:destroy heroku-postgresql
heroku addons:create cleardb:ignite
heroku config # 过程中可以使用 config 命令查看数据库 URL 是否修改成功
```

#### 查看日志
如果启动过程中出现问题，可以使用heroku logs查看日志。如果看到发现变量不对可以使用如下命令打印变量
```
heroku run echo \$JDBC_DATABASE_URL
```

## 简单介绍
### 日志
每次运行命令需要进入当前项目的目录，必要的时候需要输入 `heroku login`，使用 `heroku logs --tail` 命令实施查看输出日志。

### Procfile
你会发现拉取下来的代码里面有名字是 Procfile 的文件，这文件是用来定义运行项目时候的命令，默认如下，表示使用apache 运行 web项目，目录是web。
```
web: vendor/bin/heroku-php-apache2 web/
```
### 关联 Github 
上文说到需要 push 到 heroku 的仓库才能部署，heroku 提供了更强带的功能，直接关联 Github 的仓库的分支，等分支有新内容更新的时候直接部署。这个配置就需要去 web控制台配置了。进入项目，点击 `Deploy`，勾选 `Github`，然后完成配置即可。

## 相关文章
[Heroku 入门教程之：绑定自定义域名](/blog/heroku-custom-domains/)

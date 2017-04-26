---
layout: post
title: "Browsersync 前端实时预览工程搭建"
date: 2016-12-24 20:46:37 +0800
comments: true
categories: Web
---

##前言
有Web开发经历的人都会遇到这样的一个情况，频繁的修改HTML,CSS,JS文件，然后刷新浏览器查看效果，有的时候索性UX就坐到你旁边指挥你，刷新次数能少么？大多数情况我们会连接一个外接显示器，这样不用频繁的切换窗口，但是未能避免频繁的刷新浏览器。更糟糕的是非静态页面，要是不能动态编译的话，还需要处理项目的热部署。所以笔者在网上查了查，同时咨询了一下身边的朋友[小马](https://github.com/HelloJacky)，就有了下面这篇文章：通过`Browsersync`把文件变化实时更新到浏览器端，不同的前端技术架构体现的效果不一样，有的是不刷新页面的更新样式和布局，有的是刷新页面更新，效果更像是点击“F5”。无论做前端还是后端，使用它将提高30%的工作效率，下面我们就直接进入正题。

##示例

![Sync Image](/images/sync-demo.gif)

##安装Node.js和Browsersync
- Node.js:因为`Browsersync`是基于`Node.js`的，所以我们需要先安装`Node.js`。不同的系统安装方式不尽相同，直接去官方安装即可，[官网](https://nodejs.org/en/)。
- Browsersync:安装完`Node.js`以后会自动安装NPM包管理工具，我们直接使用NPM安装`Browsersync`。运行如下命令：
```
npm install -g browser-sync
```
>**参考文档：** https://www.browsersync.io/#install

##启动Browsersync
以我当前项目为例，是一个使用Intellij Idea编辑的Java Web项目，部署到集成的Tomcat下面，项目源码根目录在`~/Code/simple-web-sample`，静态资源目录在`~/Code/simple-web-sample/src/main/webapp/`，如下图：
```
.
├── README.md
├── pom.xml
├── simple-web-sample.iml
├── src
│   └── main
│       ├── java
│       ├── resources
│       │   ├── applicationContext.xml
│       │   ├── config.properties
│       │   └── db
│       │       └── migration
│       │           └── V1__Create_user_table.sql
│       └── webapp
│           ├── WEB-INF
│           │   └── web.xml
│           ├── index.css
│           ├── index.html
│           └── index.js
└── target
```
我直接把Tomcat集成到Intellij Idea里面，直接可以部署运行Tomcat（详情累述，具体参照Idea的[文档](https://www.jetbrains.com/help/idea/2016.1/run-debug-configuration-tomcat-server.html?origin=old_help))，端口为8080。运行项目成功以后，运行下面命令启动`Browsersync`:
```
browser-sync start --proxy http://localhost:8080 
--files "~/Code/simple-web-sample/src/main/webapp" --port 8086
```
命令行会出现如下提示，说明我们运行成功了：
```
[BS] Proxying: http://localhost:8080
[BS] Access URLs:
 --------------------------------------
       Local: http://localhost:8086
    External: http://192.168.1.103:8086
 --------------------------------------
          UI: http://localhost:3001
 UI External: http://192.168.1.103:3001
 --------------------------------------
[BS] Watching files...
```
这样我们打开浏览器，就可以通过访问`http://localhost:8086`访问之前8080端口的内容了。那么问题来了，运行是可以了，但是`Browsersync`，是通过代理访问的`8080`端口，不是替代的WEB容器，所以Idea里面的代码的热部署需要我们自己来处理。

>**参考文档：** https://www.browsersync.io/docs/command-line

##热部署
为解决实时把Idea的源代码热部署到Tomcat，我们需要使用[Jrebel](https://zeroturnaround.com/software/jrebel/trial/)对项目进行热部署。如果不愿购买正版的，也可以参照如下文档:
[http://www.jianshu.com/p/d177316890e3](http://www.jianshu.com/p/d177316890e3)进行配置。
热部署配置完成以后，我们就可以放心大胆的编写Java代码，然后通过`Browsersync`自动更新页面了。如果是其他语言能够动态编译的也不需要热部署这个步骤，直接配置好目录就可以了。

>**参考文档：** http://www.jianshu.com/p/d177316890e3

##前后端分离
如上其实不是最好的解决方案，如果好多请求依赖服务器语言比较重就没有办法了，若是仅仅针对HTML,CSS,JS等资源文件的话，那么大可以做到前后端分离，这样就省去了很多麻烦。

还是用我的程序举例，使用Intellij Idea运行的程序仅包含API，单独分离静态项目(simple-web-sample-front)，可以使用目前比较火的AngularJS,ReactJS或者是Vue。这样变可以在静态项目下面直接运行如下命令启动一个服务，本身`Browsersync`不使用代理的方式自身会启动一个HTTP服务器：
```
browser-sync start --files "~/Code/simple-web-sample-front" --port 8086
```
但是需要注意的是，js本身是不可以跨域的，我们需要对`8080`端口的服务器进行跨域配置，笔者使用的是添加`Access-Control-Allow-Origin`HTTP响应头，允许跨域请求。这样把前后端就分离开来了，不用因为要修改页面的样式和布局，很大张旗鼓的打开Idea。

>**参考文档：** http://harttle.com/2015/10/10/cross-origin.html


至此已经全部完成，这样你就可以尽情的，不打断思路的编写代码，任凭浏览器自己的更新文件去吧，等自己觉得差不多了，回过头来看一眼就行了。

>PS:笔者写这篇文章的时候就是用的这个，一个显示器是编辑器，一个显示器就是Blog的Preview，确实是很方便呢。

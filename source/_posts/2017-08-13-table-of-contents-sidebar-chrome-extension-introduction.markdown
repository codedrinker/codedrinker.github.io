---
layout: post
title: "Chrome自动生成网页目录插件的编写和使用"
date: 2017-08-13 00:16:06 +0800
comments: true
categories: ["Chrome Extension","Project","toc"]
description: 怎么样编写Chrome Extension,Chrome Extension的项目目录和简单说明,自动生成文章目录的Chrome Extension讲解,编写Chrome Extension过程中遇到的坑,如何为插件编写主题,下载地址
keywords: Chrome插件的编写,Chrome Extension 编写,Chrome Extension setIcon, Chrome Extension LocalStorage,自己动手写Chrome Extension
---
##前言
虽然移动设备已经很普遍了，但是大家使用电脑阅读网页的时间还是很长，尤其是做我们这个行业，除了阅读博客，通过网页搜索资料的时间也是比其他行业要多出来很多的。每次遇到特别长的文章的时候，从上到下的翻阅查找重点内容，肉眼的分离段落实在是比较费劲。但是有的网站这方面比较人性化，`Hexo`的博客系统或者是最近比较火的`segmentfault`，他们的文章目录就很方便，便于我们快速的定位(如下图)。但是大部分博客或者是贴吧还是没有目录的，于是笔者就突发奇想，自己写一个`Chrome`的插件，能自动的识别出来文章的目录，于是就有了这篇文章：  
<!-- more -->
![SegmentFault](/images/posts/chrome-extension-segmentfault.png)

##效果展示
如图，简单的展示了一下插件的使用方式。
![Chrome Extension Toturial](/images/posts/chrome-extension-tutorial.gif)

##怎么快速编写Chrome Extension？
首先需要的是`翻墙`，这个应该是`攻城狮`必备了吧。然后访问`Google`的官方[Get Started](https://developer.chrome.com/extensions/getstarted)文章即可。里面的通过一个具体的实力详解，非常详细。如果想用更简单的办法，直接`clone`笔者的[Repo](https://github.com/codedrinker/table-of-contents-sidebar)，然后修修改改。

##简单描述一下Chrome Extension的目录结构  
如下是笔者插件项目的目录结构，内容很多，我们挑一些重点说。
![Tree](/images/posts/chrome-extension-tree.png)  
`manifest.json`是必不可少的，它是插件的入口，包括名字，版本，权限，icon等配置都在这里面。  

`background.js`可以是长时间运行在`Extension`的生性周期里面长时间运行的脚本，用它来管理一些任务或状态非常方便。他可以这样的原因是如下配置：
```json manifest.json
"background": {
    "scripts": [
      "background.js"
    ],
    "persistent": true
  }
```  
`app.js`是使用插件过程中，网页里面可以执行的`js`文件，原因如下配置：
```json manifest.json
"content_scripts": [
    {
      "css": [
        "table-of-contents-sidebar.css"
      ],
      "js": [
        "app.js"
      ],
      "matches": [
        "http://*/*",
        "https://*/*"
      ]
    }
  ]
```
`options.html`是设置界面，点击插件右键的`Options`出现的界面。因为`manifest.json`里面的`options_ui`配置了。
```json manifest.json
"options_ui": {
    "page": "options.html",
    "chrome_style": true,
    "open_in_tab": true
  }
```
`table-of-contents-sidebar.css`文件是插件的样式文件，如果需要在修改网页样式的时候使用，需要通过`chrome.extension.getURL("table-of-contents-sidebar.css");`的方式获取到他的绝对路径，然后写到页面里面使用。  
`options.css`这个是设置页面需要使用的样式，不需要上面那么复杂，因为配置页面就是直接的网页了，可以直接引用：
```html options.html
<script src="options.js"></script>
<link rel="stylesheet" href="options.css">
```
其他的都是一起图片或者是样式资源，没有特别要说的，只要路径对应好就可以了。

##插件的实现思路
1.采用遍历h*标签作为菜单  
2.使用元素距离屏幕的垂直距离来过滤无用标签，笔者初步认为，h*标签高度递增说明一直是一个`Section`里面的标签，如果有变化，说明已经不对了，所以通过这个方式过滤一部分无用标签。  
3.通过原始元素的`ID`定位锚，但是如果原始元素没有，自动生成一个`UUID`绑定到原始元素，方便定位。  
4.使用获取当前页面的`domain`实现黑名单拦截功能，过滤掉一些使用者不希望看到`目录`的页面。
5.使用`mouseover`和`mouseout`事件实现鼠标移走就自动消失，最大限度的不要遮挡阅读内容。  
6.使用`LocalStorage`实现保持用户搜索的设置，包括黑名单拦截。这样保证重启浏览器配置不会丢失。

##踩过的坑
1.`Extension`使用的`icon`不能大于`190px`，所以再设置`broswer_action`或者是`content_menus`的时候一定要控制`icon`大小，因为大小超过以后他不会报错，只是不显示而已。  
2.如果是页面想访问`Extension`资源，需要配置`web_accessible_resources`访问权限：
```json manifest.json
"web_accessible_resources": [
    "images/*",
    "table-of-contents-sidebar.css",
    "options.html",
    "themes/*"
  ]
```
3.修改完代码以后，必须到`chrome://extensions/`页面强制刷新，不然不会更新。    
4.上传第一个`Chrome Extension`需要交纳`7$`费用，官方说这是为了验证你的合法性。  
5.如果更新的`Plugin`到商店的话，已经安装的用户会在5小时左右自动更新。`Chrome`的默认配置是5小时更新一次配置。

##下载和使用
直接在`Chrome Webstore`搜索`Table of contents sidebar`下载，或者直接点击如下地址[https://chrome.google.com/webstore/detail/table-of-contents-sidebar/ohohkfheangmbedkgechjkmbepeikkej](https://chrome.google.com/webstore/detail/table-of-contents-sidebar/ohohkfheangmbedkgechjkmbepeikkej)安装。操作是非常简单的，所以就不具体说了，如果需要讲解，可以参照插件下载页面的视频(YouTube)。

##自定义样式
由于笔者是后端出身，虽然编码前端没问题，但是对于页面美观上面还是差一些。于是笔者提供了一个用户可以简单的编写样式的方式，这样如果想自己编写一个样式并且应用到`Chrome Extension`的同学，可以按照如下操作。    
1.第一步，`fork`[项目](https://github.com/codedrinker/table-of-contents-sidebar)代码，`clone`到自己本地。  
2.第二步，`load`项目到`Chrome`，需要在开发模式才能`load`本地的包。  
3.第三步，在`themes`目录添加你自定义样式文件，比如`darcula.css`。里面的内容仿照`table-of-contents-sidebar.css`编写即可，里面的元素很清楚。  
4.第四步，在`options.html`里面找到`theme`的`select`，添加一个`option`如下即可：
```html options.html
<option value="themes/darcula.css">Darcula</option>
```
5.第五步，提交一个`Pull Request`，我会尽快`Accept`。
这样你自定义的样式就可以展示在设置页面了。
![Chrome Extension Theme](/images/posts/chrome-extension-theme.png)

##使用愉快
希望这个插件对大家有用，如果有任何问题，可以提[Issue](https://github.com/codedrinker/table-of-contents-sidebar/issues)到`GitHub`。

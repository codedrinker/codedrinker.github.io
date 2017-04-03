---
layout: post
title: "Octopress 博客搜索优化"
date: 2017-03-18 22:43:10 +0800
comments: true
categories: 
---

##前言
尝试在Google, Baidu, Bing 搜索之前写的文章的关键字基本搜不到，甚至使用标题一模一样去搜索也不行，更意外的是第一个出现的是转载的文章。于是就带着这个疑问去网上查了一些资料，尝试去优化一下，下面就是这次优化的笔记。  
PS:虽然做我们这行业的人基本都是用Google 搜索。

##搜索引擎优化
优化中包括文章链接的变动，已经提交的链接变得无法检索，所以先进行一些优化，需要再次提交链接。

* ####手动提交
在Google搜索的时候发现搜索不到，可以手动添加到Google，这样可以主动收录，具体的地址  
https://www.google.com/webmasters/tools/home?hl=en&pli=1  
里面包含搜索状态，搜索分析，网站优化等一些Google的调试工具可以使用，以提高网站的搜索效果。


##内容优化

* ####修改post的url  
因为Octpopress Jeklly的默认post路径带着日期，分级较多，造成URL较长，不利于搜索引擎检索，我们可以自己缩短URL。直接在`_config.yml`里面修改`permalink: /blog/:year/:month/:day/:title/` 为 `permalink: /blog/:title/`即可。  
接下来又出现问题了，因为之前已经发表的post，被搜索引擎索引了，或者是其他地方有引用就不能访问了。所以我们需要处理一下原来的文章地址，我的做法是把 `public`里面已经生成好的内容直接拷贝到`source/blog`目录下面，这样再次`generate`的时候就会把原来的目录生成在`public`里面。
```
source/blog/
├── 2015
│   └── 01
│       └── 10
│           └── begininng-and-summary
│               └── index.html
├── 2016
│   └── 12
│       ├── 15
│       │   └── set-up-vagrant-environment
│       │       └── index.html
│       └── 24
│           └── auto-preview-front-end-changes
│               └── index.html
├── 2017
│   └── 03
│       └── 11
│           └── the-smart-way-of-styling-and-customizing-file-input
│               └── index.html
└── archives
    └── index.html
```
切记不能复制`archives/index.html`，因为里面包含一些动态代码，并不是我们曾经发表的博文。然后把每一个`html`文件里面的内容删除，添加如下代码即可：
```html
<meta http-equiv="refresh" content="0; url=/blog/begininng-and-summary">
<link rel="canonical" href="https://codedrinker.github.io/blog/begininng-and-summary" />
```
`...http-equiv=“refresh...`是为了再次访问这个网页的时候可以自动跳转到相应的网页，`...rel="canonical" href=...`就相当于301，这样搜索引擎会重新索引指定的网址，这样久的post可以正常使用， 新发布的post的地址也可以自动变成短链接了。


## 版权
因为好多转载的文章或者类似最近比较火的`阅读模式`处理过的文章只包含正文，为了解决这个问题，所以把原来签名等相关信息放在了正文里面，内容的最下面，这样就可以和正文同样处理了，只是每次写博文的时候麻烦一些。如果想为本文添加一个跳转到博文的链接的话，可以使用如下代码添加：  
```
[Octopress 博客搜索优化]({% post_url 2017-03-18-optimize-octopress-blog-seo %})
```
通过`post_url`动态生成`url`地址，修改域名或者目录的时候不会导致不必要的麻烦。示例如下文:

##未完待续。。。

##作者
本文作者`麻酱`，欢迎讨论，指正和转载，转载请注明出处。  
原文地址：[Octopress 博客搜索优化]({% post_url 2017-03-18-optimize-octopress-blog-seo %})  
如果兴趣可以关注作者微信订阅号  
![majiangbiji](/images/wechat.jpg =150x150) 
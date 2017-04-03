---
layout: post
title: "Github Pages配置域名"
date: 2017-04-03 00:32:47 +0800
comments: true
categories: 
---

##前言
一个“码农”基本都有一个自己的域名，有的人说是因为逼格，有的人说是因为有钱，无论怎么样都有自己的原因，我觉得是因为情节。   
因为我的博客是通过Octopress搭建在Github Pages上面的，所以我需要让我的域名的DNS解析到Github Pages上面。

##Github
首先在`codedrinker.github.io`这个`repository`的`gh-pages`指向的分支根目录添加一个`CNAME`，里面写`majiang.life`，不需要添加`http`或者`www`。因为博客采用的Octopress，所以直接在`source`目录添加一个`CNAME`文件，然后`rake gen_deploy`就可以自动生成到`gh-pages`分支`master`了。

##DNS
我是在Godaddy上面买的域名，不过DNS配置都大同小异，需要配置一个A记录，`host`是`@`,`Points to`是`192.30.252.153`；和一个CNAME记录`host`是`www`，`Points to`是`codedrinker.github.io`。`TTL`可以选择一个`CUSTOME`，比如`600S`。

##DIG
等过一会DNS更新了以后，运行如下命令，看是否域名指向成功
```sh
dig majiang.life +nostats +nocomments +nocmd
```
```
; <<>> DiG 9.8.3-P1 <<>> majiang.life +nostats +nocomments +nocmd
;; global options: +cmd
;majiang.life.			IN	A
majiang.life.		600	IN	A	192.30.252.154
majiang.life.		600	IN	A	192.30.252.153
```
表示已经成功了。

##意外
1. 不能访问  
 但是不幸的事情发生了，访问`majiang.life`的时候偶尔就会跳转到一个莫名其妙的网址，上面显示着
 
 ```
 The domain majiang.life is no longer parked by GoDaddy.
 ```
 ![Error](/images/posts/godaddy.jpg) 
 于是在网上查了一下这个原因众说纷纭，有的说多配置了，有的说得等等，但是从我配置`DNS`到现在已经一天了。于是我有仔细排查了一下`DNS`的配置，发现还有一条默认的`GoDaddy 的A记录`(我通过IP反查域名，发现是GoDaddy自己的)，问题便解开了，因为如果同样配置两个一样的`A`记录，DNS会轮询访问者两个`Points to`，随后我把这个`A`记录删除了，这个问题也就迎刃而解，所以配置域名的时候还是需要谨慎一些。

2. 不能提交  
 一切都搞定了，域名也能访问了，但是我本地`rake deploy`命令不工作了。  

 ```
 To https://github.com/codedrinker/codedrinker.github.io
  ! [rejected]        master -> master (non-fast-forward)
  error: failed to push some refs to 'https://github.com/codedrinker/codedrinker.github.io'
  hint: Updates were rejected because the tip of your current branch is behind
  hint: its remote counterpart. Merge the remote changes (e.g. 'git pull')
  hint: before pushing again.
  hint: See the 'Note about fast-forwards' in 'git push --help' for details.

 ## Github Pages deploy complete
 cd -
 ```

 回想起来是因为我手贱，嫌麻烦开始直接在`Github`网页上面添加的CNAME，这样就没有办法更新博文了。看了一下`Rakefile`里面，他每次都是拷贝生成好的`public`目录到`_deploy`目录，然后执行`git push`，所以我更新`codedrinker.github.io`的代码没有用，如果是这样问题就好解决了：   

 - 直接去`_deploy`目录，运行`git pull`，把`_deploy`代码更新到最新就可以了。
 - 如果还是不工作，反正原理就是`Octopress`会把`_deploy`目录当做更新生成好资源的目录，我们直接重新创建`_deploy`，然后把它和`master`关联就好了。

 ```
 mkdir _deploy
 cd _deploy
 git init
 git remote add -t master -f origin https://github.com/codedrinker/codedrinker.github.io.git
 ```

 这样以后就可以重新使用`rake deploy`了。

##作者
本文作者`麻酱`，欢迎讨论，指正和转载，转载请注明出处。  
原文地址：[Github Pages配置域名]({% post_url 2017-04-03-github-and-godaddy %})  
如果兴趣可以关注作者微信订阅号  
![majiangbiji](/images/wechat.jpg =150x150) 
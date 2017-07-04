---
layout: post
title: "阅读模式是如何实现的?"
date: 2017-07-04 21:09:10 +0800
comments: true
description: "阅读模式是如何实现的，阅读模式是怎么实现的，模拟读读日报的阅读模式实现"
categories: [Tech]
---
##前言
最近使用读读日报发现其阅读模式很是方便，除了字体和布局舒服了，最重要的是去掉了干扰阅读的所有因素，包括广告，相关文章，栏目等等。于是就查找了一下有没有类似的实现方案。最后找了一些方案，不过并不知道正解，只是抛砖引玉罢了。(PS:感觉更深层次的处理应该是机器学习吧)

##霸王硬上弓
这种方式就非常简单了，如题，直接对于每一个网站做适配，就是麻烦一些。直接通过编程语言解析页面的元素，然后找出对应的文章正文的位置，然后重新绘制样式，最后输出就搞定了。这样做麻烦一些，每一个网页都要做适配，不过可控的是对每一个元素的样式都可以把握。
##使用轮子
使用第三方`API`，[Mercury](https://mercury.postlight.com/)。这是一个免费的非常强大的`API`，他提供在线的把文章转换为便于阅读的文章。官方给的解释是：
```
Make your content work anywhere. Free.
Mercury transforms web pages into clean text. 
Publishers and programmers use it to make the web make sense, 
and readers use it to read any web article comfortably.
```
我们只需要注册一个账号，然后使用它的`api-key`调用接口就可以了。下面是预览效果：

![article-readable-preview](/images/posts/article-readable-preview.png)  
同时他提供了一个免费的Chrome 插件，如果想预先看看效果的话可以下载下来试用。[插件地址](https://chrome.google.com/webstore/detail/oknpjjbmpnndlpmnhmekjpocelpnlfdi)   
当然免费的肯定也有免费的弊端，他对于网页制作比较规格的适配比较好，有一些网页并不是很好。

##野路子
我们大家都用过`pocket`吧，他就是通过离线阅读起家的，所以无论是他的效果，适配都是一流的，但是他官方的`API`只支持`CUD`不支持`R`。不过有说明，如果你真的需要的话可以找他们合作。我本着学习做了如下理论推测：首先通过调用其`API`存储网址，然后直接通过网页登录，然后就能看到`完美`的预览图了，拷贝下来不就行了嘛。当然程序如果想实现也是可以的，不过笔者就不提供代码了。但是如果你选择这个方案一定仔细阅读以下他的`Terms`。

## 总结
笔者只是抛砖引玉，希望有更好实现的人可以赐教。

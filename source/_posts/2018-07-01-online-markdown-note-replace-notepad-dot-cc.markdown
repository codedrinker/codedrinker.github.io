---
layout: post
title: "notepad.cc 替代品——在线 Markdown 笔记"
date: 2018-07-01 08:43:42 +0800
comments: true
categories: ["Markdown","Project"]
keywords: Online Markdown Note Replace notepad.cc,Online Markdown Note,在线 Markdown 笔记
---

## 前言
方便简洁的 notepad.cc 关闭，对于喜欢使用不需要登录，又简单的云存储工具的我们是一个损失，于是笔者就自己写了一个。PS:不需要担心再次关闭，因为作者几乎使用的免费的工具来实现：  
1. Github Pages 承载空间  
2. 七牛免费 10G 的存储空间存储笔记，我们假定一个文档的使用空间是 1K，那么免费可以容纳 `10*1024*1024 = 10,485,760`，如果真的到了这个数量级，那么也不需要考虑是否免费了。  

所以请大家放心使用。至于安全问题，如果特别敏感的东西，相信你也不会存在这个地方，不过笔者还是做了一些限制，把七牛的 `key` 存储到了云端。  
<!-- more -->

## 实现 
实现相对非常简单，使用了免费的 [Editor.md](https://gitee.com/pandao/editor.md) 作为 Markdown 的编辑工具。    
使用 `Github Pages` 承载编辑器页面，直接使用七牛 `JavaScript SDK`，同步编辑内容到七牛云空间。  

## 使用
访问 http://mdnote.gettools.wang/  
如果带 `#codedrinker`，先获取当前短链接下面是否有内容，如果有展示，没有的话自动填入 `Markdown` 语法  
编辑完成以后按 `Ctrl+S` 或者 `Command+S`保存
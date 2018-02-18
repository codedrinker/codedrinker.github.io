---
layout: post
title: "Heroku 入门教程之：绑定自定义域名"
date: 2018-02-18 18:50:38 +0800
comments: true
categories: [Heroku]
---
## 简介
Heroku 会提供一个默认的域名，即[name of app].herokuapp.com，如果你不喜欢可以绑定自己的域名。
<!-- more -->
## 绑定
绑定方式比较简单，直接修改 DNS 指向到 Heroku，然后配置Heroku 即可。
### 修改 DNS
在 Heroku 项目目录使用 `heroku domains` 命令查看当前项目的域名，为 DNS 添加 CNAME 指向到该域名。

### 配置 Heroku
使用 `heroku domains:add` 命令添加域名到 Heroku，然后等待即可。更多详细内容直接参照 [官方文档](https://devcenter.heroku.com/articles/custom-domains)

## 参考文献
[https://devcenter.heroku.com/articles/custom-domains](https://devcenter.heroku.com/articles/custom-domains)
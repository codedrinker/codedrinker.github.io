---
layout: post
title: "为Octopress 首页添加‘更多’功能"
date: 2017-06-24 14:32:31 +0800
comments: true
categories: [Octopress]
description: "octopress index page read more, enable excerpt_link, Octopress 首页 更多，Octopress 首页简介，Octopress 首页文章描述，Octopress 首页显示文章简介，Octopress home display article description"
---
##前言
在使用 `Octopress` 的过程中随着文章数量的增加，首页越来越臃肿，不仅加载慢而且可读性很差。看到过其他人的 `Octopress` 首页很简洁，有一个 `Read more`，这样就非常方便了。查询了一下操作起来也非常简单。

##添加更多
方法是十分的简单，只是因为不是太熟悉`Octopress`导致查了很久。直接在 `*.markdown` 的 `post` 里面添加`<!--more-->`，这个标记下面的内容就不会在首页展示出来，并且通过一个`Read on`替换。原因是因为本身`Octopress`就支持，只是你没有使用。具体在`_config.yml`里面。
```yml
//_.config.yml
excerpt_link: "Read on &rarr;"  # "Continue reading" link text at the bottom of excerpted articles
excerpt_separator: "<!--more-->"
```
如果想修改`Read on`直接在`_config.yml`里面修改就可以了。

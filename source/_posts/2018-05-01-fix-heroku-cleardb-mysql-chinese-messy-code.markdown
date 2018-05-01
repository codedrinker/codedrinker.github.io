---
layout: post
title: "Heroku 教程：MySQL 中文乱码"
date: 2018-05-01 16:03:01 +0800
comments: true
categories: [HeroKu,MySQL]
description: Heroku MySQL 中文乱码,ClearDB MySQL 中文乱码
keywords: Heroku MySQL 中文乱码,ClearDB MySQL 中文乱码
---
## 方案
Heroku 的 MySQL 默认就是 UTF-8字符集，本身不应该出现乱码，但是笔者在测试过程中出现中文乱码。  
解决方法非常简单，直接在配置的URL后面添加如下内容即可。
```
&useUnicode=true&characterEncoding=UTF-8
```
不过在添加之前需要查看一下当前URL格式。

```
heroku run echo \$JDBC_DATABASE_URL
```
输出内容如下
```
jdbc:mysql://endpoint/database?reconnect=true&user=username&password=password
```
所以我直接在后面追加`&useUnicode=true&characterEncoding=UTF-8`即可。
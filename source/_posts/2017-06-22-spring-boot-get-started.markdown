---
layout: post
title: "使用 Idea 创建 Spring Boot 项目"
date: 2017-06-22 22:22:14 +0800
description: "Spring Boot Get Started, 创建Spring Boot项目，使用Idea 创建Spring Boot 项目，Spring Boot项目入门，什么是Spring Boot"
comments: true
categories: [Spring-boot,Java]
---

##Spring Boot
最近 `Spring Boot` 如火如荼，于是也开始试试，不过上手真的太简单了。`Idea`非常方便的就可以创建，或者直接`clone`官方的例子[https://spring.io/guides/gs/spring-boot/](https://spring.io/guides/gs/spring-boot/)。通俗理解`Spring Boot`就是一个`平台`，让你非常便捷的构建和运行一个项目，并且他是基于组件化的，你想用什么直接`拿来主义`就可以了，话不多少直接上手。

##使用 `Idea` 快速搭建
选择`Spring Initialiar`直接创建。
![spring-boot-get-started-1](/images/posts/spring-boot-get-started-1.png)  

填写好`Group`和`Artifact`。
![spring-boot-get-started-2](/images/posts/spring-boot-get-started-2.png)  

下面直接选择`Web`就可以了，但是如果你想选择其他的直接勾选就行，她会自动为你加载依赖。并且一些`dependency`不需要配置版本，每一个`Spring Boot`的`parent`项目集成管理，这样省去了好多兼容麻烦。
![spring-boot-get-started-3](/images/posts/spring-boot-get-started-3.png)  

我们写一个`HelloController`试一下效果。
![spring-boot-get-started-4](/images/posts/spring-boot-get-started-4.png)  

最后访问`http://localhost:8080`成功。
![spring-boot-get-started-5](/images/posts/spring-boot-get-started-5.png) 

如果想改变端口也是非常简单的。
![spring-boot-get-started-6](/images/posts/spring-boot-get-started-6.png) 
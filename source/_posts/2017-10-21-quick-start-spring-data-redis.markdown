---
layout: post
title: "Spring 集成 Redis 扫雷"
date: 2017-10-21 10:37:55 +0800
comments: true
categories: [Spring,Redis]
description: Spring Data Redis 介绍, 快速搭建 Spring Data Redis,NoClassDefFoundError 问题解决,简单介绍Maven的optional属性,\xac\xed\x00\x05t\x00 到底是啥
keywords: Spring Data Redis,HSpring Data Redis 介绍, 快速搭建 Spring Data Redis,NoClassDefFoundError 问题解决,简单介绍Maven的optional属性,String Data Redis \xac\xed\x00\x05t\x00 到底是啥
---
##前言
关于`Redis`已然是烂大街的技术了，但是近日新起了一个项目需要集成`Redis`，看了一下之前的封装实在是不怎么优雅，于是查了一下发现了一个非常简单的解决方案，那就是`Spring`家族的`Spring Data Redis`。话不多说直接“上码”:
<!-- more -->
##Spring Data Redis 介绍
Spring Data Redis是Spring Data系列的一部分，它可以轻松地使得Spring应用程序配置和访问Redis。

## 快速搭建 Spring Data Redis
直接可以参照官方地址进行配置，以往的`Spring`的文档都写着预计阅读时间，这个没有写你就知道有多简单啦。你可以直接[点击查看官方文档](http://projects.spring.io/spring-data-redis/)，或者往下阅读。  
`Maven`直接引入如下依赖：
```xml pom.xml
<dependencies>
    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-redis</artifactId>
        <version>1.8.8.RELEASE</version>
    </dependency>
</dependencies><repositories>
    <repository>
        <id>spring-libs-release</id>
        <name>Spring Releases</name>
        <url>https://repo.spring.io/libs-release</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```
然后直接在`Spring`的配置文件里面定义`bean`就可以了，官方没有说怎么配置`hostname`等等，但是点击`JedisConnectionFactory`里面一看就知道了，直接添加一行`p:host-name="172.10.23.234"`即可。
```xml applicationContext.xml
<bean id="jedisConnFactory" 
    class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory" 
    p:use-pool="true"
    p:host-name="172.10.23.234"
    />

<!-- redis template definition -->
<bean id="redisTemplate" 
    class="org.springframework.data.redis.core.RedisTemplate" 
    p:connection-factory-ref="jedisConnFactory"/>
```
最后直接引入`bean`使用：
```java Example.java
public class Example {

    // inject the actual template
    @Autowired
    private RedisTemplate<String, String> template;

    // inject the template as ListOperations
    // can also inject as Value, Set, ZSet, and HashOperations
    @Resource(name="redisTemplate")
    private ListOperations<String, String> listOps;

    public void addLink(String userId, URL url) {
        listOps.leftPush(userId, url.toExternalForm());
        // or use template directly
        redisTemplate.boundListOps(userId).leftPush(url.toExternalForm());
    }
}
```
如上，根据`Spring`的官方文档已经全部完成，是不是非常简单？那么接下来我们运行一下试一试。  
这时候出现了第一个异常。
##NoClassDefFoundError 问题解决
```sh
nested exception is java.lang.NoClassDefFoundError: org/apache/commons/pool2/impl/GenericObjectPoolConfig
```
很明显是没有引入这个包嘛，我们直接从`spring-data-redis`的`pom.xml`里面可以看到多了一个`optional`属性。
```xml pom.xml[spring-data-redis]
  <dependency>
      <groupId>org.apache.commons</groupId>
      <artifactId>commons-pool2</artifactId>
      <optional>true</optional>
    </dependency>
```
那么这个问题就迎刃而解了，因为在`spring-data-redis`里面声明的`commons-pool2`是`optional`的，根据`Maven`的规则如果A项目依赖配置为optional的，那么依赖A项目的B项目如果不手动引入A里面optional的依赖B项目是不会自动引入依赖的的。说起来有点绕，反正就是导致我们必须手动添加下面的依赖。详情可以参照`Maven`的官方网文档。[点击查看官方文档](http://maven.apache.org/guides/introduction/introduction-to-optional-and-excludes-dependencies.html)。
```xml pom.xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
    <version>2.2</version>
</dependency>
```
再次运行的时候我们发现了另一个问题
```sh
nested exception is java.lang.NoClassDefFoundError: redis/clients/jedis/JedisPoolConfig
```
这问题就显而易见了，直接添加如下到`pom.xml`中即可。
```xml pom.xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.9.0</version>
</dependency>
```
这时候我们再次运行项目可以正常运行啦，然而有出现了一个奇怪的问题，存入`Redis`里面的`Key`有一个看起来像是乱码的前缀`\xac\xed\x00\x05t\x00`:
##\xac\xed\x00\x05t\x00 到底是啥
出现这个问题的原因是因为其使用的默认是RedisTemplate，它使用的是Java的Serialization方式，所以会在前面有一段类似乱码的东西。如果是String作为key的话可以直接修改为StringRedisTemplate这个问题就修改了。

##参考链接
[Spring Data Redis](http://projects.spring.io/spring-data-redis/)
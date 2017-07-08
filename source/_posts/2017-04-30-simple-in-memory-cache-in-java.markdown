---
layout: post
title: "构建 Java 应用内存级缓存"
date: 2017-04-30 10:49:21 +0800
comments: true
categories: JAVA Cache Guava
description: Simple In Memory Cache in Java，构建Java应用内存级缓存，Java application cache，guava cache，LoadingCache，CacheLoader，CacheLoader, JAVA 缓存，缓存与LRU，Java Guava Cache，Spring Guava Cache
---
##前言
缓存是我们日常开发中是必不可少的一种解决性能问题的方法。早期Cache只应用在CPU和内存之间，现在遍布在每一个角落，内存和磁盘，磁盘和网路都存在Cache。Cache同样是做Java应用必不可少的元素。缓存在各种用例中非常有用。例如，当一个值计算或检索成本高昂时，应该考虑使用高速缓存，并且需要在某个输入上多次使用它的值。通常我们使用的缓存有`分布式的缓存数据库`,`本机的缓存数据库`,`本地的内存缓存`，当然也有直接使用数据库的。无论我们选择哪一种实现，都需要结合自身的机器配置和网路情况考虑，毕竟内存，网路带宽都是量化的。下面的表格来源于[ Jeff Dean](https://research.google.com/pubs/jeff.html)的一个PPT，里面罗列了不同级别的IO时间，这正是我们评估如何设计我们系统的必要因素。
<br>

|                                   |               |         |
|:----------------------------------|:--------------|:--------|
|L1 cache reference                 | 0.5 ns        |         |
|Branch mispredict                  | 5 ns          |         |
|L2 cache reference                 | 7 ns          |         |
|Mutex lock/unlock                  | 100 ns        |         |
|Main memory reference              | 100 ns        |         |
|Compress 1K bytes with Zippy       | 10,000 ns     | 0.01 ms |
|Send 1K bytes over 1 Gbps network  | 10,000 ns     | 0.01 ms |
|Read 1 MB sequentially from memory | 250,000 ns    | 0.25 ms |
|Round trip within same datacenter  | 500,000 ns    | 0.5 ms  |
|Disk seek                          | 10,000,000 ns | 10 ms   |
|Read 1 MB sequentially from network| 10,000,000 ns | 10 ms   |
|Read 1 MB sequentially from disk   | 30,000,000 ns | 30 ms   |
|Send packet CA->Netherlands->CA    | 150,000,000 ns| 150 ms  |
<!-- more -->
<br>  
由上面表格，我们可以清楚的看出从网络上面获取1M数据和从内存中读取1M数据的差别。为什么说到这里呢，因为随着我们的用户的增加，集群的扩展，很少的情况下是把缓存数据库或者其他缓存中间件和应用程序放在一台服务器上，大部分情况都是分布式的应用系统和缓存系统，所以避免不了的我们需要考虑网络而的开销。然后网络的读取和本地的读取差别如此之大，进而引出了今天的话题，适当的使用Java应用内存级别的缓存。针对一些基本不变的数据，或者是变化不大，使用非常频繁的数据可以考虑采用Java应用内存级别缓存。

##Guava Cache
这篇文章讲的是如何使用`Guava Cache`构建Java内存基本的缓存，`Guava Cache`缓存类似于`ConcurrentMap`，但不完全相同。 最根本的区别是，ConcurrentMap会持续添加到其中的所有元素，如果你不手动删除它们会一直存在。然而`Guava Cache`可以通过缓存的大小，过期时间，或者其他策略自动地移除元素，来限制其内存占用。`Guava Cache`有两种方式实现，一种是`CacheLoader`在定义的时候就设置好缓存的源，另一种是`Callable`在调用缓存的时候指定如果缓存中没有的获取的方式，长话短说，我们直接进入正题。

##依赖
笔者项目使用`Maven`构建，直接使用如下配合文件
```xml pom.xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>19.0</version>
</dependency>
```

## CacheLoader
预先准备好一个`MockDB`类，用来模拟缓存中没有的时候在数据库中获取
{% codeblock lang:java MockDB.java%}
{% raw %}
public class MockDB {
    private static Map<String, String> mockPersistence = new HashMap<String, String>() {{
        this.put("github", "codedrinker");
    }};

    public static String loadFromPersistence(String key) {
        System.out.println("load key from persistence : " + key);
        return mockPersistence.get(key);
    }
}
{% endraw %}
{% endcodeblock %}
下面是使用`CacheLoader`的代码
{% codeblock lang:java GuavaLoadingCache.java%}
{% raw %}
public class GuavaLoadingCache {
    public static void main(String[] args) {
        LoadingCache<String, Optional<String>> loadingCache = CacheBuilder
                .newBuilder()
                .expireAfterWrite(3, TimeUnit.SECONDS)
                .removalListener(new RemovalListener<String, Optional<String>>() {
                    @Override
                    public void onRemoval(RemovalNotification<String, Optional<String>> notification) {
                        System.out.println("cache expired, remove key : " + notification.getKey());
                    }
                })
                .build(new CacheLoader<String, Optional<String>>() {
                    @Override
                    public Optional<String> load(String key) throws Exception {
                        return Optional.fromNullable(MockDB.loadFromPersistence(key));
                    }
                });
        try {
            System.out.println("load from cache once : " + loadingCache.get("github").orNull());
            Thread.sleep(2000);
            System.out.println("load from cache twice : " + loadingCache.get("github").orNull());
            Thread.sleep(2000);
            System.out.println("load from cache third : " + loadingCache.get("github").orNull());
            Thread.sleep(2000);
            System.out.println("load not exist key from cache : " + loadingCache.get("email").orNull());
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
{% endraw %}
{% endcodeblock %}
我们逐行进行解释： 

- `expireAfterWrite(3, TimeUnit.SECONDS)`定义缓存3秒过期
- `removalListener`用来监听当缓存里面的`key`被移除时候触发的事件
- `build(new CacheLoader<String, Optional<String>>() `传入一个`CacheLoader`类，指定缓存中没有的时候调用如下方法.
- `Optional`当`CacheLoader`尝试获取数据库中不存在的数据会抛出异常，所以我们这里使用`Optional`可空对象处理一下。
- `Thread.sleep(2000);`缓存我们设置3秒过期，所以两次`Sleep`以后就会重新获取数据库。
运行输出结果如下，证明了再第三次获取的时候因为缓存过期了，所以需要重新在`MockDB`获取数据：
```sh
load key from persistence : github
load from cache once : codedrinker
load from cache twice : codedrinker
cache expired, remove key : github
load key from persistence : github
load from cache third : codedrinker
load key from persistence : email
load not exist key from cache : null
```

## Callable
这里我们依然需要使用上面的`MockDB`类，具体代码如下。
{% codeblock lang:java GuavaCallableCache.java%}
{% raw %}
public class GuavaCallableCache {
    public static void main(String[] args) {
        final String key = "github";
        Cache<String, Optional<String>> cache = CacheBuilder.newBuilder()
                .expireAfterWrite(3, TimeUnit.SECONDS)
                .removalListener(new RemovalListener<String, Optional<String>>() {
                    @Override
                    public void onRemoval(RemovalNotification<String, Optional<String>> notification) {
                        System.out.println("cache expired, remove key : " + notification.getKey());
                    }
                }).build();
        try {
            Optional<String> optional;
            System.out.println("load from cache once : " + cache.get(key, new Callable<Optional<String>>() {
                @Override
                public Optional<String> call() throws Exception {
                    return Optional.fromNullable(MockDB.loadFromPersistence(key));
                }
            }).orNull());
            Thread.sleep(2000);
            System.out.println("load from cache twice : " + cache.get(key, new Callable<Optional<String>>() {
                @Override
                public Optional<String> call() throws Exception {
                    return Optional.fromNullable(MockDB.loadFromPersistence(key));
                }
            }).orNull());
            Thread.sleep(2000);
            System.out.println("load from cache third : " + cache.get(key, new Callable<Optional<String>>() {
                @Override
                public Optional<String> call() throws Exception {
                    return Optional.fromNullable(MockDB.loadFromPersistence(key));
                }
            }).orNull());
            Thread.sleep(2000);
            final String nullKey = "email";
            optional = cache.get(nullKey, new Callable<Optional<String>>() {
                @Override
                public Optional<String> call() throws Exception {
                    return Optional.fromNullable(MockDB.loadFromPersistence(nullKey));
                }
            });
            System.out.println("load not exist key from cache : " + optional.orNull());
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
{% endraw %}
{% endcodeblock %}
下面我们对程序进行解释，与上面例子唯一的不同就是没有在`build`的时候传入`CacheLoader`，而是在`cache.get`使用`Cache`的时候用传入`Callable`对象。这样做可以灵活配置每次获取的缓存源不一样，但是两种方案都各有好处，还是在使用的时候斟酌。
运行程序数据结果如下：
```sh
load key from persistence : github
load from cache once : codedrinker
load from cache twice : codedrinker
cache expired, remove key : github
load key from persistence : github
load from cache third : codedrinker
load key from persistence : email
load not exist key from cache : null
```

##总结
在设计Java分布式应用程序的时候，针对一些基本不变的数据，或者是变化不大然而使用非常频繁的数据可以考虑采用`Guava Cache`实现Java应用内存级别缓存。

##参考链接
[Guava Cache](https://github.com/google/guava/wiki/CachesExplained)
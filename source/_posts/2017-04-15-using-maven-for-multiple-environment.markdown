---
layout: post
title: "安全的使用Maven实现不同环境配置文件的部署"
date: 2017-04-15 19:30:35 +0800
comments: true
description: Maven Filter介绍和用法,Maven Profile介绍和用法,使用Maven的Filter和Profile实现项目的多环境部署,Maven的Profile优先级源码分析
keywords: 安全的使用Maven实现不同环境配置文件的部署,安全的使用Maven实现生产环境和测试环境配置分离,Maven 打包实现生产环境与测试环境配置分离,maven打包,Maven针对不同的环境使用Profile完成打包部署,Maven 区分开发环境和测试环境配置,maven profile实现多环境打包,maven profile实现机制,使用maven profile properties 实现环境配置文件分离,maven settings.xml 优先级,maven settings.xml 安全打包,maven settings.xml 实现生产环境分离
---

##前言
每一个项目都有许多部署环境，诸如开发环境，测试环境，沙盒环境，线上环境，有的项目还会更多。每一个环境都有自己独有的配置文件，比如数据库连接地址，静态资源的访问地址等等。那么如何优雅的分离这些配置文件是首要任务。目前已有的技术可以轻松的搞定这件事情，比如 Spring 的 [Profile](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-profiles.html)，Maven 的 [Profile](http://maven.apache.org/guides/introduction/introduction-to-profiles.html)，但是有的时候我们为了方便，直接把这些配置文件都放在了`Project`里面，这样增加了项目的风险，也不便于管理。那么接下来我们就想来一个优雅的方法使用 `Maven Profile` 安全分离配置文件。
<!-- more -->
##Filter
`Maven Filter`可以支持将写到 `settings.xml`, `pom.xml`, 或是自定义 `*.properties` 文件里面的 `properties` 在 `build` 的时候自动替换指定目录配置文件里面的`占位符`，以实现动态指定配置。基本配置如下：   
我们在`resources` 目录有一配置文件 `src/main/resources/config.properties` 包含如下内容(*如果使用`Spring-boot`需要把 `${username}` 替换为 `@username@`*)    
```properties src/main/resources/config.properties
GitHub : ${username}
```
POM文件如下，用来指定资源的存放路径和是否使用`filter`：
```xml ${project}/pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.codedrinker</groupId>
    <artifactId>maven-env-deploy</artifactId>
    <version>1.0-SNAPSHOT</version>

    <name>My Resources Plugin Practice Project</name>

    <properties>
        <username>codedrinker</username>
    </properties>
    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering><!--至关重要-->
            </resource>
        </resources>
    </build>
</project>
```
运行命令
```sh
mvn resources:resources
#这里同样可以使用 mvn clean compile，只是resources不会编译代码，只会构建资源文件，这样更方便我们调试
```
在 `target/classes/config.properties` 查看文件内容，已经变化了。
```properties target/classes/config.properties
GitHub : codedrinker
```

## Profile

`Profile` 可以让我们根据不同的环境，定义不同的 `properties`。配置如下： 

```xml ${project}/pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.github.codedrinker</groupId>
    <artifactId>maven-env-deploy</artifactId>
    <version>1.0-SNAPSHOT</version>

    <name>My Resources Plugin Practice Project</name>

    <profiles>
        <profile>
            <id>sandbox</id>
            <properties>
                <username>codedrinker</username>
            </properties>
        </profile>
        <profile>
            <id>dev</id>
            <properties>
                <username>majiang</username>
            </properties>
        </profile>
    </profiles>
    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering><!--至关重要-->
            </resource>
        </resources>
    </build>
</project>
```
运行
```sh
mvn resources:resources -P sandbox
```
结果如下
```
GitHub : codedrinker
```
运行
```
mvn resources:resources -P dev
```
结果如下
```
GitHub : majiang
```
这样就实现了在不同环境部署不同的配置文件了。但是接下来问题来了，这样如果我们存储了用户名密码等信息，也会随着项目一起提交。这时候 `Maven` 的 `settings.xml` 就派上用场了。

##Settings.xml
正好 `settings.xml` 可以包含`profiles`，那么我们直接把对应的配置放进来不就可以了吗？有两个地方包含`settings.xml`：

- Maven的安装目录 `${maven.home}/conf/settings.xml`
- 用户的目录 `${user.home}/.m2/settings.xml`    

前者是全局的设置，后者是用户的设置，官方文档中指出如果两个都有设置，会以用户为主进行合并。但是我并不清楚它的合并力度，于是做了如下实验

系统配置
```xml ${maven.home}/conf/settings.xml
	<!-- 系统配置 -->
    <profile>
        <id>sandbox</id>
        <properties>
            <username>majiang</username>
            <password>majiang</password>
            <website>http://www.majiang.life</website>
        </properties>
    </profile>
```
用户配置
```xml ${user.home}/.m2/settings.xml
	<!-- 用户配置 -->
    <profile>
            <id>sandbox</id>
            <properties>
                <username>codedrinker</username>
                <password>codedrinker</password>
            </properties>
    </profile>
```
config.properties
```properties src/main/resources/config.properties
username : ${username}
password : ${password}
website : ${website}
```
再次运行命令以后的结果
```properties target/classes/config.properties
username : codedrinker
password : password
website : ${website}
```
令人奇怪的事情发生了，编译的结果确实以`用户级settings.xml`为准，但是`系统级settings.xml`里面额外配置的`website`并没有编译。于是我就带着这个疑问看了一下Maven的源码：
本身 `Maven` 定义了一个 `Profile` 类用来映射每一个`profile`，该类有一个`properties`属性，用来存放当前`profile`的配置：
```java
    /**
     * Field properties.
     */
    private java.util.Properties properties;
```
在读取配置文件的时候，直接读取`properties`，没有其他处理
```java SettingsXpp3Reader.java
else if ( checkFieldWithDuplicate( parser, "properties", null, parsed ) )
            {
                while ( parser.nextTag() == XmlPullParser.START_TAG )
                {
                    String key = parser.getName();
                    String value = parser.nextText().trim();
                    profile.addProperty( key, value );
                }
            }
```
关键在于`以用户的settings为主，合并配置的逻辑`，他的逻辑是如果`profile.id`不相同才会合并到`用户级别的settings`，不会深度的比较。于是这个问题是无解的，他所说的`以用户级settings.xml`为主指的是每一个配置，里面的每一个`property`是不被合并的。
```java MavenSettingsMerger.java
private static <T extends IdentifiableBase> void shallowMergeById( List<T> dominant, List<T> recessive,
                                                                       String recessiveSourceLevel )
    {
        Map<String, T> dominantById = mapById( dominant );

        for ( T identifiable : recessive )
        {
            if ( !dominantById.containsKey( identifiable.getId() ) )
            {
                identifiable.setSourceLevel( recessiveSourceLevel );

                dominant.add( identifiable );
            }
        }
    }
```
所以我们想同时使用系统和用户级别的`settings`的时候，需要格外注意这一点。

##POM.xml
文档中并没有明确说明项目中的`pom.xml`文件和`系统`，`用户`级别的`settings.xml`的优先级，但是经测试写在项目里面的配置文件，会直接编译到指定的`config.properties`里面，并且他会把独有的属性也编译到文件。

##总结
所以最终的结果

- 非安全性的配置文件，直接配置到项目的`pom.xml`里面。
- 安全性质的配置文件，配置到`用户级别的settings.xml`。
- `系统级别的settings.xml`做一些系统级别的配置，不轻易使用，和用户区分开来。

##参考链接
[Filter](https://maven.apache.org/plugins/maven-resources-plugin/examples/filter.html)  
[Profile](http://maven.apache.org/guides/introduction/introduction-to-profiles.html)  
[howto-properties-and-configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto-properties-and-configuration.html)   
[Settings.xml](https://maven.apache.org/settings.html)  


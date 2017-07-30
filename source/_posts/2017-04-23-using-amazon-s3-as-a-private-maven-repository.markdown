---
layout: post
title: "基于Amazon S3 搭建 Maven 私有仓库"
date: 2017-04-23 22:34:22 +0800
comments: true
categories: Maven
description: 基于Amazon IAM权限认证，使用S3搭建私有Maven中央仓库
keywords: Using Amazon S3 as a Private Maven Repository, 基于Amazon S3 搭建 Maven 私有仓库, Maven 私有仓库, Maven 仓库, Maven 私服搭建,Maven(创建私有仓库和设置权限)，Maven私有仓库，设置权限，加密，密码
---

##前言
最近项目慢慢变大，从一个模块，变成了十几个模块，有的模块是被其他模块依赖的，有的模块是可以单独部署的。如果继续在一个项目里面太臃肿了，也不方便维护，所以想着借着这个机会把项目分离开来，有一些模块可以直接作为公共组件使用。本身项目就是使用的`Maven`作为构建工具的，所以想着直接把模块提取出来，构建成可以通过`Maven`依赖的`jar`文件。然后发布到`Maven`仓库就可以轻松使用了。带着这个梦想，我们进入主题：
<!-- more -->
##方案

- 直接发布到`sonatype`的中心仓库`http://central.sonatype.org/`或者类似公有仓库。   
不可行，原因是这样涉及到业务的代码也公开了，所以不能`Publish`到`Maven`的公有仓库。

- 搭建自己的`sonatype`仓库  
不可行，原因是虽然搭建的`Maven`仓库是我们自己的，但是下载是公开的，还是不能解决我们的安全问题。

- 基于`Amazon S3` 搭建`Maven` 私有仓库  
可行，使用 `Amazon S3` 作为`Maven` 数据的存储中心，安全性依赖于其本身的安全认证，这样我们既有了存储，也有了安全保障。

##配置`Amazon S3`秘钥
正常访问`S3`我们都需要使用`S3`的`Access key ID`和`Secret access key`，无论是通过`CLI`还是`JAVA`。使用`Maven`也一样，我们需要配置`S3`的秘钥到`Maven`的配置文件里面`~/.m2/settings.xml`，如果还没有创建这个文件，使用系统级别的配置文件`$MAVEN_HOME/conf/settings.xml`也可以。具体配置如下：
```xml $MAVEN_HOME/conf/settings.xml
 <servers>
        <server>
            <id>aws-release</id>
            <username>AKIAJ*******</username>
            <password>TyXar*******</password>
        </server>
        <server>
            <id>aws-snapshot</id>
            <username>AKIAJ*******</username>
            <password>TyXar*******</password>
        </server>
    </servers>
```

##配置要发布到`Maven`仓库的项目
配置要发布到`Maven`仓库的项目，一般直接在`POM.xml`里面配置到发布的地址就可以了，但是本身`Maven`是不支持`S3`，所以这里引入了一个第三方的工具，用来发布`jar`到`S3`仓库的。[Spring-Aws-Maven](https://github.com/spring-projects/aws-maven)，具体的配置如下：
```xml pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.codedrinker</groupId>
    <artifactId>maven-s3-lib</artifactId>
    <version>1.0.1</version>

    <distributionManagement>
        <repository>
            <id>aws-release</id>
            <name>AWS Release Repository</name>
            <url>s3://nexus-repository/release</url>
        </repository>
        <snapshotRepository>
            <id>aws-snapshot</id>
            <name>AWS Snapshot Repository</name>
            <url>s3://nexus-repository/snapshot</url>
        </snapshotRepository>
    </distributionManagement>
    <build>
        <extensions>
            <extension>
                <groupId>org.springframework.build</groupId>
                <artifactId>aws-maven</artifactId>
                <version>5.0.0.RELEASE</version>
            </extension>
        </extensions>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>2.2.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>jar-no-fork</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>2.9.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
        <sourceDirectory>src/main/java</sourceDirectory>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
</project>
```
下面我们逐行进行解释
```xml pom.xml
<distributionManagement>
    <repository>
        <id>aws-release</id>
        <name>AWS Release Repository</name>
        <url>s3://nexus-repository/release</url>
    </repository>
    <snapshotRepository>
        <id>aws-snapshot</id>
        <name>AWS Snapshot Repository</name>
        <url>s3://nexus-repository/snapshot</url>
    </snapshotRepository>
</distributionManagement>
```
是为了指定发布地址，这里我们指定的是`S3`的`bucket`地址`nexus-repository`，当然我们需要区分`release`和`snapshot`的位置。需要注意的是这里的`id`需要和`server`里面的`id`相对应。
```xml pom.xml
<extensions>
    <extension>
        <groupId>org.springframework.build</groupId>
        <artifactId>aws-maven</artifactId>
        <version>5.0.0.RELEASE</version>
    </extension>
</extensions>
```
这句话是关键，它就是当我们运行`mvn deploy`的时候，`extension`会通过调用`Amazon S3`的`SDK`把我们的内容自动`Build`成`Maven`的格式上传到`S3`。

```xml pom.xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <version>2.2.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>jar-no-fork</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.9.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>jar</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
这两个插件是为了发布代码的时候，构建源码和文档，一起发布上去。这样如果开发人员没有下载原始项目，也可以通过文档和源码做简单的排查。  
这样我们就配置好了，最后直接在项目目录运行`mvn deploy`命令，等待运行成功，如果配置没有问题的话，一会儿我们会看到`S3`的目录有如下结构，这说明我们已经成功发布`jar`。
![S3](/images/posts/s3.png)
![Tree](/images/posts/tree.png)

##配置需要依赖`jar`的项目
项目已经发布成功，我们这个时候就配置依赖它的项目。使用的时候相对配置就简单多了，具体配置如下：
```xml pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.github.codedrinker</groupId>
    <artifactId>maven-s3-app</artifactId>
    <version>1.0.0</version>
    <repositories>
        <repository>
            <id>aws-release</id>
            <name>AWS Release Repository</name>
            <url>s3://nexus-repository/release</url>
        </repository>
        <repository>
            <id>aws-snapshot</id>
            <name>AWS Snapshot Repository</name>
            <url>s3://nexus-repository/snapshot</url>
        </repository>
    </repositories>
    <dependencies>
        <dependency>
            <groupId>com.github.codedrinker</groupId>
            <artifactId>maven-s3-lib</artifactId>
            <version>1.0.1</version>
        </dependency>
    </dependencies>
    <build>
        <extensions>
            <extension>
                <groupId>org.springframework.build</groupId>
                <artifactId>aws-maven</artifactId>
                <version>5.0.0.RELEASE</version>
            </extension>
        </extensions>
    </build>
</project>
```
下面我们逐行进行解释：
```xml pom.xml
<repositories>
        <repository>
            <id>aws-release</id>
            <name>AWS Release Repository</name>
            <url>s3://nexus-repository/release</url>
        </repository>
        <repository>
            <id>aws-snapshot</id>
            <name>AWS Snapshot Repository</name>
            <url>s3://nexus-repository/snapshot</url>
        </repository>
</repositories>
```
如上是在指定仓库，当然路径也应该是`S3`的地址，这个时候我们也是需要使用`settings.xml`里面配置的秘钥的，如果你担心没有秘钥也能下载，可以尝试删除秘钥和存在秘钥两种情况下下载依赖。
```xml pom.xml
<extensions>
            <extension>
                <groupId>org.springframework.build</groupId>
                <artifactId>aws-maven</artifactId>
                <version>5.0.0.RELEASE</version>
            </extension>
</extensions>		
```
如上，下载的时候也是基于`S3`在操作，所以一样需要这个第三方工具。到此为止我们已经配置好了，需要注意的是，如果在你本机发布的上面的项目，会在`~/.m2`目录已经生成了`maven-s3-lib`的数据，所以我们必须手动删除这个目录，再运行`mvn clean compile`，看是否重新下载`jar`并且下载成功。如果不想去`~/.m2`目录删除的话，直接添加参数也是可以实现不使用本地缓存，重新获取`jar`的，命令：`mvn compile dependency:purge-local-repository`。
>**注意：** 单纯运行`mvn compile`不会下载源码，`IDE`也没有那么强大知道我们使用的是第三方工具，他会直接去`Maven`中心仓库去下载，所以我们需要使用命令下载源码`mvn dependency:sources`，然后`reload`到项目中。

##读写分离
这里的读写分离并不是环境的读写分离，而是发布，因为不可能每一个人都有发布的权限，如果做细致的话，只有打包的机器有发布的权限，其他人都是只有下载`jar`的权限，所以我们这里一样可以通过`AWS`的权限系统做控制。  

`AWS`有一个叫做`IAM`的东西，他是专门用来控制权限的服务，很强大。我们可以直接在`IAM`里面创建两个`Policy`，[文档地址](http://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/access_policies.html)，一个用来写，一个只能读，他可以强大到指定到`bucket`，这样大大的提高了安全性。下面是具体的配置，如果有不明的的可以参照官方文档，很详细。  

读写，关键在于`s3:Put*`可以做任何更新操作：
```json IAM PUT 配置
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1492711190***",
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:List*",
                "s3:Put*"
            ],
            "Resource": [
                "arn:aws:s3:::nexus-repository"
            ]
        },
        {
            "Sid": "Stmt1492711145***",
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:List*",
                "s3:Put*"
            ],
            "Resource": [
                "arn:aws:s3:::nexus-repository/*"
            ]
        }
    ]
}
```
只读，只有`Get`和`List`操作：
```json IAM GET 配置
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1492751111***",
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::nexus-repository"
            ]
        },
        {
            "Sid": "Stmt1492751111***",
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::nexus-repository/*"
            ]
        }
    ]
}
```
同时呢，分别创建两个`User`，分别为他们创建AppKey，并且分别`Attach`上面已经创建好的两个`Policy`，这样就大功告成了。

##总结
使用`Amazon S3`搭建`Maven`中心仓库，方便又安全，有这方面需求的朋友可以试试。

##参考链接
[aws-maven](https://github.com/spring-projects/aws-maven)    
[Sharing classes or interfaces between different projects](https://softwareengineering.stackexchange.com/questions/231175/sharing-classes-or-interfaces-between-different-projects)    
[Using Amazon S3 as a Private Maven Repository](http://jmchung.github.io/blog/2015/03/01/using-amazon-s3-as-a-private-maven-repository/)   
[Aws Policy](http://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/access_policies.html)
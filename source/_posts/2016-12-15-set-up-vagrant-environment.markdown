---
layout: post
title: "Vagrant 私有开发环境搭建"
date: 2016-12-15 01:28:27 +0800
comments: true
categories: 
---

##前言
服务器端开发工程师的一个痛点就是各种搭建环境，尤其是对于我们这种特别爱捯饬技术，搭建环境，升级应用版本的这类人。这样除了让我们忍受搭建各种版本的环境的繁琐兼容问题，还让自己的开发机变得越来越臃肿，为此本文介绍了一种使用`Vagrant`搭建一套集成的开发环境(镜像)的方案，不仅可以让团队开发人员的环境保持一致，同时使得开发机保持瘦身。  
当然也有缺点，不许要做好数据的保密性，不能让所有的开发人员的镜像都有一些生产数据。  
下面我们就直接进入正题，搭建一个可以升级的本地环境。

##安装vagrant和virtual box
访问`Vagrant`官网(https://www.vagrantup.com/)，下载并安装。  
访问`VirtualBox`官网(https://www.virtualbox.org/)，下载并安装。

##安装开发环境
`Vagrant`的基本单元叫做box，我们可以理解为镜像，首先我们需要添加一个`Vagrant`公开的镜像到我们本地，用来搭建环境。  
我选择的是一个ubuntu镜像，下面的操作我们可以理解为下载镜像。
```
vagrant box add hashicorp/precise64
```
提示选择哪一种方式，我们这里选择的是virtualbox，我们刚刚已经安装了。
```
box: URL: https://atlas.hashicorp.com/hashicorp/precise64
This box can work with multiple providers! The providers that it
can work with are listed below. Please review the list and choose
the provider you will be working with.

1) hyperv
2) virtualbox
3) vmware_fusion

Enter your choice: 2
```
初始化本地开发环境，我们可以理解为安装镜像。
```
vagrant init hashicorp/precise64
```
运行本地开发环境
```
vagrant up
```
ssh到本地开发环境
```
vagrant ssh
```
如果能进入刚才安装的系统，那么说明我们安装成功。因为设置了免密钥登录，所以直接输入就可以登录。
> **注意：**切记，是在你的`Vagrantfile`目录执行`Vagrant`相关命令),
如果需要关闭系统，可以输入如下命令
```
vagrant halt
```
>**参考文档：** https://www.vagrantup.com/docs/getting-started/

##配置开发环境
具体的搭建环境根据自身的项目决定，我这里只通过安装tomcat举例。
官方网站下载tomcat，放到指定目录，我这里直接放在了我的`~/`home目录。
```
wget http://apache.fayea.com/tomcat/tomcat-8/v8.5.9/bin/apache-tomcat-8.5.9.tar.gz
```
解压tomcat
```
tar -zxvf apache-tomcat-8.5.9.tar.gz
```
为了让我们本地开发机也能访问到`Vagrant`里面的tomcat，我们需要配置转发端口。需要在`config.vm.box = "hashicorp/precise64"`下面添加：
```
config.vm.network "forwarded_port", guest: 8080, host: 8080
```
修改了配置文件以后，reload才能生效
```
vagrant reload
```
运行tomcat
```
sh ~/apache-tomcat-8.5.9/bin/catalina.sh start
```
在我们开发机打开浏览器，输入`http://localhost:8080`，我们就能看到Tomcat的欢迎页了，配置环境成功。

>**参考文档：** https://www.vagrantup.com/docs/getting-started/networking.html

##打包开发环境
截止到目前假设我们自己的开发环境已经搭建完成，那么我们需要把搭建好的开发环境分发给其他开发人员。这个时候就需要打包一个开发环境，主要就是把我们已经处理好的开发环境打包成一个*.box文件，这样便可以使用`Vagrant`进行安装了。
在`Vagrant`目录输入如下命令打包镜像:
```
vagrant package --output mermaid.box --vagrantfile Vagrantfile
```
- **--output：**打包的名字，做程序需要美人的陪伴，于是我起了一个响亮的名字;
- **--vagrantfile：**设置这个参数以后，就可以把刚才我配置到`Vagrantfile`里面的配置打近包里面，这样其他开发人员下载镜像的时候就不需要重新配置了。  

这个时间有点长，我们慢慢的等他结束。
>**参考文档：** https://www.vagrantup.com/docs/cli/package.html

##搭建私有镜像仓库并发布镜像
我们要找一个大家都能下载并且外人不能访问的地方，所以我们选择搭建一个私有的镜像仓库。我在内网找了一个linux的服务器，IP地址是`192.168.1.137`，方便下文我们对应。在上面安装一个Nginx，方便我们可以直接通过URL访问相应的资源。
在Nginx的根目录，创建vagrant文件夹，在vagrant文件夹下面在创建boxes文件夹。在vagrant目录添加mermaid.json文件，用于存放box的metadata信息。同时把我们刚才的mermaid.box放到boxes下面，并命名为mermaid.0.1.0.box，以便稍后的升级测试。
具体目录结构如下：
```
work@dev:/var/www/html$ tree
.
|-- index.nginx-debian.html
`-- vagrant
    |-- boxes
    |   |-- mermaid.0.1.0.box
    `-- mermaid.json
```
mermaid.json  里面具体内容如下:
```
{
  "name": "mermaid",
  "description": "mermaid dev environment",
  "versions": [
    {
      "version": "0.1.0",
      "providers": [
        {
          "name": "virtualbox",
          "url": "http://192.168.1.137/vagrant/boxes/mermaid.0.1.0.box",
          "checksum_type": "sha1",
          "checksum": "3badb9acb07992938d6415e67a8291d60f3aafe9"
        }
      ]
    }
  ]
}
```
基本配置都比较容易理解，注意的是checksum，需要把box上传到服务器的时候，使用
`sha1sum boxes/mermaid.0.1.0.box `生成一下checksum值。
配置都完成之后，我们测试访问`http://192.168.1.137/vagrant/mermaid.json`ok，那么表示我们配置成功。
>**参考文档：** http://softwaretester.info/create-private-vagrant-box-repository/

##通过私有镜像仓库安装开发环境
和最开始我们再`Vagrant`公有仓库安装的方式类似，首先我们准备一个全新的目录，我是使用的这个目录`~/mermaid`。
首先指定我们的私有仓库地址，添加一个镜像到本地。
```
vagrant box add mermaid http://192.168.1.137/vagrant/mermaid.json
```
出现如下提示，说明我们在正确的路上，如果是局域网这个步骤会很快。
```
==> box: Loading metadata for box 'http://192.168.1.137/vagrant/mermaid.json'
==> box: Adding box 'mermaid' (v0.1.0) for provider: virtualbox
    box: Downloading: http://192.168.1.137/vagrant/boxes/mermaid.0.1.0.box
    box: Calculating and comparing box checksum...
==> box: Successfully added box 'mermaid' (v0.1.0) for 'virtualbox'!
```
我们可以通过`vagrant box list`命令看一下是否安装成功
```
vagrant box list
mermaid        (virtualbox, 0.1.0)
```
由此可以看出来我们安装成功，那么进行下一步，安装镜像
```
vagrant init mermaid
```
重复之前的操作，运行开发环境，并ssh到开发环境
```
vagrant up
```
```
vagrant ssh
```
运行Tomcat
```
sh ~/apache-tomcat-8.5.9/bin/catalina.sh start
```
在开发机本地访问`http://localhost:8080`，看到欢迎页，说明我们本地安装成功啦，还不是庆祝的时候，还没有结束，我们接下来看看怎么升级每一个人的镜像。
>**参考文档：** http://softwaretester.info/create-private-vagrant-box-repository/

##添加新版本镜像到私有库
这个功能主要是我们对开发环境有了修改，需要其他的开发人员同时更新到最新的环境。
这次我们为开发环境安装一个Nginx，并且设置开机启动(具体步骤不累述)，然后配置`Vagrantfile`，添加80端口共享：
```
config.vm.network "forwarded_port", guest: 80, host: 80
```

按照`打包开发环境`步骤，重新打包一个新的mermaid.0.1.1.box上传到mermaid.0.1.0.box相同目录，如下图:
```
work@dev:/var/www/html$ tree
.
|-- index.nginx-debian.html
`-- vagrant
    |-- boxes
    |   |-- mermaid.0.1.0.box
    |   `-- mermaid.0.1.1.box
    `-- mermaid.json
```

修改mermaid.json文件，添加新的版本

```
{
  "name": "mermaid",
  "description": "mermaid dev environment",
  "versions": [
    {
      "version": "0.1.0",
      "providers": [
        {
          "name": "virtualbox",
          "url": "http://192.168.1.137/vagrant/boxes/mermaid.0.1.0.box",
          "checksum_type": "sha1",
          "checksum": "3badb9acb07992938d6415e67a8291d60f3aafe9"
        }
      ]
    },
    {
      "version": "0.1.1",
      "providers": [
        {
          "name": "virtualbox",
          "url": "http://192.168.1.137/vagrant/boxes/mermaid.0.1.1.box",
          "checksum_type": "sha1",
          "checksum": "99e6d7fc44cccabdfc6ed9ce178ca65fd9dcbac8"
        }
      ]
    }
  ]
}
```
配置完成。

>**参考文档：** http://softwaretester.info/create-private-vagrant-box-repository/

##更新镜像
进入mermaid目录，输入:
```
vagrant box outdated
```
提示显示已经有0.1.1版本，可以更新啦，那么我们直接输入如下命令更新，切记需要`vagrant halt`关闭虚拟机。
```
A newer version of the box 'mermaid' is available! You currently
have version '0.1.0'. The latest is version '0.1.1'. Run
`vagrant box update` to update.
```
```
vagrant box update
```
更新以后，访问localhost，出现`It’s work`字样。
至此已经全部完成。
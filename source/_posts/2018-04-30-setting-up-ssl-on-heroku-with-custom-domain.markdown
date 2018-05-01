---
layout: post
title: "Heroku 教程：自定义域名配置 HTTPS"
date: 2018-04-30 08:42:05 +0800
comments: true
categories: [HeroKu,HTTPS]
description: Heroku 自定义域名设置 HTTPS, Heroku 设置自定义域名 SSL 证书,为小程序域名配置 HTTPS
keywords: Heroku 自定义域名设置 HTTPS, Heroku 设置自定义域名 SSL 证书,为小程序域名配置 HTTPS
---
## 起源
本身 Heroku 的 app 域名是开始 SSL 的，但是因为他的域名为 appname.herokuapp.com，没有在国内备案，所以我们需要绑定一个国内备案的域名到 Heroku 上面。于是就有了下面的文章。

<!-- more -->

## 获取 SSL 证书
可以直接使用一些服务商购买域名 SSL 证书，或者用其他的方式自己生成。下面我们讲解一下怎么生成。
### 生成私有 Key
 

  系统  | 安装方式
-------|--------
Mac OS X | Homebrew: `brew install openssl`
Windows   | [Windows complete package .exe installer](http://slproweb.com/products/Win32OpenSSL.html) 
Ubuntu Linux | `apt-get install openssl` 


Heroku 只支持 RSA，下面我们直接运行命令
```bash
openssl genrsa -des3 -out server.pass.key 2048

```
输入如下命令获取`server.key`
```bash
openssl rsa -in server.pass.key -out server.key
```

### 生成 CSR
CSR是证书签名请求，需要使用上一步生成的私有 Key 进行生成。这个时候需要输入 Country Name 和 Common Name，格式如下

  字段  | 内容
-------|--------
Country Name	| [ISO 3166](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 格式的简码
Common Name  | www.example.com,*.example.com 需要注意的是这个名字必须和使用的保持一致

输入如下命令生成 CSR
```
openssl req -nodes -new -key server.key -out server.csr
```

### 生成 CRT

CRT 一般都是找签发 SSL 的机构签发，大部分是收费的，也有免费的，如果不找 SSL 机构签发，可以按照下面的方式自己生成，不过自己生成的证书可以使用，只是默认是不信任的，需要用户自己认证。通常情况生成的证书为 CRT 或者 PEM格式的。

```bash
openssl req -new -x509 -key server.key -out ca.crt -days 3650
```
这个证书用来给自己的证书签名，下面是创建服务器证书
```bash
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt

```

笔者购买的是阿里云的域名，其默认支持生成3个免费的域名，而且使用他的生成，默认是信任的。直接通过阿里云控制台生成然后下载使用即可，可以省略上面的步骤。

## 配置 Heroku
### 创建插件
```bash
heroku addons:create ssl:endpoint
```
### 添加证书
```
heroku certs:add server.crt server.key --type endpoint
```
运行完命令会为你分配一个新的 SSL 域名，需要你后面做绑定使用。
```
appname now served by iiii-65701.herokussl.com
```

### 修改证书
如果后面更新了证书，可以使用如下命令修改证书。
```
heroku certs:update server.crt server.key --endpoint example-2121.herokussl.com
```

## 配置域名
### 添加域名
直接使用如下命令配置刚才你输入的域名
```
heroku domains:add www.example.com
```
如果是配置域名，更多详情可以参照  
[Heroku 教程：绑定自定义域名](/blog/heroku-custom-domains/?utm_source=rel)

### 配置DNS 
这个时候需要配置一下 DNS 创建一个 CNAME 指向 Heroku，这个时候就需要指向到我们刚才生成的,`iiii-65701.herokussl.com`。


## 验证
等待一会儿以后可以使用如下命令检测一下是否配置成功
```
curl -kvI https://www.example.com
* About to connect() to www.example.com port 443 (#0)
*   Trying 50.16.234.21... connected
* Connected to www.example.com (50.16.234.21) port 443 (#0)
* SSLv3, TLS handshake, Client hello (1):
* SSLv3, TLS handshake, Server hello (2):
* SSLv3, TLS handshake, CERT (11):
* SSLv3, TLS handshake, Server finished (14):
* SSLv3, TLS handshake, Client key exchange (16):
* SSLv3, TLS change cipher, Client hello (1):
* SSLv3, TLS handshake, Finished (20):
* SSLv3, TLS change cipher, Client hello (1):
* SSLv3, TLS handshake, Finished (20):
* SSL connection using AES256-SHA
* Server certificate:
*    subject: C=US; ST=CA; L=SF; O=SFDC; OU=Heroku; CN=www.example.com
*    start date: 2011-11-01 17:18:11 GMT
*    expire date: 2012-10-31 17:18:11 GMT
*    common name: www.example.com (matched)
*    issuer: C=US; ST=CA; L=SF; O=SFDC; OU=Heroku; CN=www.heroku.com
*    SSL certificate verify ok.
GET / HTTP/1.1
User-Agent: curl/7.19.7 (universal-apple-darwin10.0) libcurl/7.19.7 OpenSSL/0.9.8r zlib/1.2.3
Host: www.example.com
Accept: */*
...
```

## 参考文档
[Heroku 官方配置](https://devcenter.heroku.com/articles/ssl-endpoint#acquire-ssl-certificate)
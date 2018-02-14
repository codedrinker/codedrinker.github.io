---
layout: post
title: "基于 Amazon SES 搭建高可用的邮件系统"
date: 2018-02-14 14:22:55 +0800
comments: true
categories: [AWS]
description: 基于 Amazon SES 搭建高可用的邮件系统,配置 Route53,使用 volecity 创建邮件模板,避免发送到垃圾箱
keywords: 基于 Amazon SES 搭建高可用的邮件系统,配置 Route53,使用 volecity 创建邮件模板,避免发送到垃圾箱
---
## 简介
通常情况下我们使用 smtp 调用第三方的 api 发送邮件，但是 gmail 一天只能发送100封，这对于营销邮件来说无疑是非常大的影响。所以考虑两种方案，第一种自己搭建邮件服务器，这种方案耗费时间并且需要额外的服务器成本。第二种方案使用 Amazon SES 搭建有限服务。简单方便并且 Amazon 本身也做了一些优化。
<!-- more -->
## 域名准备

### 购买域名
这一步不在本文的范围只，但是你需要需要准备好一个域名。
### 托管域名到 Route53
Route53 是Aws的 DNS，不托管用自己的也行，用他的一个方便之处是配置SES的时候他会很好的给你继承好，省去好多自己配置的麻烦。不过本身托管域名也需要配置，所以这里自行考虑是否托管域名到Route53。如需配置如下是配置文档。
https://docs.aws.amazon.com/zh_cn/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html  
如果是gmail，在gmail的服务里面也会明确的写着怎么迁移。 
通常情况下如下输入记录到Route53作为验证。
```
ns-***.awsdns-49.net.
ns-***.awsdns-50.org.
ns-***.awsdns-22.co.uk.
ns-***.awsdns-59.com.
```
## 配置 Amazon SES
进入aws 控制台，进入Simple Email Service(SES)，点击 domains -> Verify a New Domain。
 

### Route53 域名配置
如果是Route53 托管的域名，他会直接提示你是否创建关联到Route53，直接点击关联就好了。关联主要分为几个方便，验证，DKIM，SPF验证。说简单一点就是验证这个域名是你的，验证这个邮箱地址发送是合法的，避免一些成为垃圾邮件的可能性。
### 非 Route53 域名配置
如果是非 Route53 域名也没有关系，他也会按步骤提示你配置一个TXT，和三个CNAME到你的DNS就可以。

### 等待验证
配置完成之后需要有一定的时间验证，等待验证成功之后会标记为验证通过，这个时候就可以进行下面的编码。

## 程序实现
### 添加依赖
首先需要添加两个aws的依赖，一个是通用的一个是ses的，  
另外需要配置一个把富文本解析成普通文本的工具，下文会有更详细的解释，  
最后配置一个velocity依赖，用于生成邮件模板。
```xml
<dependency>
    <artifactId>aws-java-sdk-ses</artifactId>
    <groupId>com.amazonaws</groupId>
    <optional>false</optional>
    <version>1.11.95</version>
</dependency>
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.11.95</version>
</dependency>
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.10.2</version>
</dependency>
<dependency>
    <groupId>velocity</groupId>
    <artifactId>velocity</artifactId>
    <version>1.5</version>
</dependency>
```
### 创建模板
本文采用velocity生成邮件模板，好处就不说了。主要使用velocity的模板引擎生成邮件模板。  
[官方文档](http://velocity.apache.org/engine/1.7/developer-guide.html) [中文文档](https://www.ibm.com/developerworks/cn/java/j-lo-velocity1/)

#### 创建template.vm
首先在 resouces下面创建一个 email-template.vm，因为测试内容比较简单，当然这里面可以编写html文档。内容如下
{% codeblock lang:html %}
{% raw %}
<table>
    <tr>
        <td>${title}</td>
    </tr>
    <tr>
        <td>${name}</td>
    </tr>
    <tr>
        <td>${content}</td>
    </tr>
</table>
{% endraw %}
{% endcodeblock %}
#### 构建模板
直接使用 volecity 的模板引擎加载上面的 vm 模板，然后生成即可，具体代码如下。
{% codeblock lang:java %}
{% raw %}
public class EmailTemplateUtils {
    @Data
    public static class EmailEntity {
        private String title;
        private String name;
        private String content;
    }

    public static String generate(EmailEntity emailEntity) {
        VelocityEngine velocityEngine = new VelocityEngine();
        velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
        velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());
        try {
            velocityEngine.init();
            Template template = velocityEngine.getTemplate("email-template.vm", "UTF-8");
            VelocityContext context = new VelocityContext();
            context.put("title", emailEntity.getTitle());
            context.put("name", emailEntity.getName());
            context.put("content", emailEntity.getContent());
            StringWriter writer = new StringWriter();
            template.merge(context, writer);
            return writer.toString();
        } catch (Exception e) {
            return null;
        }
    }

    public static void main(String[] args) {
        EmailEntity emailEntity = new EmailEntity();
        emailEntity.setTitle("email title");
        emailEntity.setContent("email content");
        emailEntity.setName("email name");
        String generate = generate(emailEntity);
        System.out.println(generate);
    }
}
{% endraw %}
{% endcodeblock %}
直接运行程序会得到如下，输出表示已经配置成功，稍后将其配置成自己的邮件模板的样子就行了。
{% codeblock lang:html %}
{% raw %}
<table>
    <tr>
        <td>email title</td>
    </tr>
    <tr>
        <td>email name</td>
    </tr>
    <tr>
        <td>email content</td>
    </tr>
</table>
{% endraw %}
{% endcodeblock %}
### 发送邮件
发送邮件功能主要是调用 Amazon SES 的工具包发送，代码比较简单，直接阅读代码即可。
{% codeblock lang:java %}
{% raw %}
public class AmazonSESProvider {
    private static EmailResult sendEmail(String from, String subject, String body, String[] addrs) {
        Destination destination = new Destination().withToAddresses(addrs);
        Content mailSubject = new Content().withData(subject);
        Content html = new Content().withData(body);
        String textPlain = Jsoup.parse(body).text();
        Body htmlBody = new Body().withHtml(html).withText(new Content().withData(textPlain));
        Message message = new Message().withSubject(mailSubject).withBody(htmlBody);
        SendEmailRequest request = new SendEmailRequest().withSource(from).withDestination(destination).withMessage(message);

        try {
            BasicAWSCredentials awsCreds = new BasicAWSCredentials("key", "secret");
            AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(awsCreds);
            client.setRegion(Region.getRegion(Regions.US_WEST_2));
            client.sendEmail(request);
            logger.info("send:succeed,address->{}", addrs);
            return EmailResult.success();
        } catch (AmazonServiceException e) {
            if ("Throttling".equals(e.getErrorCode())) {
                logger.error("send:failure,addrs->{}", addrs);
                logger.error("error : Max for the rate!");
            } else {
                logger.error("send:failure,addrs->{}", addrs);
                logger.error("error : ", e);
            }
            return EmailResult.failure(e.getMessage());
        } catch (Exception ex) {
            logger.error("send:failure,addrs->{}", addrs);
            logger.error("error : ", ex);
            return EmailResult.failure(ex.getMessage());
        }
    }

    public static void main(String[] args) {
        sendEmail("fromaddress@gmail.com", "email subject", "Test email from codedrinker", new String[]{"toaddress@gmail.com"});
    }
}
{% endraw %}
{% endcodeblock %}
主要发送的逻辑就是创建Amazon 的Client，然后调用发送邮件，主要注意的是如下语句 

```java
Jsoup.parse(body).text();
```

我们传递过来的body是 html 类型的，我们需要生成一个纯文本类型的，这样可以保证邮件接收者不能预览富文本类型的时候有一个纯文本预览，使用 Jsoup.parse 可以提取出来文本内容，这样可减少了邮件发送到垃圾箱的概率。具体关于邮件发送到垃圾箱的概率可以使用邮件测试网址进行进一步验证。[测试工具地址](https://www.mail-tester.com/)。

## 参考文献
[Amazon SES 文档](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/getting-started.html)  
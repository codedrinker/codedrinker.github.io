---
layout: post
title: "Commenthub —— 多说、网易云跟帖的替代品"
date: 2018-02-19 20:57:35 +0800
comments: true
keywords: 使用 GitHub Issues 搭建评论系统,Gitment 安全吗?,多说、网易云跟帖的替代品
categories: [Heroku,Octopress,Hexo]
---

## 前言
“多说”和“网易云跟帖”相继不维护了，每一次给大家带来了希望又带来了失望，于是 [Commenthub](https://github.com/codedrinker/commenthub) 出现了。Commenthub 是作者使用免费的服务 Heroku 和 Github Issues 结合起来做的一套开源的评论系统。其灵感源于 Gitment，但是 Gitment 的 Key 和 Secret 都存在浏览器端，这样对于安全也是一个问题，于是作者使用 Heroku 搭建后端服务用于处理业务和存储证书，通过 iframe 实现评论功能。
<!-- more -->
## 效果图
![Demo](/images/posts/commenthub1.png) 

## 演示地址
http://commenthub.github.io/  

## 功能介绍
Commenthub 目前只支持 Github 用户登录评论，同时也只支持 Github 用户为自己的博客添加评论功能。目前 Commenthub 支持 Markdown 语法，表情，手机和PC响应式布局。
## Octopress 接入
### 注册 commenthub 账号
访问 [Commenthub官网](http://commenthub.herokuapp.com/)，点击 Sign up，使用 Github 账号登录成功以后，点击 Set up，填写博客地址。同时记住 ID，后面需要使用。

### 配置 config.yml
在 config.yml 里面填写 commenthub_id，其内容就是上面说的ID，用于标记作者是谁。
```
commenthub_id: 3821949
```

### 配置显示位置
在 `_layouts/post.html` 的 article 标签下面添加如下代码，用来告诉 Commenthub，在什么地方显示评论功能。
{% codeblock lang:html %}
{% raw %}
{% if site.commenthub_id and page.comments == true %}
  <section>
    <h1>评论</h1>
    <div id="commenthub_thread" aria-live="polite"></div>
  </section>
{% endif %}
{% endraw %}
{% endcodeblock %}

### 创建 commenthub.html
创建 `includes/commenthub.html`，填入如下内容
{% codeblock lang:html %}
{% raw %}
{% comment %} Load script if commenthub comments are enabled and `page.comments` is either empty (index) or set to true {% endcomment %}
{% if site.commenthub_id and page.comments != false %}
<script type="text/javascript">
    var commenthub_id = '{{ site.commenthub_id }}';
    var commenthub_website = '{{ site.url }}';
    var commenthub_identifier = '{{ page.url }}';
    var commenthub_url = '{{ site.url }}{{ page.url }}';
    var commenthub_title = '{{ page.title }}';
    (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = 'https://commenthub.herokuapp.com/js/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    }());
</script>
{% endif %}
{% endraw %}
{% endcodeblock %}

### 引入 commenthub.html 
在 `includes/after_foot.html` 里面添加一行如下内容，用于引入 commenthub.html 文件
{% codeblock lang:html %}
{% raw %}
{% include commenthub.html %}
{% endraw %}
{% endcodeblock %}

### 完成
这样 Octopress 的配置就结束了，如果配置中遇到问题，可以在当前博客中评论留言，或者到 Github Issue 中留言。

## Hexo 接入
Hexo 使用的是比较热门的主题 Next。
### 注册 commenthub 账号
同上

### 配置 config.yml
配置 `themes/next/_config.yml` 文件，在里面的 Disqus 后面配置如下内容
```
commenthub:
  enable: true
  id: your_id
  site: your_website_url
```

### 配置显示位置
在`themes/next/layout/_partials/comments.swig`里面添加一行代码，记得注意看`elseif`的位置
{% codeblock lang:html %}
{% raw %}
  {% elseif theme.commenthub.enable %}
    <div class="comments" id="comments">
      <div id="commenthub_thread"></div>
    </div>
{% endraw %}
{% endcodeblock %}

### 创建 commenthub.swig
创建新文件`themes/next/layout/_third-party/comments/commenthub.swig`并贴入如下代码，如下代码主要是用于加载和生成评论的逻辑。
{% codeblock lang:html %}
{% raw %}
{% if not (theme.duoshuo and theme.duoshuo.shortname) and not theme.duoshuo_shortname %}
  {% if theme.commenthub.enable %}
      <script type="text/javascript">
        var commenthub_id = '{{ theme.commenthub.id }}';
        var commenthub_website = '{{ theme.commenthub.site }}';
        var commenthub_identifier = '{{ page.path }}';
        var commenthub_url = '{{ page.permalink }}';
        var commenthub_title = '{{ page.title| addslashes }}';
        var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = 'https://commenthub.herokuapp.com/js/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
      </script>
  {% endif %}
{% endif %}
{% endraw %}
{% endcodeblock %}

### 引入 commenthub.swig
在`themes/next/layout/_third-party/comments/index.swig`文件添加如下代码：
{% codeblock lang:html %}
{% raw %}
{% include 'commenthub.swig' %}

{% endraw %}
{% endcodeblock %}

### 完成
这样 Hexo 的配置就结束了，如果配置中遇到问题，可以在当前博客中评论留言，或者到 Github Issue 中留言。

## 建议与反馈
如果在使用过程中有任何问题欢迎建议和反馈到 [Commenthub](https://github.com/codedrinker/commenthub)。

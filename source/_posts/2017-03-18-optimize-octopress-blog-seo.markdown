---
layout: post
title: "Octopress 博客搜索优化"
date: 2017-03-18 22:43:10 +0800
comments: true
categories: Octopress
description: 优化octopress blog的搜索SEO
keywords: Octopress,博客搜索优化,博客SEO,Octopress SEO
---

##前言
尝试在Google, Baidu, Bing 搜索之前写的文章的关键字基本搜不到，甚至使用标题一模一样去搜索也不行，更意外的是第一个出现的是转载的文章。于是就带着这个疑问去网上查了一些资料，尝试去优化一下，下面就是这次优化的笔记。  
PS:虽然做我们这行业的人基本都是用Google 搜索。
<!-- more -->
##搜索引擎优化
优化中包括文章链接的变动，已经提交的链接变得无法检索，所以先进行一些优化，需要再次提交链接。

* ####手动提交
在Google搜索的时候发现搜索不到，可以手动添加到Google，这样可以主动收录，具体的地址  
https://www.google.com/webmasters/tools/home?hl=en&pli=1  
里面包含搜索状态，搜索分析，网站优化等一些Google的调试工具可以使用，以提高网站的搜索效果。

* ####提交baidusitemap.xml
Octopress会默认创建sitemap.xml但是不会创建baidusitemap.xml，但是他们的内容基本一样，所以需要我们想办法每次重新生成博客的时候，复制一份sitemap.xml到baidusitemap.xml里面去。作者的实现方案比较简单粗暴，直接在`Rakefile`里面的`generate`的`task`后面添加了一行拷贝：
{% codeblock lang:sh robots.txt%}
{% raw %}
desc "Generate jekyll site"
task :generate do
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  puts "## Generating Site with Jekyll"
  system "compass compile --css-dir #{source_dir}/stylesheets"
  system "jekyll build"
  cp_r "#{public_dir}/sitemap.xml", "#{public_dir}/baidusitemap.xml"
end
{% endraw %}
{% endcodeblock %}
同时在robots.txt追加如下内容：
{% codeblock lang:sh robots.txt%}
{% raw %}
Sitemap: {{ site.url }}/baidusitemap.xml 
{% endraw %}
{% endcodeblock %}

##内容优化

* ####修改post的url  
因为Octpopress Jeklly的默认post路径带着日期，分级较多，造成URL较长，不利于搜索引擎检索，我们可以自己缩短URL。直接在`_config.yml`里面修改`permalink: /blog/:year/:month/:day/:title/` 为 `permalink: /blog/:title/`即可。  
接下来又出现问题了，因为之前已经发表的post，被搜索引擎索引了，或者是其他地方有引用就不能访问了。所以我们需要处理一下原来的文章地址，我的做法是把 `public`里面已经生成好的内容直接拷贝到`source/blog`目录下面，这样再次`generate`的时候就会把原来的目录生成在`public`里面。
```sh 博客目录
source/blog/
├── 2015
│   └── 01
│       └── 10
│           └── begininng-and-summary
│               └── index.html
├── 2016
│   └── 12
│       ├── 15
│       │   └── set-up-vagrant-environment
│       │       └── index.html
│       └── 24
│           └── auto-preview-front-end-changes
│               └── index.html
├── 2017
│   └── 03
│       └── 11
│           └── the-smart-way-of-styling-and-customizing-file-input
│               └── index.html
└── archives
    └── index.html
```
切记不能复制`archives/index.html`，因为里面包含一些动态代码，并不是我们曾经发表的博文。然后把每一个`html`文件里面的内容删除，添加如下代码即可：
```html /blog/:year/:month/:day/:title/index.html
<meta http-equiv="refresh" content="0; url=/blog/begininng-and-summary">
<link rel="canonical" href="http://majiang.life/blog/begininng-and-summary" />
```
`...http-equiv=“refresh...`是为了再次访问这个网页的时候可以自动跳转到相应的网页，`...rel="canonical" href=...`就相当于301，这样搜索引擎会重新索引指定的网址，这样久的post可以正常使用， 新发布的post的地址也可以自动变成短链接了。

* ####提高文章内容的检索
页面最前面用一个段落的文字，通常就是一句话，简洁明确回答“xxx是什么“，或者说给出xxx的定义。我觉得更好的是概括文章大意，一方面可以直接告诉用户你观看我的文章可以得到什么，另一个能起到搜索优化的效果。  
后面的内容小标题尽量靠拢文章中心(提炼于参考链接)，突然觉得搜索引擎也是一个人，他更喜欢好的文章，全文围绕一个中心思想。

* ####添加description和keywords
类似于这篇文章，以便于搜索引擎检索
```
description:优化octopress blog的搜索SEO
keywords:Octopress，博客搜索优化，博客SEO，Octopress SEO
```

## 版权
因为好多转载的文章或者类似最近比较火的`阅读模式`处理过的文章只包含正文，为了解决这个问题，所以把原来签名等相关信息放在了正文里面，内容的最下面，这样就可以和正文同样处理了，直接把内容添加到模板页面即可。找到`_includes/article.html`，找到如下内容，` content `表示文章的正文。

{% codeblock lang:html  /source/_includes/article.html%}
{% raw %}
<div class="entry-content">{{{ content }}
</div>
{% endraw %}
{% endcodeblock %}
把我们预先准备好的版权的格式写入得到如下即可：

{% codeblock lang:html  /source/_includes/article.html%}
{% raw %}
<div class="entry-content">{{ content }}
<h2>作者</h2>
<p>本文作者<code>麻酱</code>，欢迎讨论，指正和转载，转载请注明出处。<br/>
原文地址：<a href="{% if index %}{{ root_url }}{{ post.url }}{% endif %}">{% if site.titlecase %}{{ page.title | titlecase }}{% else %}{{ page.title }}{% endif %}</a><br/>
如果兴趣可以关注作者微信订阅号<br/>
<img src="/images/wechat.jpg" height="150" width="150" alt="majiangbiji" /></p>
</div>
{% endraw %}
{% endcodeblock %}
示例如下文:


##未完待续。。。

##参考链接
[Hexo-优化：提交sitemap及解决百度爬虫抓取-GitHub-Pages-问题](http://www.yuan-ji.me/Hexo-%E4%BC%98%E5%8C%96%EF%BC%9A%E6%8F%90%E4%BA%A4sitemap%E5%8F%8A%E8%A7%A3%E5%86%B3%E7%99%BE%E5%BA%A6%E7%88%AC%E8%99%AB%E6%8A%93%E5%8F%96-GitHub-Pages-%E9%97%AE%E9%A2%98/)  
[解决 Github Pages 禁止百度爬虫的方法](https://bblove.me/2015/11/25/how-to-solve-the-problem-that-github-blocks-the-baidu-spider/)  
[How I migrated my blog from Wordpress to Octopress](http://konradpodgorski.com/blog/2013/10/21/how-i-migrated-my-blog-from-wordpress-to-octopress/#redirect-301-on-github-pages)  
[怎样把Google排名优化到第0位？](https://www.seozac.com/google/featured-snippet-how/)


---
layout: post
title: "给博客添加目录"
date: 2018-02-19 12:11:10 +0800
comments: true
categories: ["Octopress","toc"]
---
## 前言
Hexo 模板的博客都带了文章目录[toc]，但是作者当前使用的是 Octopress 博客系统，所以不支持目录。这样给阅读的人带来了很大的不便捷。所以作者使用了 Table of contents sidebar 为 Octopress 添加了目录，并且可以快速定位。过程很简单，内容如下。
<!-- more -->
## 添加插件
直接添加到如下代码到博客通用的文件即可，其中 querySelector 可以定义生成目录的区域。
{% codeblock lang:html %}
{% raw %}
<script type="text/javascript" src="https://table-of-contents-sidebar.github.io/table-of-contents-sidebar-lib/table-of-contents-sidebar.js"></script>
<script type="text/javascript">
    window.onload = function(e){ 
        TableOfContents.init({
            basePath: "https://table-of-contents-sidebar.github.io/table-of-contents-sidebar-lib/",
            querySelector: "body" // or other css querySelector
        });
    }
</script>
{% endraw %}
{% endcodeblock %}
## 插件
这样仅仅是看自己的博客有了目录，如果想看别人的博客也有目录，可以安装 Table of contents sidebar 的插件，这样只要能识别的文章都能查看目录并且快速定位了。  
[https://chrome.google.com/webstore/detail/table-of-contents-sidebar/ohohkfheangmbedkgechjkmbepeikkej](https://chrome.google.com/webstore/detail/table-of-contents-sidebar/ohohkfheangmbedkgechjkmbepeikkej)

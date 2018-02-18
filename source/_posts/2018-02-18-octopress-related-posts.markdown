---
layout: post
title: "为 Octopress 添加 扩展相关阅读"
date: 2018-02-18 20:24:22 +0800
comments: true
categories: [Octopress]
---
## 前言
原生的 Octopress 没有更丰富的阅读体验，只有上一篇下一篇，每次需要为当前文章添加相关文章的时候都需要在 Markdown 里面手动填写，这样非常浪费时间又不全面，于是笔者使用 Category 作为相关性的依据，修改了 Liqiud 代码，使得每一个 post 里面有具有相关的文章。
<!-- more -->
## 实现
实现起来也是很简单的，直接把如下代码添加到 `includes/article.html` 里面，跟在下面代码之后即可。
{% codeblock lang:html %}
{% raw %}
<div class="entry-content">{{ content }}
{% endraw %}
{% endcodeblock %}  
代码如下
{% codeblock lang:html %}
{% raw %}
<h2>扩展阅读</h2>
{% if page %}
    <ol>
      {% for category in page.categories %}
        {% for post in site.categories[category] %}
        {% if  page.url == post.url %}
          {% continue %}
        {% endif %}
        <li>
          <a href="{{ root_url }}{{ post.url }}">{% if site.titlecase %}{{ post.title | titlecase }}{% else %}{{ post.title }}{% endif %}</a>
        </li>
        {% endfor %}
      {% endfor %}
    </ol>
{% endif %}
{% endraw %}
{% endcodeblock %}
原理就比较简单了，取到当前页面的 categories，然后循环遍历得到每一个category下面的 post 展示即可。

## 参照
实际中的应用可以参照如下地址  
[参考地址](https://github.com/codedrinker/codedrinker.github.io/blob/source/source/_includes/article.html)

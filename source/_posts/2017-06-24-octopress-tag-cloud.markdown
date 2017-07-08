---
layout: post
title: "Octopress 添加标签云"
date: 2017-06-24 15:11:51 +0800
comments: true
categories: [Octopress]
description: "octopress tag cloud，Octopress 标签云，Octopress标签，Octopress右侧标签，为Octopress侧边栏添加标签云，标签云，为Octopress 添加标签云，为 Octopress 添加 tag cloud，为Octopress 侧边栏添加tag cloud"
---
##前言
随着文章数量越来越多，分类也越来越多，不是很方便归类和查找，于是就有了`标签云`这个概念。简单明了的展示了标签和每一个标签下面的文章数量。这个功能可以自己编写，也非常简单。不过反正已经有轮子了，如果不喜欢重新造轮子，直接使用一个网上已经写好的就行了。下面直接进入正题：

##使用轮子
直接`clone`轮子`https://github.com/tokkonopapa/octopress-tagcloud.git`到本地，如果不想`clone`直接点击[下载](/assets/octopress-tagcloud-master.zip)，然后把对应的资源拷贝到相应的目录：
<!-- more -->
```
.
├─ plugins/
│  └── tag_cloud.rb
└─ source/
   └─ _includes/
      └─ custom/
         └─ asides/
            ├─ category_list.html
            └─ tag_cloud.html
```
然后修改 `_config.yml`，添加 `tag_cloud.html` 到 `default_asides` 数组，重新`rake preview`即可。

##造轮子
造轮子原理也是很简单，遍历所有的`category`和每一个`category`下面的`posts`，然后编写好样式做输出就可以了。`plugins`这个目录用户存放一些`Ruby`的`plugins`文件，所以我们直接写一个脚本到这个目录:
{% codeblock lang:ruby plugins/tag_cloud.rb%}
{% raw %}
# plugins/tag_cloud.rb
module Jekyll  
  class CategoryListTag < Liquid::Tag  
    def render(context)  
      html = ""  
      categories = context.registers[:site].categories.keys  
      categories.sort.each do |category|  
        posts_in_category = context.registers[:site].categories[category].size  
        category_dir = context.registers[:site].config['category_dir']  
        category_url = File.join(category_dir, category.gsub(/_|\P{Word}/, '-').gsub(/-{2,}/, '-').downcase)  
        html << "<li class='category'><a href='/#{category_url}/'>#{category} (#{posts_in_category})</a></li>\n"  
      end  
      html  
    end  
  end  
end  

Liquid::Template.register_tag('tag_cloud', Jekyll::CategoryListTag) 
{% endraw %}
{% endcodeblock %}

{% codeblock lang:html source/_includes/custom/asides/tag_cloud.html%}
{% raw %}
<!-- source/_includes/custom/asides/tag_cloud.html-->
<section>  
  <h1>Categories</h1>  
  <ul id="categories">  
    {% tag_cloud %}  
  </ul>  
</section> 
{% endraw %}
{% endcodeblock %}

{% codeblock lang:yml _.config.yml%}
{% raw %}
#_config.yml
default_asides: [...,custom/asides/tag_cloud.html]  
{% endraw %}
{% endcodeblock %}

下面我们逐行解释：   
`context`会传递传递静态博客需要的上下文,`category`和`posts`都可以在里面获取。  
`Liquid::Template.register_tag` 最后生成`tag_cloud`标签，以便在`html`里面可以直接使用。  
`tag_cloud.html` 直接在`html`里面使用`tag_cloud`标签  
`_config.yml` 最后再里面配置就可以了

笔者前端不是很好，如果想把轮子造的好看一点，直接自定义`tag_cloud.rb`里面的`html`样式即可。



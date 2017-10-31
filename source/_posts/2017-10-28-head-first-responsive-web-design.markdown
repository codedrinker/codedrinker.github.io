---
layout: post
title: "总是听别人说响应式布局，原来这么简单"
date: 2017-10-28 10:37:55 +0800
comments: true
categories: [web]
description: 什么是响应式布局,如何快速实现web响应式布局,Css 优先级,Meta ViewPort 是什么,Media Queries 详解
keywords: web响应式布局设计,Head First Responsive Web Design,什么是响应式布局,怎么快速实现web响应式布局,Css 优先级详解,Meta ViewPort是什么
---
##前言
总听别人说响应式布局，觉得是一个很高大上的东西，近日做的一个项目需要适配不同的屏幕尺寸，于是就简单研究了一下`Web响应式布局`，其实原理很简单，下面就简单整理了一下分享给大家。
<!-- more -->
##什么是响应式布局
![Demo](/images/posts/rwd-demo.gif)
<font color=gray size=4>[_图片来源_`caktusgroup`]</font><br/>   

如图就是响应式布局的体现，简单的说响应式布局就是一个网站能够兼容多个终端，而不是为每个终端做一个特定的版本。这个概念随着移动设备的兴起而深入人心。  
比如`头条`他做的就不是响应式布局，他通过实时检测设备信息，在`www.toutiao.com`和`m.toutiao.com`两个网站之间切换。而最近比较火的开发者社区`segmentfault.com`就是响应式布局，页面的布局会会随着你拖动浏览器窗口大小变化而变化。响应式布局没有绝对的话好与坏，需要根据网站的性质来确定，比如`toutiao`的页面元素非常多，页面需要包括所有屏幕尺寸的样式显示不是很好操作，然而`segmentfault`页面元素较少，反而放在一起方便维护。

##如何快速实现`web响应式布局`
我们通过一个例子来具体说明，首先使用`@media`关键字为不同的屏幕尺寸设置不同样式，关于`@media`我们下文有更详细的介绍
{% codeblock lang:html 代码片段%}
{% raw %}
<style type="text/css">
	@media only screen and (min-width: 480px) {
  .col-sm-6, .col-sm-12 {
    float: left;
  }
  .col-sm-12 {
    width: 100%;
  }
  .col-sm-6 {
    width: 50%;
  }
}
@media only screen and (min-width: 768px) {
  .col-md-6, .col-md-12 {
    float: left;
  }
  .col-md-12 {
    width: 100%;
  }
  .col-md-6 {
    width: 50%;
  }
}
</style>
<div class="container">
	<div class="col-md-12 col-sm-12 row">
		<div class="col-md-6 col-sm-12 col-1 col">
			Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
			quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
			cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</div>
		<div class="col-md-6 col-sm-12 col-2 col">
			Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
			quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
			cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</div>
	</div>	
</div>
{% endraw %}
{% endcodeblock %}
我们简单解释一下上述代码片段  
`min-width`指的是当屏幕尺寸大于当前值的时候样式生效。  
外层的`div`包裹内层的两个`div`。  
`col-md-6 col-sm-12`当屏幕尺寸大于`768px`的时候子`div`宽度是父`div`的一半，所以是并排。当屏幕尺寸大于`480px`的时候子`div`宽度和父`div`的宽度一样。下图为不同尺寸下的效果图。

| 768px        | 480px         |
| :-------------: |:-------------:|
|![Demo](/images/posts/rwd-desktop.png)| ![Demo](/images/posts/rwd-iphone5.png)|

那么问题来了，图一尺寸大于`768px`不假，但是也大于`480px`啊，那么怎么就按照`768px`的尺寸排布了呢？这里就涉及到了`CSS 优先级`：  
`CSS` 的基本优先级如下   
`（外部样式）External style sheet <（内部样式）Internal style sheet <（内联样式）Inline style `  
如果优先级一样便有一个覆盖原则，后面的覆盖前面的，于是如例，当屏幕尺寸慢慢变大到`768px`的时候，后者遍生效了。

注意观察的同学又发现问题了，图二没有办法看啊，太小了吧。是的，我们的响应式还没有做完，这个时候我们在`head`里面添加如下一行代码再试试？
```html
<meta name="viewport" 
	content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
```
如图神奇的一幕出现了：  
![Demo](/images/posts/rwd-iphone-mete-viewport.png)  
width=device-width: 表示此宽度不依赖于原始象素(px)，而依赖于屏幕的宽度.这样我们就大功告成了.如需要下载源码请[点击](http://www.majiang.life/repository/asserts/rwd.html.zip)，在线查看请[点击](http://www.majiang.life/repository/asserts/rwd.html)。想知道为什么`meta`有这么大作用请翻看下文。

##Meta ViewPort 是什么
手机浏览器是把页面放在一个虚拟的“窗口”(`viewport`)中，通常这个虚拟的“窗口”(`viewport`)比屏幕宽，默认是把网页挤到一个很小窗口以便全部预览，这样也不会破坏没有适配手机布局的网页。移动版的 Safari 浏览器最新引进了 `viewport` 这个 meta tag，让网页开发者来控制 viewport 的大小和缩放，其他手机浏览器也逐步支持。我们如果做了手机屏幕尺寸的适配就可以手动调整`viewport`，这样就可以把网页内容和手机布局合理的展示给用户。下面是具体参数的说明： 

|                 |               |
| :------------- |:-------------|
|width| 设置layout viewport  的宽度，为一个正整数，或字符串"width-device"|
|initial-scale| 	设置页面的初始缩放值，为一个数字，可以带小数|
|minimum-scale| 允许用户的最小缩放值，为一个数字，可以带小数|
|maximum-scale| 允许用户的最大缩放值，为一个数字，可以带小数|
|height| 设置layout viewport  的高度，这个属性对我们并不重要，很少使用"|
|user-scalable| 是否允许用户进行缩放，值为"no"或"yes", no 代表不允许，yes代表允许|


##Media Queries 详解
中文叫做媒体查询，它包含一个媒体类型(media type)和至少一个表达式，用媒体特性限制样式表的作用范围。下面我们直接通过例子对相对的关键字进行分析：
####only
用于向早期浏览器隐藏媒体查询，比如IE如果不支持的话直接忽略当前定义的样式。和其他表达式一起用需要`and`
```css
@media only screen and (min-width: 400px)
```
####screen
screen是一种`媒体类型`，例中的`screen`意思是仅支持彩色电脑显示器。其他属性如下：  
all：适用与所有设备  
print：paged material and documents viewed on screen in print previe mode.  
screen: 彩色电脑显示器  
speech：intended for speech synthesizers  

####and
`and`是一种`操作符`，表示被链接的表达式不许同时满足，其他表达式如下：    
`and`：所有条件必须满足  
`,`：只要满足一种条件即可  
`not`：条件的取反  

####min-width
`min-width`是`媒体特征`，他的意思是最小宽度满足的时候就为真，其他媒体特征：  
width： viewport width  
height: viewport height   
aspect-ratio: viewport的宽高比如：16/9   
orientation: 宽度和高度的大小关系   
resolution: pixel density of the output device   
scan: scanning process of the output device   
grid: is the device a grid or bitmap   
color: number of bits per color component of the output device, or zero if the device isn't color   
color-index: number of entries in the output device's color lookup table, or zero if the device does not use such a table

##总结
笔者只是随学随卖，抛砖引玉，如有想更深入理解`响应式布局`请观看如下参考链接。

##参考链接
[CSS 优先级](http://www.cnblogs.com/xugang/archive/2010/09/24/1833760.html)    
[Media Queries 详解](https://segmentfault.com/a/1190000002812335/sharing-classes-or-interfaces-between-different-projects)    
[ViewPort 详解](https://www.cnblogs.com/2050/p/3877280.html)   
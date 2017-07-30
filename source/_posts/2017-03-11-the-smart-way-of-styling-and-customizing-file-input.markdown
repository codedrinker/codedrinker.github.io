---
layout: post
title: "如何优雅的自定义File Input样式"
date: 2017-03-11 15:05:51 +0800
comments: true
categories: Web
description: 如何优雅的自定义File Input样式
keywords: 自定义File Input样式,修改File Input样式,怎么修改File Input样式,修改选择按钮样式
---

##前言
通过使用`label`标签，简单的自定义`<input type='file'>`的样式。

##示例

![Demo](/images/posts/CustomFileInputs1.jpg)  
[在线示例](http://tympanus.net/Tutorials/CustomFileInputs/) | [下载源码](http://tympanus.net/Tutorials/CustomFileInputs/CustomFileInputs.zip)

##调研
我尝试了许多通过修改`<input type='file'>`样式的方式解决这个问题，效果都不是很好，没有一个能像[Readerrr](http://readerrr.com/)(通过上传文件导入Feed)那样漂亮。还有一种奇怪的实现，把`<input type='file'>`放到一个容器里面，把容器画成按钮的样子，当你点击容器的任何地方的时候，实际是点击的`<input type='file'>`。这种实现方案很有趣，同时也很奇怪。因为从可用性和点击体验来说确实不是很理想。
<!-- more -->
我尝试使用Google搜索答案可是没有什么结果，但是StackOverflow上面的内容让我茅塞顿开。它只有几个投票，并且在页面的中间位置，但是最重要的是他的内容里面包含了一个神奇的关键字`<label>`。就我们所知，点击`<label>`标签的时候，可以触发它所绑定`<input>`的焦点。那么我们尝试通过点击`<label>`标签，触发打开文件选择的窗口，这样从逻辑上来讲也是非常合理的。

```html index.html
<input type="file" name="file" id="file" class="inputfile" />
<label for="file">Choose a file</label>
```
点击两个标签中的任意一个都可以触发打开文件选择的窗口，这也意味着最难的部分我们已经解决了。同时不需要复杂的逻辑定位光标效果，也没有JavaScript代码，只有两行代码而已。

![Demo](/images/posts/smart-custom-file-input-1.gif)

下面我们就可以定义`<label>`的样式了，让它看起来更像一个按钮。

##隐藏`<input>`
首先，我们需要隐藏‘丑小鸭’，可以使用CSS属性`display:none`或`visibility:hidden`，但是这里不能使用`visibility:hidden`，因为提交`form`表单的时候不会传递参数到服务器端了。所以我们需要设置这个标签用户不可见，但是浏览器可见。
```css component.css
.inputfile {
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}
```
你会好奇为什么宽度和高度设置为`0.1px`而不是`0px`，因为在某些浏览器里面将元素的属性设置为零会让它们排列很奇怪，同时为`input`设置`absolute`属性，保证他不会干扰到兄弟元素。

##修饰`<label>`
我们现在需要把`<label>`打造成一个按钮，所以你可以发挥你的想象绘制它，我现在先简单把它实现：
```css component.css
.inputfile + label {
    font-size: 1.25em;
    font-weight: 700;
    color: white;
    background-color: black;
    display: inline-block;
}

.inputfile:focus + label,
.inputfile + label:hover {
    background-color: red;
}
```
##鼠标效果
你是怎么知道网站上面的元素可以点击的呢？首先，元素应该传递一种你可以点击它的感觉；其次，当光标悬浮在元素上面应该有适当的变化。下面我们就实现`<label>`的`可点击效果`：
```css component.css
.inputfile + label {
	cursor: pointer; /* 小手光标*/
}
```

| 处理前        | 处理后         |
| :-------------: |:-------------:|
|![Demo](/images/posts/smart-custom-file-input-2.gif)| ![Demo](/images/posts/smart-custom-file-input-3.gif)|


##键盘导航
如果用户不能通过键盘在你的网站上面导航，那么就说明这设计是有问题的。我们隐藏了`input`，同时也隐藏了`input`的焦点。所以我们要把原本在`input`标签上面能体现的焦点同样实现在`label`上面。
```css component.css
.inputfile:focus + label {
	outline: 1px dotted #000;
	outline: -webkit-focus-ring-color auto 5px;
}
```
`-webkit-focus-ring-color auto 5px`是一个有意思的小技巧，它使用外边框变色的效果巧妙地模拟了获取焦点的效果。它适用Chrome，Opera，Safari浏览器，上面的一行CSS样式是为了不支持`-webkit`属性的浏览器使用的。

![Demo](/images/posts/smart-custom-file-input-4.gif)

##触摸设备兼容
如果使用[FastClick](https://github.com/ftlabs/fastclick)(一个简单易用的库，用于消除物理点击和移动浏览器上的点击事件触发之间的300毫秒延迟)或者是在标签内添加一些额外的标记，这样会让’按钮‘无法工作，所以我们需要使用`pointer-events:none`来解决这个问题：
```html index.html
<label for="file"><strong>Choose a file</strong></label>
```
```css component.css
.inputfile + label * {
	pointer-events: none;
}
```
##显示所选择文件
我们已经完成了大部分，但是还有一个小瑕疵。当我们使用`input`选择文件的时候会显示我们所选择的文件，然而我们这种实现方案隐藏了`input`所以不能显示文件了。不过没有关系，我们可以用一小段JavaScript解决这个问题，把选择的文件名字显示到`label`上面，如果是多个，就说显示了多个文件，这样就解决了这个问题：

```html index.html
<input type="file" name="file" id="file" class="inputfile" 
	   data-multiple-caption="{count} files selected" multiple />
```
```javascript custom-file-input.js
var inputs = document.querySelectorAll( '.inputfile' );
Array.prototype.forEach.call( inputs, function( input )
{
	var label	 = input.nextElementSibling,
		labelVal = label.innerHTML;

	input.addEventListener( 'change', function( e )
	{
		var fileName = '';
		if(this.files && this.files.length > 1 )
		   fileName = (this.getAttribute('data-multiple-caption') || '')
		   .replace( '{count}', this.files.length );
		else
			fileName = e.target.value.split( '\\' ).pop();

		if( fileName )
			label.querySelector( 'span' ).innerHTML = fileName;
		else
			label.innerHTML = labelVal;
	});
});
```
在源码里面也有一个JQuery的实现，如果需要可以下载查看。  
源码解析：  

- `multiple`属性是为了可以选择多个文件；`data-multiple-caption`是自定义的一个属性，用来显示选择多个文件的文案，当然你可以自定义这个文案。`{count}`是所选择的文件数的占位符。之所以使用一个额外的自定义属性而不是使用变量是因为这样只有一个地方有容易维护而已。

- IE9及以下的版本不支持`multiple`属性和JavaScript的`files`属性，所以针对这些浏览器我们只能采用其他的方式。因为选择文件以后我们是可以获取到文件的绝对路径的，比如`C:\fakepath\filename.jpg`，所以我们使用`split( '\\' ).pop()`来获取所选文件的名字用于显示。

- 一个有意思的事情，原生的`input`打开选择窗口以后，你点击ESC是可以取消选择的，对此我也做了处理，使用`labelVal`来存取原来的值，在必要的时候重置这个值到`label`。

下面就是最终的效果：

![Demo](/images/posts/smart-custom-file-input-5.gif)

##如果JavaScript不可用怎么办？
如果不使用JavaScript的话没有办法显示所选择的文件，为了可用性，如果不支持JavaScript我们把它变回原来的外观。因此我们在`<html>`元素添加一个`.no-js`的`class`，并且编写一个js脚本，如果js可用我们再将其替换成`.js`：
```html index.html
<html class="no-js">
    <head>
        <!-- remove this if you use Modernizr -->
        <script>(function(e,t,n){var r=e.querySelectorAll("html")[0];r.className=r.className.replace(/(^|\s)no-js(\s|$)/,"$1js$2")})(document,window,0);</script>
    </head>
</html>
```
```css component.css
.js .inputfile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
}

.no-js .inputfile + label {
    display: none;
}
```

![Demo](/images/posts/smart-custom-file-input-6.gif)

##Firefox Bug
这里有一个非常奇怪的事情，`input[type="file"]:focus`这个属性在Firefox根本不起作用，但是`:hover`和`:active`却能很好地支持。更奇怪的事情，Firefox却允许使用`JavaScript`获取`focus`的事件，所以我们在`input`上面监听了事件，当触发`focus`的时候改变样式来实现我们之前的效果：
```javascript custom-file-input.js
input.addEventListener('focus', function() {
    input.classList.add('has-focus');
});
input.addEventListener('blur', function() {
    input.classList.remove('has-focus');
});
```
```css component.css
.inputfile:focus + label,
.inputfile.has-focus + label {
    outline: 1px dotted #000;
    outline: -webkit-focus-ring-color auto 5px;
}
```
如果你想查看是怎么自定义`input`样式的，欢迎下载并查看源码，并愉快使用。  
示例中的图标由[Daniel Bruce](http://www.danielbruce.se/)制作，来源于[www.flaticon.com](http://www.flaticon.com)，并获得CC BY3.0许可。

>**原文地址：** [Styling & Customizing File Inputs the Smart Way](https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/)

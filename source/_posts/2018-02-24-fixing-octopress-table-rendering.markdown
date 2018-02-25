---
layout: post
title: "修复 Octopress Table 样式"
date: 2018-02-24 20:19:39 +0800
comments: true
categories: [Octopress]
published: true
---
## 起因
Octopress 自带的 Table 样式太丑了，于是自己自定义一个，方法非常简单，操作如下。

<!-- more -->

## 效果

key | value1 | value2
----|--------|----------
a   | apple  | aardvark
b   | banana | bonobo
c   | clementine | cat 

源码如下：

```
key | value1 | value2
----|--------|----------
a   | apple  | aardvark
b   | banana | bonobo
c   | clementine | cat
```

## 编码
在 sass/custom 目录创建 _better_tables.scss，填写如下内容

```scss
// make the text for the header row bold and centered.
// (I have not been able to figure out where jekyll/octopress are overriding
//  the text-align and setting it to `left`)
.entry-content th { font-weight: bold; text-align: center }

// typography for p/blockquote/ul/ol puts a 1.5em margin below those elements,
// so do the same for our tables ...
.entry-content table { margin-bottom: 1.5em }

// ... but undo that for tables for pygments-generated code
.entry-content .code table { margin-bottom: inherit }


// add a border around each cell and padding around its content ...
.entry-content th, .entry-content td {
  border: 1px solid #ddd;
  padding: 6px 13px;
}

// ... but undo that for tables for pygments-generated code
.entry-content .code th, .entry-content .code td {
  border: inherit; padding: inherit;
}


// zebra-stripe the rows (N.B. `nth-child(2n)` works too) ...
.entry-content tr                 { background-color: #FFFFFF }
.entry-content tr:nth-child(even) { background-color: #F8F8F8 }

// ... but undo that for tables for pygments-generated code
.entry-content .code tr                 { background-color: inherit }
.entry-content .code tr:nth-child(even) { background-color: inherit }
```

`entry-content` 是为了限制这个样式只在博文中生效。  
然后在 `_styles.scss` 文件中添加一行内容即可完成：
```
@import "better_tables"
```

## 参考文档
http://blog.pnkfx.org/blog/2015/12/18/fixing-octopress-table-rendering/

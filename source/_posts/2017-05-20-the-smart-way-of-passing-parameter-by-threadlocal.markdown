---
layout: post
title: "优雅的使用 ThreadLocal 传递参数"
date: 2017-05-20 18:04:38 +0800
comments: true
categories: [java,threadlocal]
description: 如何优雅的使用 ThreadLocal 传递参数，the smart way of passing parameter by threadlocal，巧妙使用ThreadLocal，使用ThreadLocal传递参数，ThreadLocal使用，ThreadLocal使用详解，ThreadLocal原理，ThreadLocal分析，ThreadLocal的使用场景
---
##前言
在我们日常 `Web` 开发中难免遇到需要把一个参数层层的传递到最内层，然后中间层根本不需要使用这个参数，或者是仅仅在特定的工具类中使用，这样我们完全没有必要在每一个方法里面都传递这样一个`通用`的参数。如果有一个办法能够在任何一个类里面想用的时候直接拿来使用就太好了。`Java`的`Web`项目大部分都是基于`Tomcat`，每次访问都是一个新的线程，这样让我们联想到了`ThreadLocal`，每一个线程都独享一个`ThreadLocal`，在接收请求的时候`set`特定内容，在需要的时候`get`这个值。下面我们就进入主题。
<!-- more -->
##ThreadLocal
维持线程封闭性的一种更规范的方法就是使用`ThreadLocal`，这个类能使线程中的某个值与保存的值的对象关联起来。`ThreadLocal`提供`get`和`set`等接口或方法，这些方法为每一个使用这个变量的线程都存有一份独立的副本，因此`get`总是返回由当前线程在调用`set`时设置的最新值。
`ThreadLocal`有如下方法
```java
public T get() { }
public void set(T value) { }
public void remove() { }
protected T initialValue() { }
```
`get()`方法是用来获取`ThreadLocal`在当前线程中保存的变量副本  
`set()`用来设置当前线程中变量的副本  
`remove()`用来移除当前线程中变量的副本   
`initialValue()`是一个`protected`方法，一般是用来在使用时进行重写的，如果在没有set的时候就调用`get`，会调用`initialValue`方法初始化内容。
为了使用的更放心，我们简单的看一下具体的实现:

###`set`方法
```java ThreadLocal.java
public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
    }
```
`set`方法会获取当前的线程，通过当前线程获取`ThreadLocalMap`对象。然后把需要存储的值放到这个`map`里面。如果没有就调用`createMap`创建对象。

###`getMap`方法
```java ThreadLocal.java
 ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
```
`getMap`方法直接返回当前`Thread`的`threadLocals`变量，这样说明了之所以说`ThreadLocal`是`线程局部变量`就是因为它只是通过`ThreadLocal`把`变量`存在了`Thread`本身而已。

### `createMap`方法
```java ThreadLocal.java
void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```
在`set`的时候如果不存在`threadLocals`，直接创建对象。由上看出，放入`map`的`key`是当前的`ThreadLocal`，`value`是需要存放的内容，所以我们设置属性的时候需要注意存放和获取的是一个`ThreadLocal`。

###`get`方法
```java ThreadLocal.java
public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null)
                return (T)e.value;
        }
        return setInitialValue();
    }
```
`get`方法就比较简单，获取当前线程，尝试获取当前线程里面的`threadLocals`，如果没有获取到就调用`setInitialValue`方法，`setInitialValue`基本和`set`是一样的，就不累累述了。

##场景

本文应用`ThreadLocal`的场景：在调用API接口的时候传递了一些公共参数，这些公共参数携带了一些设备信息，服务端接口根据不同的信息组装不同的格式数据返回给客户端。假定服务器端需要通过设备类型(device)来下发下载地址，当然接口也有同样的其他逻辑，我们只要在返回数据的时候判断好是什么类型的客户端就好了。如下:
####场景一
请求
```sh
GET api/users?device=android
```
返回
```JSON
	{
		user : {		
		},
		link : "https://play.google.com/store/apps/details?id=***"
	}
```
####场景二
请求
```sh
GET api/users?device=ios
```
返回
```JSON
	{
		user : {	
		},
		link : "https://itunes.apple.com/us/app/**"
	}
```
##实现
首先准备一个`BaseSigntureRequest`类用来存放公共参数
```java BaseSignatureRequest.java
public class BaseSignatureRequest {
    private String device;

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }
}
```
然后准备一个`static`的`ThreadLocal`类用来存放`ThreadLocal`，以便存储和获取时候的`ThreadLocal`一致。
```java ThreadLocalCache.java
public class ThreadLocalCache {
    public static ThreadLocal<BaseSignatureRequest> 
    	baseSignatureRequestThreadLocal = new ThreadLocal<>();
}
```
然后编写一个`Interceptor`，在请求的时候获取`device`参数，存入当前线程的`ThreadLocal`中。这里需要注意的是，重写了`afterCompletion`方法，当请求结束的时候把`ThreadLocal` `remove`，移除不必须要键值对。
```java ParameterInterceptor.java
public class ParameterInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        String device = request.getParameter("device");
        BaseSignatureRequest baseSignatureRequest = new BaseSignatureRequest();
        baseSignatureRequest.setDevice(device);
        ThreadLocalCache.baseSignatureRequestThreadLocal.set(baseSignatureRequest);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) throws Exception {
        ThreadLocalCache.baseSignatureRequestThreadLocal.remove();
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest,
                           HttpServletResponse httpServletResponse, 
                           Object o, ModelAndView modelAndView) throws Exception {

    }
}
```
当然需要在`spring`里面配置`interceptor`
```xml applicationContext.xml
    <mvc:interceptors>
        <mvc:interceptor>
            <mvc:mapping path="/api/**"/>
            <bean class="life.majiang.ParameterInterceptor"></bean>
        </mvc:interceptor>
    </mvc:interceptors>
```

最后在`Converter`里面转换实体的时候直接使用即可，这样就大功告成了。
```java UserConverter.java
public class UserConverter {
    public static ResultDO toDO(User user) {
        ResultDO resultDO = new ResultDO();
        resultDO.setUser(user);
        BaseSignatureRequest baseSignatureRequest = ThreadLocalCache.baseSignatureRequestThreadLocal.get();
        String device = baseSignatureRequest.getDevice();
        if (StringUtils.equals(device, "ios")) {
            resultDO.setLink("https://itunes.apple.com/us/app/**");
        } else {
            resultDO.setLink("https://play.google.com/store/apps/details?id=***");
        }
        return resultDO;
    }
```
##总结
这种机制很方便，因为他避免了在调用每一个方法时都要传递执行上下文信息，合理的使用`ThreadLocal`可以起到事倍功半的效果，但是需要避免滥用，例如将所有的全局变量作为`ThreadLocal`对象，`ThreadLocal`类似全局变量，他能降低代码的可重用性，并在类之间引入隐含的耦合性，所以再使用前需要格外小心。

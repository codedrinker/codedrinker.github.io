---
layout: post
title: "通过 Spring 集成 MyBatis 源码理解 Java动态代理"
date: 2017-10-15 21:10:30 +0800
comments: true
categories: [Spring,Mybatis,Java]
description: Spring 集成 Mybatis, 简述 Java 动态代理及源码分析, InvocationHandler里面invoke方法的proxy到底是什么, Java 动态代理在 Spring-mybatis 中的实现
keywords: 从 Spring 集成 Mybatis 到 Java 动态代理,Spring集成Mybatis, Java动态代理在Spring-mybatis中的实现, 细说Java动态代理,Spring Mybatis整合,什么是Java动态代理,Java动态代理详解,Druid使用详解,什么是JAVA动态代理, InvocationHandler里面invoke方法的proxy到底是什么
---
## 前言
因为 `MyBatis` 的易上手性和可控性，使得它成为了`ORM`框架中的首选。近日新起了一个项目，所以重新搭建了一下 `Spring-mybatis`, 下面是搭建笔记和从`Spring-mybatis`源码分析其如何使用`Java动态代理`，希望对大家有帮助。
<!-- more -->
## Spring 集成 Mybatis
`Spring` 集成 `Mybatis`的方式有很多种，大家耳熟能详的`xml`配置方式或者本文的采用的方式：  
首先需要添加`MyBatis`的和`MyBatis-Spring`的依赖，本文使用的`Spring-mybatis`版本是1.3.1。在`mvnrepository`里面我们可以找到当前`Spring-mybatis`依赖的`spring`和`mybatis`版本，最好是选择匹配的版本以避免处理不必要的兼容性问题。因为`MyBatis-Spring`中对`mybatis`的依赖选择了`provided`模式，所以我们不得不额外添加`mybatis`依赖，依赖配置如下。
```xml pom.xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>1.3.1</version>
</dependency>
<dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>3.4.1</version>
</dependency>
```
接下来会我们要创建工厂bean,放置下面的代码在 Spring 的 XML 配置文件中:  
```xml applicationContext.xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
  <property name="dataSource" ref="dataSource" />
</bean>
```  
这个工厂需要一个`DataSource`，就是我们熟知的数据源了。这里我们选择了阿里的`Druid`，同样我们需要引入两个配置
```xml pom.xml
<dependency>
 <groupId>mysql</groupId>
 <artifactId>mysql-connector-java</artifactId>
 <version>5.1.41</version>
</dependency>
<dependency>
 <groupId>com.alibaba</groupId>
 <artifactId>druid</artifactId>
 <version>1.1.2</version>
</dependency>
```            
添加`Spring`配置如下 
```xml applicationContext.xml
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
        <!-- 基本属性 url、user、password -->
        <property name="url">
            <value><![CDATA[${db.url}]]></value>
        </property>
        <property name="username" value="${db.username}"/>
        <property name="password" value="${db.password}"/>       
        <!-- 省略其他配置 -->   
</bean>
```
接下来我们要编写数据库访问对象，大多数人会把它叫做`DAO`或者`Repository`，在这里其被称为`Mapper`，也是因为它的实现方式所决定。要注意的是所指定的映射器类必须是一个接口，而不是具体的实现类。这便因为`Mybatis`的内部实现使用的是`Java动态代理`，而`Java动态代理`只支持接口，关于`动态代理`我们下文有更详细的描述。
```java UserMapper.java
public interface UserMapper {
  @Select("SELECT * FROM users WHERE id = #{userId}")
  User getUser(@Param("userId") String userId);
} 
```
接下来可以使用 `MapperFactoryBean`,像下面这样来把接口加入到 `Spring` 中，这样就把 `UserMapper` 和 `SessionFactory`关联到一起了，原来使用`xml`配置的时候还需要Dao继承`SqlSessionDaoSupport`才能注入`SessionFactory`，这种方式直接通过`Java动态代理`把`SqlSessionFactory`代理给了`UserMapper`，使得我们直接使用`UserMapper`即可。配置如下。
```xml applicationContext.xml
<bean id="userMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
  <property name="mapperInterface" value="org.mybatis.spring.sample.mapper.UserMapper" />
  <property name="sqlSessionFactory" ref="sqlSessionFactory" />
</bean>
```
这样我们已经完成了90%，就差调用了，前提是你`Spring`环境是OK的。调用 `MyBatis` 数据方法现在只需一行代码:
```java FooServiceImpl.java
public class FooServiceImpl implements FooService {

private UserMapper userMapper;

public void setUserMapper(UserMapper userMapper) {
  this.userMapper = userMapper;
}

public User doSomeBusinessStuff(String userId) {
  return this.userMapper.getUser(userId);
}
```
那么问题又来了，每次写一个DAO都需要为其写一个`Bean`配置，那不是累死？于是我们又寻找另一种方案，代替手动声明`*Mapper`。`MapperScannerConfigurer`的出现解决了这个问题， 它会根据你配置的包路径自动的扫描类文件并自动将它们创建成`MapperFactoryBean`，可以在 Spring 的配置中添加如下代码: 
```xml applicationContext.xml
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
  <property name="basePackage" value="com.github.codedrinker.mapper" />
</bean>
```
`basePackage`属性是让你为映射器接口文件设置基本的包路径。你可以使用分号或逗号作为分隔符设置多于一个的包路径。这个时候如果想自定义`sqlSessionFactory`可以添加如下配置：
```xml applicationContext.xml
<property name="sqlSessionFactoryBeanName" value="sqlSessionFactory" />
```
这样以后还有一点点小瑕疵，如果我们数据的`column`名字是`_`连接的，那么它不会那么聪明自动转换为驼峰的变量，所以我们需要对`SqlSessionFactoryBean`做如下配置，但是在1.3.0以后才可以通过xml配置，如果用早起版本的需要注意了。

```xml applicationContext.xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
  <property name="dataSource" ref="dataSource" />
  <property name="configuration">
    <bean class="org.apache.ibatis.session.Configuration">
      <property name="mapUnderscoreToCamelCase" value="true"/>
    </bean>
  </property>
</bean>
```
至此关于`Spring MyBatis`的配置已经全部结束，后面我们会简单说下`Spring MyBatis`中的动态代理。

## 浅析 Java 动态代理
`JDK`自带的动态代理需要了解InvocationHandler接口和Proxy类，他们都是在java.lang.reflect包下。  
`InvocationHandler`是代理实例的调用处理程序实现的接口。每个代理实例都具有一个关联的`InvocationHandler`。对代理实例调用方法时，这个方法会调用`InvocationHandler`的`invoke`方法。
`Proxy`提供静态方法用于创建动态代理类和实例,同时后面自动生成的代理类都是`Proxy`对象。下面我们直接通过代码来分析`Java动态代理`：
`InvocationInterceptor`实现`InvocationHandler`接口，用于处理具体的代理逻辑。
```java InvocationInterceptor.java
/**
 * Created by codedrinker on 12/10/2017.
 */
public class InvocationInterceptor implements InvocationHandler {
    private Object target;

    public InvocationInterceptor(Object target) {
        this.target = target;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("before user create");
        method.invoke(target, args);
        System.out.println("end user create");
        return null;
    }
}
```
`User`和`UserImpl`是被代理对象的接口和类
```java User.java
/**
 * Created by codedrinker on 12/10/2017.
 */
public interface User {
    void create();
}

``` 
```java UserImpl.java
/**
 * Created by codedrinker on 12/10/2017.
 */
public class UserImpl implements User {
    @Override
    public void create() {
        System.out.println("create user");
    }
}
```
`DynamicProxyTest`是测试类，用于创建`InvocationInterceptor`和`Proxy`类以便测试。
```java DynamicProxyTest.java
/**
 * Created by codedrinker on 12/10/2017.
 */
public class DynamicProxyTest {
    public static void main(String[] args) {
        User target = new UserImpl();
        InvocationInterceptor invocationInterceptor = new InvocationInterceptor(target);
        User proxyInstance = (User) Proxy.newProxyInstance(UserImpl.class.getClassLoader(),
                UserImpl.class.getInterfaces(),
                invocationInterceptor);
        proxyInstance.create();
    }
}
```
输入结果如下：
```sh
before user create
create user
end user create
```
很明显，我们通过proxyInstance这个代理类进行方法调用的时候，会在方法调用前后进行输出打印，这样就简单的实现了一个`Java动态代理`例子。动态代理不仅仅是打印输出这么简单，我们可以通过它打印日志，打开关闭事务， 权限检查了等等。当然它更是许多框架的钟爱，就如下文我们要说的`MyBatis`中`Java动态代理`的实现。再多说一句`Spring`的`AOP`也是使用动态代理实现的，当然它同时使用了`Java动态代理`和`CGLib`两种方式。不过`CGLIB`不是本文要讨论的范围。  
注意观察的同学看到上面代码的时候可能发现`invoke`方法的`proxy`参数并没有被使用，笔者查阅了一些相关文档也没有找到合理的说法，只能在源码中看看究竟喽，笔者当前的JDK版本是1.8。我们从入口开始，`Proxy.newProxyInstance`:
```java Proxy.java片段
/*
 * Look up or generate the designated proxy class.
 */
@CallerSensitive
public static Object newProxyInstance(ClassLoader loader,
                                      Class<?>[] interfaces,
                                      InvocationHandler h)
    throws IllegalArgumentException
{
    Class<?> cl = getProxyClass0(loader, intfs);
}
```
如上代码由此可见，它调用了`getProxyClass0`来获取`Proxy Class`，那我们继续往下看。
```java Proxy.java片段
private static Class<?> getProxyClass0(ClassLoader loader,
                                           Class<?>... interfaces) {
    if (interfaces.length > 65535) {
        throw new IllegalArgumentException("interface limit exceeded");
    }
    //If the proxy class defined by the given loader implementing
    //the given interfaces exists, this will simply return the cached copy;
    //otherwise, it will create the proxy class via the ProxyClassFactory
    return proxyClassCache.get(loader, interfaces);
}
```
其实上面写的已经很简单了，如果存在就在`proxyClassCache`里面获取到，如果不存在就使用`ProxyClassFactory`创建一个。当然我们如果看一下`proxyClassCache`变量的话其也是`ProxyClassFactory`对象。
```java 
   private static final WeakCache<ClassLoader, Class<?>[], Class<?>>
        proxyClassCache = new WeakCache<>(new KeyFactory(), new ProxyClassFactory());
```
那么我们直接就去查看`ProxyClassFactory`的实现问题不就解决了吗？
```java Proxy.java片段
    private static final class ProxyClassFactory
        implements BiFunction<ClassLoader, Class<?>[], Class<?>>
    {
        // prefix for all proxy class names
        private static final String proxyClassNamePrefix = "$Proxy";
        //next number to use for generation of unique proxy class names
        private static final AtomicLong nextUniqueNumber = new AtomicLong();
        @Override
        public Class<?> apply(ClassLoader loader, Class<?>[] interfaces) {
           
            String proxyName = proxyPkg + proxyClassNamePrefix + num;
            /*
             * Generate the specified proxy class.
             */
            byte[] proxyClassFile = ProxyGenerator.generateProxyClass(
                proxyName, interfaces, accessFlags);
        }
    }
```
由上代码便一目了然了，为什么我们`Debug`的时候`Proxy`对象是`$Proxy0`，是因为他通过`$Proxy`和`AtomicLong`拼起来的类名，其实这不是重点。重点是`ProxyGenerator.generateProxyClass(proxyName, interfaces, accessFlags)`。这就是生成`class`的地方，它把所有的条件组合好，生成`class`文件，然后再加载到内存里面以供使用。有兴趣的同学可以继续往深处查看。而我们需要做的是获取到他生成的字节码，看一下里面到底是什么？当`saveGeneratedFiles`为`true`的时候会保存`class`文件，所以我们在`DynamicProxyTest`的`main`函数添加一行即可：
```java DynamicProxyTest.java
System.setProperty("sun.misc.ProxyGenerator.saveGeneratedFiles", "true");
```
通过`Debug`我们可以发现，它存储`class`文件的路径是`com/sun/proxy/$Proxy0.class`，所以直接在我们项目的目录下面就能找到它，然后通过`Idea`打开便得到如下代码：
```java $Proxy0.class
public final class $Proxy0 extends Proxy implements User {
    private static Method m1;
    private static Method m2;
    private static Method m3;
    private static Method m0;

    public $Proxy0(InvocationHandler var1) throws  {
        super(var1);
    }

    public final boolean equals(Object var1) throws  {
        try {
            return ((Boolean)super.h.invoke(this, m1, new Object[]{var1})).booleanValue();
        } catch (RuntimeException | Error var3) {
            throw var3;
        } catch (Throwable var4) {
            throw new UndeclaredThrowableException(var4);
        }
    }

    public final String toString() throws  {
        try {
            return (String)super.h.invoke(this, m2, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    public final void create() throws  {
        try {
            super.h.invoke(this, m3, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    public final int hashCode() throws  {
        try {
            return ((Integer)super.h.invoke(this, m0, (Object[])null)).intValue();
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    static {
        try {
            m1 = Class.forName("java.lang.Object").getMethod("equals", new Class[]{Class.forName("java.lang.Object")});
            m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
            m3 = Class.forName("local.dynimicproxy.User").getMethod("create", new Class[0]);
            m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
        } catch (NoSuchMethodException var2) {
            throw new NoSuchMethodError(var2.getMessage());
        } catch (ClassNotFoundException var3) {
            throw new NoClassDefFoundError(var3.getMessage());
        }
    }
}
```
这样好多问题就迎刃而解。  
为什么`Java动态代理`必须是接口，因为生成的类要去实现这个接口。  
`invoke`方法的`proxy`是干嘛的，通过`super.h.invoke(this, m3, (Object[])null);`我们可以发现传递给`invoke`方法的就是`Proxy`本身。  
同时`Proxy`类也通过反射实现了`toString`,`equals`,和`hashcode`等方法。  
自此关于`Java动态代理`的讲解已经告段落，下面让我们简单看一下`Spring-mybatis`中关于`Java动态代理`的使用。
## Java动态代理在Spring-mybatis中的实现  
关于`Spring-mybatis`的实现我们得从`MapperScannerConfigurer`说起，首先`MapperScannerConfigurer`实现了`BeanDefinitionRegistryPostProcessor`接口。而`BeanDefinitionRegistryPostProcessor`依赖于`Spring`框架，简单的说`BeanDefinitionRegistryPostProcessor`使得我们可以将`BeanDefinition`添加到`BeanDefinitionRegistry`中，而`BeanDefinition`描述了一个Bean实例所拥有的实例、结构参数和参数值，简单点说拥有它就可以实例化`Bean`了。`BeanDefinitionRegistryPostProcessor`的`postProcessBeanDefinitionRegistry`方法在`Bean`被定义但还没被创建的时候执行，所以`Spring-mybatis`也是借助了这一点。需要想需要更深入的了解可以查看`Spring`的生命周期。
```java MapperScannerConfigurer.java片段
public class MapperScannerConfigurer implements BeanDefinitionRegistryPostProcessor, InitializingBean, ApplicationContextAware, BeanNameAware {
  /**
   * {@inheritDoc}
   * 
   * @since 1.0.2
   */
  @Override
  public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
    ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    scanner.scan(StringUtils.tokenizeToStringArray(this.basePackage, ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS));
  }
```
由上代码我们可以看到在`postProcessBeanDefinitionRegistry`里面得到`registry`然后使用`ClassPathMapperScanner`开始扫描包路径得到的`Bean`并且注册到`registry`里面。我们接着往里面看。
```java ClassPathMapperScanner.java
@Override
public Set<BeanDefinitionHolder> doScan(String... basePackages) {
Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);

if (beanDefinitions.isEmpty()) {
  logger.warn("No MyBatis mapper was found in '" + Arrays.toString(basePackages) + "' package. Please check your configuration.");
} else {
  processBeanDefinitions(beanDefinitions);
}

return beanDefinitions;
}
```
`ClassPathMapperScanner`继承了`Spring`的`ClassPathBeanDefinitionScanner`所以调用父类的`doScan`方法就可以加载`Bean`然后再通过`processBeanDefinitions`方法加工成`MyBatis`需要的`Bean`。
```java ClassPathMapperScanner.java片段
private void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
    GenericBeanDefinition definition;
    for (BeanDefinitionHolder holder : beanDefinitions) {
      definition = (GenericBeanDefinition) holder.getBeanDefinition();
      definition.setBeanClass(this.mapperFactoryBean.getClass());
    }
  }
```
如上代码循环了所有由`Spring`容器解析出来的`beanDefinitions`然后把他们的`BeanClass`修改为`mapperFactoryBean`，这就进入了行文的重点。我们翻看到`MapperFactoryBean`:
```java MapperFactoryBean.java片段
@Override
protected void checkDaoConfig() {
super.checkDaoConfig();

notNull(this.mapperInterface, "Property 'mapperInterface' is required");

Configuration configuration = getSqlSession().getConfiguration();
if (this.addToConfig && !configuration.hasMapper(this.mapperInterface)) {
  try {
    configuration.addMapper(this.mapperInterface);
  } catch (Exception e) {
    logger.error("Error while adding the mapper '" + this.mapperInterface + "' to configuration.", e);
    throw new IllegalArgumentException(e);
  } finally {
    ErrorContext.instance().reset();
  }
}
}
```
其调用了`Configuration`的`addMapper`方法，这样就把`Bean`交给`MyBatis`管理了。那么`checkDaoConfig`是什么时候调用的呢？我们翻看其父类`DaoSupport`可以看到:
```java DaoSupport.java片段
public abstract class DaoSupport implements InitializingBean {
    @Override
  public final void afterPropertiesSet() throws IllegalArgumentException, BeanInitializationException {
    checkDaoConfig();
  }
}
```
因为`DaoSupport`实现了`InitializingBean`并重写`afterPropertiesSet`方法，了解`Spring`生命周期的同学知道`afterPropertiesSet`方法会在资源加载完以后，初始化bean之前执行。我们继续查看`addMapper`方法。
```java MapperRegistry.java片段
public <T> void addMapper(Class<T> type) {
    if (type.isInterface()) {
      if (hasMapper(type)) {
        throw new BindingException("Type " + type + " is already known to the MapperRegistry.");
      }
      boolean loadCompleted = false;
      try {
        knownMappers.put(type, new MapperProxyFactory<T>(type));
        // It's important that the type is added before the parser is run
        // otherwise the binding may automatically be attempted by the
        // mapper parser. If the type is already known, it won't try.
        MapperAnnotationBuilder parser = new MapperAnnotationBuilder(config, type);
        parser.parse();
        loadCompleted = true;
      } finally {
        if (!loadCompleted) {
          knownMappers.remove(type);
        }
      }
    }
}
```
`addMapper`方法最终创建了`MapperProxyFactory`对象，在`MapperProxyFactory`里面我们两眼泪汪汪地发现了似曾相识的代码：
```java MapperProxyFactory.java片段
protected T newInstance(MapperProxy<T> mapperProxy) {
    return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[] { mapperInterface }, mapperProxy);
}

public T newInstance(SqlSession sqlSession) {
    final MapperProxy<T> mapperProxy = new MapperProxy<T>(sqlSession, mapperInterface, methodCache);
    return newInstance(mapperProxy);
}
```
而`MapperProxy`实现了`InvocationHandler`方法，最终实现对`Bean`的代理，同时获取到上下文的`sqlSession`以供使用。具体生成过程我们不再累述，直接通过其源码结束本篇文章：
```java MapperProxy.java片段
public class MapperProxy<T> implements InvocationHandler, Serializable {

  private static final long serialVersionUID = -6424540398559729838L;
  private final SqlSession sqlSession;
  private final Class<T> mapperInterface;
  private final Map<Method, MapperMethod> methodCache;

  public MapperProxy(SqlSession sqlSession, Class<T> mapperInterface, Map<Method, MapperMethod> methodCache) {
    this.sqlSession = sqlSession;
    this.mapperInterface = mapperInterface;
    this.methodCache = methodCache;
  }

  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      if (Object.class.equals(method.getDeclaringClass())) {
        return method.invoke(this, args);
      } else if (isDefaultMethod(method)) {
        return invokeDefaultMethod(proxy, method, args);
      }
    } catch (Throwable t) {
      throw ExceptionUtil.unwrapThrowable(t);
    }
    final MapperMethod mapperMethod = cachedMapperMethod(method);
    return mapperMethod.execute(sqlSession, args);
  }
}
```
## 参考链接
[Spring Mybatis 配置](http://www.mybatis.org/spring/getting-started.html)    
[Spring Boot Mybatis](http://www.mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)  
[InvocationHandler Proxy Parameter](https://stackoverflow.com/questions/22930195/understanding-proxy-arguments-of-the-invoke-method-of-java-lang-reflect-invoca)
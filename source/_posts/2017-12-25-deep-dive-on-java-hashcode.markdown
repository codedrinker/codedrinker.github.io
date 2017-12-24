---
layout: post
title: "细说 Java hashCode"
date: 2017-12-24 01:04:24 +0800
comments: true
categories: [JAVA]
description: hashCode 定义?,Java hashCode 生成原理,hashCode 的用途
keywords: hashCode 方法是什么?,Java hashCode 是怎么生成的,java hashCode 原理是什么,什么场景下会使用 hashCode,hashCode 的用途
---
## 前言
写过 `Java` 程序的同学一定都知道 `hashCode` 方法，它是 `Object` 对象的一个 `native` 方法。无论是我们平常使用的 `HashMap` 还是重写 `equals` 方法的时候，都会接触到 `hashCode` 方法，那么它究竟是怎么生成的，又有什么作用呢？笔者带着这个疑问开始探寻。
<!-- more -->

## hashCode 方法的定义
在 [`jdk api`](https://docs.oracle.com/javase/7/docs/api/) 中 关于 `hashCode` 有如下说明：

```sh
Returns a hash code value for the object. 
This method is supported for the benefit of hash tables such as those provided by HashMap.
The general contract of hashCode is:

Whenever it is invoked on the same object more than once during an execution of a Java application, 
the hashCode method must consistently return the same integer, 
provided no information used in equals comparisons on the object is modified. 
This integer need not remain consistent from one execution of an application to another execution of the same application.
If two objects are equal according to the equals(Object) method, 
then calling the hashCode method on each of the two objects must produce the same integer result.
It is not required that if two objects are unequal according to the equals(java.lang.Object) method, 
then calling the hashCode method on each of the two objects must produce distinct integer results. 
However, the programmer should be aware that producing distinct integer results for unequal objects may improve the performance of hash tables.
As much as is reasonably practical, 
the hashCode method defined by class Object does return distinct integers for distinct objects. 
(This is typically implemented by converting the internal address of the object into an integer, 
	but this implementation technique is not required by the JavaTM programming language.)
``` 
其大致意思如下

```sh
只要在Java应用程序的执行过程中多次调用同一个对象，
hashCode方法必须始终返回相同的整数，
前提是在对象的equals比较中没有使用的信息被修改。  
从应用程序的一次执行到同一应用程序的另一次执行，此整数不必保持一致。  

如果两个对象按照equals（Object）方法相等，
那么在两个对象的每一个上调用hashCode方法必须产生相同的整数结果。  
如果两个对象根据equals（java.lang.Object）方法不相等，
则不要求对两个对象中的每个对象调用hashCode方法都必须产生不同的整数结果。  
但是，程序员应该知道，为不相等的对象生成不同的整数结果可以提高散列表的性能。  

尽可能多地合理实用，由类Object定义的hashCode方法确实为不同的对象返回不同的整数。  
这通常通过将对象的内部地址转换为整数来实现，但JavaTM编程语言不需要此实现技术。 
```
所以由上可以得到两条有用的信息，同一个对象 `hashcode` 的值在一次运行中一定相等，并且不同对象的 `hashcode` 一定不同，但是他还备注通常使用内部地址转换，但是 `JAVA` 不是使用这种方式实现的，那么怎么实现的呢？

## hashCode 实现原理
### hashcode 源码
`OpenJDK` 的源码可以直接查看，所以我们就选择查看一下其源码一看究竟。  
我们可以看到`src/share/vm/prims/jvm.h`和`src/share/vm/prims/jvm.cpp`两个文件中有关于 `hashcode` 的说明如下：
```
   JVM_ENTRY(jint, JVM_IHashCode(JNIEnv* env, jobject handle))
   JVMWrapper("JVM_IHashCode");
   // as implemented in the classic virtual machine; return 0 if object is NULL
   return handle == NULL ? 0 : ObjectSynchronizer::FastHashCode (THREAD, JNIHandles::resolve_non_null(handle)) ;
 JVM_END
```
我们继续进入`FashHashCode`里面查看，其位于`src/share/vm/runtime/synchronizer.cpp`文件，相对代码比较多，我们只摘取关键部分：
{% codeblock lang:cpp %}
{% raw %}
  // Inflate the monitor to set hash code
  monitor = ObjectSynchronizer::inflate(Self, obj);
  // Load displaced header and check it has hash code
  mark = monitor->header();
  assert (mark->is_neutral(), "invariant") ;
  hash = mark->hash();
  if (hash == 0) {
    hash = get_next_hash(Self, obj);
    temp = mark->copy_set_hash(hash); // merge hash code into header
    assert (temp->is_neutral(), "invariant") ;
    test = (markOop) Atomic::cmpxchg_ptr(temp, monitor, mark);
    if (test != mark) {
      // The only update to the header in the monitor (outside GC)
      // is install the hash code. If someone add new usage of
      // displaced header, please update this code
      hash = test->hash();
      assert (test->is_neutral(), "invariant") ;
      assert (hash != 0, "Trivial unexpected object/monitor header usage.");
    }
  }
  // We finally get the hash
  return hash;
{% endraw %}
{% endcodeblock %}
`monitor` 相关代码我们先略过不理，通过 `if` 语句我们可以看出，当 `hash`为0时候需要调用 `get_next_hash` 生成一个新的 `hash`，那么我们便可以继续前行。
{% codeblock lang:cpp %}
{% raw %}
static inline intptr_t get_next_hash(Thread * Self, oop obj) {
  intptr_t value = 0 ;
  if (hashCode == 0) {
     // This form uses an unguarded global Park-Miller RNG,
     // so it's possible for two threads to race and generate the same RNG.
     // On MP system we'll have lots of RW access to a global, so the
     // mechanism induces lots of coherency traffic.
     value = os::random() ;
  } else
  if (hashCode == 1) {
     // This variation has the property of being stable (idempotent)
     // between STW operations.  This can be useful in some of the 1-0
     // synchronization schemes.
     intptr_t addrBits = cast_from_oop<intptr_t>(obj) >> 3 ;
     value = addrBits ^ (addrBits >> 5) ^ GVars.stwRandom ;
  } else
  if (hashCode == 2) {
     value = 1 ;            // for sensitivity testing
  } else
  if (hashCode == 3) {
     value = ++GVars.hcSequence ;
  } else
  if (hashCode == 4) {
     value = cast_from_oop<intptr_t>(obj) ;
  } else {
     // Marsaglia's xor-shift scheme with thread-specific state
     // This is probably the best overall implementation -- we'll
     // likely make this the default in future releases.
     unsigned t = Self->_hashStateX ;
     t ^= (t << 11) ;
     Self->_hashStateX = Self->_hashStateY ;
     Self->_hashStateY = Self->_hashStateZ ;
     Self->_hashStateZ = Self->_hashStateW ;
     unsigned v = Self->_hashStateW ;
     v = (v ^ (v >> 19)) ^ (t ^ (t >> 8)) ;
     Self->_hashStateW = v ;
     value = v ;
  }
  value &= markOopDesc::hash_mask;
  if (value == 0) value = 0xBAD ;
  assert (value != markOopDesc::no_hash, "invariant") ;
  TEVENT (hashCode: GENERATE) ;
  return value;
}{% endraw %}
{% endcodeblock %}
通过上述代码我们看到，其实 `hashCode` 的生成有6中方式  
1. 随机数  
2. 对象的内存地址的函数  
3. 固定值，这个只是为了进行灵敏度测试  
4. 递增序列  
5. int类型的该对象的内存地址   
6. 结合当前线程和xorshift生成  

通过 [globals.hpp](http://hg.openjdk.java.net/jdk8u/jdk8u/hotspot/file/87ee5ee27509/src/share/vm/runtime/globals.hpp#l1127) 我们可以发现，JDK8 默认为5，也就是最后一种。  
`product(intx, hashCode, 5, "(Unstable) select hashCode generation algorithm")`    
当然，OpenJDK6，7中用的都是第一种方案，那么问题又来了，既然都是随机数，那么怎么确保每次都一样的呢？

### 对象头
这里就需要引入一个`对象头`的概念，每次对象生成以后，都需要找一个地方存储一下这个对象的hashCode和锁信息，这就是`对象头`，英文称之为 `Mark Word`。这样一来我们就明白了，每次生成对象以后都会把它的`hashCode`存起来，这样无论对象怎么在新生代，老年代之间`游走`都不会改变其`hashCode`的值，然而事实并没有那么简单。

### 偏向锁
这时候我们翻回来看刚才略过的内容，`ObjectSynchronizer::FastHashCode()`里面的其他逻辑。
{% codeblock lang:cpp %}
{% raw %}
if (UseBiasedLocking) {
    // NOTE: many places throughout the JVM do not expect a safepoint
    // to be taken here, in particular most operations on perm gen
    // objects. However, we only ever bias Java instances and all of
    // the call sites of identity_hash that might revoke biases have
    // been checked to make sure they can handle a safepoint. The
    // added check of the bias pattern is to avoid useless calls to
    // thread-local storage.
    if (obj->mark()->has_bias_pattern()) {
      // Box and unbox the raw reference just in case we cause a STW safepoint.
      Handle hobj (Self, obj) ;
      // Relaxing assertion for bug 6320749.
      assert (Universe::verify_in_progress() ||
              !SafepointSynchronize::is_at_safepoint(),
             "biases should not be seen by VM thread here");
      BiasedLocking::revoke_and_rebias(hobj, false, JavaThread::current());
      obj = hobj() ;
      assert(!obj->mark()->has_bias_pattern(), "biases should be revoked by now");
    }
  }
{% endraw %}
{% endcodeblock %}
由上述代码我们可以得知，当前对象处于`偏向锁`时，会清除`偏向锁`通过从`锁`上面取回`Mark Word` 信息。为什么提到取回呢？之前消失了吗？是的，现在就需要解释一下`偏向锁`了。  
`Hotspot` 的作者经过以往的研究发现大多数情况下锁不仅不存在多线程竞争，而且总是由同一线程多次获得，为了让线程获得锁的代价更低而引入
了偏向锁。当一个线程访问同步块并获取锁时，会在对象头和栈帧中的锁记录里存储锁偏向的线程 `ID`，以后该线程在进入和退出同步块时不需要花费 `CAS` 操作来加锁和解锁，而只需简单的测试一下对象头的 `Mark Word` 里是否存储着指向当前线程的偏向锁，如果测试成功，表示线程已经获得了锁，如果测试失败，则需要再测试下 `Mark Word` 中偏向锁的标识是否设置成 1（表示当前是偏向锁），如果没有设置，则使用 `CAS` 竞争锁，如果设置了，则尝试使用 `CAS` 将对象头的偏向锁指向当前线程。所以我们便知道为什么有`取回`这个概念了。然而代码带没有结束。

### 轻量级锁
轻量级锁相对比较简单，`JVM`会在当前的线程栈桢中创建用于存放锁的空间，同时将对象头中的`Mark Word`复制到锁记录中，也称作 `Displaced Mark Word`。比较复杂的是`重量级`锁。

### 重量级锁
这个时候如果多个线程来竞争资源，就会发生`锁膨胀`，这样因为需要保存竞争资源需要`wait`的线程和相关信息，就引入了`monitor`的概念。于是这时候就把`Mark Word`存放到了`Monitor`里面，当然`Monitor`不仅仅用于存储对象的`Mark Word`，具体的作用就不是本文的重点了。

## hashCode 的用途
`hashCode` 的唯一性决定了他可以用来生成`HashMap`的key，同时也能判断对象是否为同一个对象。另外我们再重写他的时候要多加注意，因为`JVM`会根据它做一些性能优化。

## 总结
此文为笔者学习 `hashCode` 的笔记，如有问题欢迎指正。

## 参考文献
[OpenJDK 源码](http://hg.openjdk.java.net/jdk8u/jdk8u/hotspot/file/87ee5ee27509/src/share/vm)  
[Oracle JDK Docs](https://docs.oracle.com/javase/7/docs/api/)

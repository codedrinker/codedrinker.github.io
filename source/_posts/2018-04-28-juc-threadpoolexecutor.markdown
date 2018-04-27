---
layout: post
title: "JUC系列之-ThreadPoolExecutor"
date: 2018-04-28 00:22:21 +0800
comments: true
categories: [java,thread]
---
## 简介
ThreadPoolExecutor 是 JUC 里面的成员，我们可以使用他轻松的创建线程池。  
当然我们可以自己创建线程，但是有 ThreadPoolExecutor，他的好处还是很多的，比如可以帮我们管理线程，不需要我们手动的关闭线程，同时可以通过各种不同的线程创建和销毁策略应对不同的多线程场景。合理的使用 ThreadPoolExecutor 会让我们的开发效率和性能事半功倍。

<!-- more -->

## 使用

### 创建 
我们可以通过ThreadPoolExecutor来创建一个线程池。

```
new  ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, milliseconds,runnableTaskQueue, handler);
```
创建一个线程池需要输入几个参数，需要简单的讲解一下。
corePoolSize：当提交一个任务到线程池时，线程池会创建一个线程来执行任务，即使其他空闲的基本线程能够执行新任务也会创建线程，等到需要执行的任务数大于线程池基本大小时就不再创建。这个时候新的线程会放到阻塞队列里面。也就是下面的参数。

runnableTaskQueue：阻塞队列有很多种，分别使用不同的场景。
ArrayBlockingQueue

-  ArrayBlockingQueue：是一个基于数组结构的有界阻塞队列，此队列按 FIFO（先进先出）原则对元素进行排序。   
-  LinkedBlockingQueue：一个基于链表结构的阻塞队列，此队列按FIFO （先进先出）排序元素，吞吐量通常要高于ArrayBlockingQueue。静态工厂方法Executors.newFixedThreadPool()使用了这个队列。    
-  SynchronousQueue：一个不存储元素的阻塞队列。每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于LinkedBlockingQueue，静态工厂方法Executors.newCachedThreadPool使用了这个队列。  
-  PriorityBlockingQueue：一个具有优先级得无限阻塞队列。  

maximumPoolSize：线程池允许创建的最大线程数。如果队列满了，并且已创建的线程数小于最大线程数，则线程池会再创建新的线程执行任务。值得注意的是如果使用了无界的任务队列这个参数就没什么效果。

ThreadFactory：用于设置创建线程的工厂，可以创建线程的时候指定名字和一些其他配置，方便记录和调试。

RejectedExecutionHandler：当队列和线程池都满了，这个时候线程池已经出现负载问题，不能处理新的任务了，所以需要一个策略来处理。可选的策略如下，当然我们可以实现RejectedExecutionHandler接口自定义策略。

-  AbortPolicy：直接抛出异常。    
-  CallerRunsPolicy：只用调用者所在线程来运行任务。    
-  DiscardOldestPolicy：丢弃队列里最近的一个任务，并执行当前任务。    
-  DiscardPolicy：不处理，丢弃掉。    

keepAliveTime：线程池的工作线程空闲后，保持存活的时间。所以如果任务很多，并且每个任务执行的时间比较短，可以调大这个时间，提高线程的利用率。减少因频繁创建线程消耗的时间。  
TimeUnit：可选的单位有天（DAYS），小时（HOURS），分钟（MINUTES），毫秒(MILLISECONDS)，微秒(MICROSECONDS, 千分之一毫秒)和毫微秒(NANOSECONDS, 千分之一微秒)。

## 使用
使用方式很简单，有两种方式，一种是直接execute，这样直接可以运营一个 Runnable的类，但是不能获得返回值，另一种方式是使用submit，调用成功以后会获得一个future，这样就可以通过这个future查看当前线程的运行状态。
```java
public class TheadPoolTest {

    public static void main(String[] args) {
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(10, 50, 60, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
        threadPoolExecutor.execute(() -> System.out.println(Thread.currentThread().getName()));
        Future<?> future = threadPoolExecutor.submit(() -> System.out.println(Thread.currentThread().getName()));
        while (!future.isDone()){
            System.out.println("Doing");
        }
        System.out.println(future.isDone());
    }
}
```

## 配置
主要的配置参数就是coreSize了，其他的参数主要还是在配置coreSize使用。通常情况下任务分为CPU密集型任务和IO密集型任务
CPU密集型任务配置尽可能少的线程数量，如配置Ncpu+1个线程的线程池，可以使用Executors.newFixedThreadPool()创建。
IO密集型任务则由于需要等待IO操作，线程并不是一直在执行任务，则配置尽可能多的线程，如2*Ncpu。混合型的任务，可以使用 Executors.newCachedThreadPool 创建。
## 关闭
### shutdown
将线程池的状态设置成SHUTDOWN状态，然后中断所有没有正在执行任务的线程。
### shutdownNow
遍历线程池中的工作线程，然后逐个调用线程的interrupt方法来中断线程，所以无法响应中断的任务可能永远无法终止。  

当调用上述任何一个方式，isShutdown方法就会返回true。当所有任务直接完成以后，isTermined方法会返回true。至于我们应该调用哪一种方法来关闭线程池，应该由提交到线程池的任务特性决定，通常调用shutdown来关闭线程池，如果任务不一定要执行完，则可以调用shutdownNow。

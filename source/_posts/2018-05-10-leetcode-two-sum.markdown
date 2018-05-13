---
layout: post
title: "每日一则 LeetCode: Two Sum"
date: 2018-05-10 23:36:59 +0800
comments: true
categories: [LeetCode]
---
## 描述
Given an array of integers, return indices of the two numbers such that they add up to a specific target.  
You may assume that each input would have exactly one solution, and you may not use the same element twice.
```
Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].
```

## 中文解释
给定一个整型数组和一个给定的整数，返回两个数加和等于给定数的下标值。假设答案只有一个并且数组中没有重复的整数。
<!-- more -->
## 解题思路
首先循环数组中的整数，巧妙的定义一个 HashMap，用 key 记录整数的值，用 value 记录 该整数的下标。  
使用 `map.get(target-nums[i]);` 判断其是否存在，如果存在说明给定的值减去当前的值的整数已经存在，意思就是说已经找到了加和等于给定数的两个值，他们的下标就放在了map的 value里面，直接取出即可。那么可以判断循环结束了，如果不存在那么就继续把当前值和下标放到 Map中。

## 源码
```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] result = new int[2];
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer integer = map.get(target - nums[i]);
            if (integer != null) {
                result[0] = integer;
                result[1] = i;
                break;
            }
            map.put(nums[i], i);

        }
        return result;
    }
}
```

## 原题地址
https://leetcode.com/problems/two-sum/
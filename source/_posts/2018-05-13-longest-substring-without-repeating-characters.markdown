---
layout: post
title: "每日一则 LeetCode: Longest Substring Without Repeating Characters"
date: 2018-05-13 14:42:51 +0800
comments: true
categories: [LeetCode]
---
## 描述

Given a string, find the length of the longest substring without repeating characters.

Examples:

Given "abcabcbb", the answer is "abc", which the length is 3.

Given "bbbbb", the answer is "b", with the length of 1.

Given "pwwkew", the answer is "wke", with the length of 3. Note that the answer must be a substring, "pwke" is a subsequence and not a substring.
## 中文解释

给定一个字符串，获得它不重复连续子序列的长度
<!-- more -->
## 解题思路
这题没有什么巧妙的方式，误区是我们不需要太关注子字符串是什么，只要记录它的长度最终比较就可以了，所以求解方式比较简单，直接循环字符串的每一个字节，判断是否出现过，如果出现过从头计算，更新重复的index，如果没有出现过，计数+1继续循环。

## 源码
```java
public class LongestSubstringWithoutRepeatingCharacters {
    public int lengthOfLongestSubstring(String s) {
        int repeatedIndex = 0, length = 0;
        Map<Character, Integer> map = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            if (map.containsKey(s.charAt(i))) {
                repeatedIndex = Math.max(map.get(s.charAt(i)), repeatedIndex);
            }

            length = Math.max(length, i - repeatedIndex + 1);
            map.put(s.charAt(i), i + 1);
        }
        return length;
    }

    public static void main(String[] args) {
        LongestSubstringWithoutRepeatingCharacters lswrc = new LongestSubstringWithoutRepeatingCharacters();
        System.out.println(lswrc.lengthOfLongestSubstring("abcabcbb") == 3);
        System.out.println(lswrc.lengthOfLongestSubstring("bbbbb") == 1);
        System.out.println(lswrc.lengthOfLongestSubstring("pwwkew") == 3);

    }
}
```

## 原题地址
https://leetcode.com/problems/longest-substring-without-repeating-characters
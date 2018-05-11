---
layout: post
title: "每日一则 LeetCode: Add Two Numbers"
date: 2018-05-11 22:37:53 +0800
comments: true
categories: [LeetCode]
---
## 描述
You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.
```
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Explanation: 342 + 465 = 807.
```

## 中文解释
给定两个非空的链表里面分别包含不等数量的正整数，每一个节点都包含一个正整数，肯能是0，但是不会是`01`这种情况。我们需要按照倒序计算他们的和然后再次倒序输出。

## 解题思路
这题没有什么巧妙的方式，不过仔细思考一下，它其实是在模拟正常的多位数加法。我们试想在计算多位数加法的时候，从最末位开始计算，如果大于10就进位，并加到下次高位计算中；如果不大于10继续计算；就这样我们就有了下面的阶梯思路。  
一次循环就可以搞定，通过判断他们其中是不是空，就像是多位数加减法，如果一个高位没有了，当然也要继续计算，所以有了下面默认 `int carry = 0`，然后通过 `sum / 10` 算出进位，通过 `sum % 10` 算出当前位，这个题就迎刃而解。


## 源码
```java
public class AddTwoNumbers {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode tempNode = new ListNode(0);
        ListNode a = l1, b = l2, curr = tempNode;
        int carry = 0;
        while (a != null || b != null) {
            int x = a != null ? a.val : 0;
            int y = b != null ? b.val : 0;
            int sum = carry + x + y;
            carry = sum / 10;
            curr.next = new ListNode(sum % 10);
            curr = curr.next;
            if (a != null) a = a.next;
            if (b != null) b = b.next;
        }

        if (carry > 0) {
            curr.next = new ListNode(carry);
        }

        return tempNode.next;
    }

    public static void main(String[] args) {
        ListNode l1 = new ListNode(2);
        l1.add(new ListNode(4));
        l1.add(new ListNode(3));
        ListNode l2 = new ListNode(5);
        l2.add(new ListNode(6));
        l2.add(new ListNode(4));
        ListNode listNode = new AddTwoNumbers().addTwoNumbers(l1, l2);
        System.out.println(listNode.val);
        while (listNode.next != null) {
            System.out.println(listNode.next.val);
            listNode = listNode.next;
        }
    }
}

class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }

    public void add(ListNode next) {
        ListNode last = getLast(this);
        last.next = next;
    }

    private ListNode getLast(ListNode next) {
        while (next.next != null) {
            return getLast(next.next);
        }
        return next;
    }
}
```

## 原题地址
https://leetcode.com/problems/add-two-numbers/
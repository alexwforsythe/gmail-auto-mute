# gmail-auto-mute

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alexwforsythe)

- [ ] @todo google workspace link

A Gmail add-on that truly mutes threads by auto-archiving direct replies on a
schedule based on user-defined filters.

## 🫟 Problem

I get a lot of emails from recruiters that I want to keep in case I
need them later, so I move them to the "recruiters" label (add label + archive) to get them out of my
inbox. Whenever the sender replies to one of those threads, it gets moved back
to my inbox and I have to manually archive it again, which is annoying.

## ✅ Solution

This automatically archives new replies to archived threads on a schedule, based
on user-defined filters:

- [x] A user-defined label
  - [ ] Multiple labels
- [ ] A user-defined list of senders
- [x] Include or exclude read threads
- [x] Include or exclude important threads
- [ ] Include or exclude starred threads

### ❓ Why can't I use a filter?

When you add a label to a thread in Gmail, it actually applies to the most
recent message instead of the thread itself[^1]. New messages in the thread
therefore don't inherit the label automatically, so a filter like this won't do
anything[^2][^3]:

> If a new message has filter X, skip the inbox

In fact, new replies address directly to you will always move a thread back to
the inbox, even if it's muted! So the only solution is to use Google Apps Script
to automate the manual process of re-archiving these threads.

## Usage

> ℹ️ The first time the add-on runs—from your schedule or when you press "Run
> now"—it will only clean up replies in the past 1 month. This is to avoid
> errors when processing huge inboxes.

- [ ] @todo add some instructions / images

## 📋 To do

- [ ] handle errors
  - [ ] quota limits
- [ ] handle edge cases
  - [ ] email manually moved out?
  - [ ] changed to different label?

---

[^1]: <https://developers.google.com/workspace/gmail/api/guides/labels#manage_labels_on_messages_threads>

[^2]: <https://stackoverflow.com/questions/50394493/how-to-search-gmail-for-conversations-in-the-inbox-and-with-a-specific-label>

[^3]: <https://er4hn.info/blog/2024.10.26-gmail-labels/>

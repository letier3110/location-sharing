### what it is

Imagine you need to share your live location with your buddy. But you don't have any social app with similar functionality. Well, now you have it!

### how to run this service locally

We can start our server with the following command. Note we need to explicitly grant access to the file system and network because Deno is secure by default.

```
deno run --allow-read --allow-net main.ts
```

Now if you visit http://localhost:8080 you will be able to start a chat session. You can open 2 simultaneous windows and try chatting with yourself.
## ✨ Simple-Async-Context
TC39 - Async Context for JavaScript

## 💼 How to install?

```sh
$ npm i simple-async-context
```
```sh
$ yarn add simple-async-context
```

## 💪 Motivation
Async/await syntax improved in ergonomics of writing asynchronous JS. 
It allows developers to think of asynchronous code in terms of synchronous code. 
The behavior of the event loop executing the code remains the same as in a promise chain. 
However, passing code through the event loop loses implicit information from the call site. 

And knowing the call is call site of a function is crutial for a variety of purposes. For example, it allows for: 
- attribution of side effects in a software
- tracing tools to provide useful information among other things. 

That's why the feature and this polyfill are usefull 🙃.

## 📚 How To Use?
An example is worth a thousand words, please check the code below 🫡

```tsx
import { AsyncContext } from 'simple-async-context';

const context = new AsyncContext.Variable();

const wait = (timeout: number) => new Promise(r => setTimeout(r, timeout));
const randomTimeout = () => Math.random() * 1000;

async function main() {

  context.get(); // => 'top'

  await wait(randomTimeout());

  context.run("A", () => {
    context.get(); // => 'A'

    setTimeout(() => {
      context.get(); // => 'A'
    }, randomTimeout());

    context.run("B", async () => { // contexts can be nested.
      await wait(randomTimeout());

      context.get(); // => 'B'


      context.get(); // => 'B'  // contexts are restored 

      setTimeout(() => {
        context.get(); // => 'B'
      }, randomTimeout());
    });


    context.run("C", async () => { // contexts can be nested.
      await wait(randomTimeout());

      context.get(); // => 'C'

      await wait(randomTimeout());

      context.get(); // => 'C' 

      setTimeout(() => {
        context.get(); // => 'C'
      }, randomTimeout());
    });

  });

  await wait(randomTimeout());

  context.get(); // => 'top'
}

context.run("top", main);

```

## Snapshot

// TODO

## Tracking

// TODO


## :book: License

The MIT License

Copyright (c) 2022 Ilias Bhallil <ilias.bhal@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

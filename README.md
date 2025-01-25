
![Illustration](https://github.com/iliasbhal/simple-async-context/blob/main/assets/illustration.png?raw=true)


![NPM License](https://img.shields.io/npm/l/simple-async-context)

## ✨ Simple-Async-Context
Polyfill implementing the [TC39 proposal for AsyncContext](https://github.com/tc39/proposal-async-context) in Javascript.

## 💼 How to install?

```sh
$ npm i simple-async-context
```
```sh
$ yarn add simple-async-context
```

## 💪 Motivation
Promises and async/await syntax improved the ergonomics of writing asynchronous JavaScript. It allows developers to think of asynchronous code in terms of synchronous code. The behavior of the event loop executing the code remains the same in an asynchronous block. However, the event loop loses implicit information about the call site.

Knowing the call site of a function is crucial for a variety of purposes. For example, it allows for: (non-exhaustive list)
	•	Attribution of side effects in software.
	•	Tracing tools and profilers to analytize the code.
  
That's why the feature and this polyfill are useful 🙃.


## 📚 How To Use?

1. Make sure that your code is compiled to remove native async/await. The simplest is to target `ES6` in your `tsconfig.json`. Another option would be to use babel with the config below. But other tools can do the trick as well.

```tsx
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6"
  }
}

// OR

// .babelrc
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-typescript"
  ]
}
```


2. An image is worth a thousand words.
Please check the code below 🫡

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
      context.get(); // => 'B'

      await wait(randomTimeout());

      context.get(); // => 'B'

      await wait(randomTimeout());

      context.get(); // => 'B'  // contexts are restored 

      setTimeout(() => {
        context.get(); // => 'B'
      }, randomTimeout());
    });


    context.run("C", async () => { // contexts can be nested.
      context.get(); // => 'C'

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

Copyright (c) 2025 Ilias Bhallil <ilias.bhal@gmail.com>

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

# Useage

```bash
npm install --save vuex-weex
```
and install [weex-vuex-loader](https://github.com/kmCha/weex-vuex-loader) for webpack.

then make sure your `store.js` is in the directory of `src/vuex/`

now you can access your store object inside the `.we` file:

```js
// webpack.config.js
//...
module: {
  loaders: [
    {
      test: /\.we(\?[^?]+)?$/,
      loaders: ['weex-loader', 'weex-vuex-loader?store']
    }
  ]
}
//...

// store.js
var Vuex = require('vuex-weex');
var state = {
  count: 0
};
var mutations = {
  inc: function(state) {
    state.count++;
  }
};
var getters = {
  wrappedCount: function(store) {
    return store.state.count + '次';
  }
};
module.exports = new Vuex.Store({
  state: state,
  mutations: mutations,
  getters: getters
});

// component.we
<template>
  <text>{{count}}</text>
  <div onclick="inc">递增</div>
</template>

<script>
  module.exports = {
    computed: {
      count: function() {
        return this._store.getters.wrappedCount;
      }
    },
    methods: {
      inc: function() {
        this._store.commit('inc');
      }
    }
  }
<script>
```

Gradients: https://jsfiddle.net/dx7swoqa/1/

# Node integration

If you decide to use nodeIntegration in the future, use craco and set webpack target to electron-renderer like this:

```
module.exports = {
  webpack: {
    configure: {
      target: 'electron-renderer',
    },
  },
}
```

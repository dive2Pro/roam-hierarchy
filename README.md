# Roam toolbar 

## style selection

![](https://github.com/dive2Pro/roam-toolbar/blob/main/Toolbar%20demo.gif)

## reference transforms

![](https://github.com/dive2Pro/roam-toolbar/blob/main/Toolbar%20reference%20transform.gif)


## block transforms

![](https://github.com/dive2Pro/roam-toolbar/blob/main/Toolbar%20block%20transform.gif)


you can try it before avaiable on roam-depot

```js
    var existing = document.getElementById("roam-toolbar");
    if (!existing) {
    var extension = document.createElement("script");
    extension.src = "https://unpkg.com/@dive2pro/roam-toolbar@0.0.1/build/main.js";
    extension.id = "roam-toolbar";
    extension.async = true;
    extension.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(extension);
    }
```

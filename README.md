:star2: A cli tool to get all of `@types/*` for your project dependencies. Happier with `typescript` :heart:

![](https://raw.githubusercontent.com/Bin-Huang/tyty/master/image/example.PNG)

```
npm i tyty -g
```

# How To Use

Just open command line in your project, and press `tyty` + enter. All type declarations(`@types/*`) you need will be downloaded base on package.json.

If the package.json is no existed in current folder, `tyty` will try to find it in superior folder and repeats(if is no existed too)

```
  Usage: tyty [options]

  Options:

    -V, --version   output the version number
    -s, --save      add type declaration as a dependency
    -d, --save-dev  (default) add type declaration as a dev-dependency
    -h, --help      output usage information
```

# Contributes
- welcome `issuse` when have any question, bug, suggestion...
- welcome `fork` and `Pull Request`
- share the tool with friends and colleagues

# Todo-list
- skip when already exists type declaration in node_modules and package.json dependencies;
- add `-y, --yarn` option. (use `yarn` instead of `npm` to download)
- add `-c, --cnpm` option. (use `cnpm` instead of `npm` to download)

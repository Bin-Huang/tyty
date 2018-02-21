:star2: A cli tool to get all of type definitions(`@types/*`) for your project dependencies. Happier with `typescript` :heart:

![](https://raw.githubusercontent.com/Bin-Huang/tyty/master/image/example.PNG)

```
npm i tyty -g
```

# How To Use

Just open command line in your project, and type `tyty` + enter. All typescript definitions(`@types/*`) you need will be downloaded according to package.json.

If package.json not in current folder, `tyty` will try to find it in superior folder (and repeat if still).

```
  Usage: tyty [options]

  Options:

    -V, --version   output the version number
    -s, --save      download and add type definitions to package.json as dependency
    -d, --save-dev  (default) download and add type definitions to package.json as dev-dependency
    -h, --help      output usage information
```

# Contributes
- welcome `issuse` when have any question, bug, suggestion...
- welcome `fork` and `Pull Request`
- share the tool with friends and colleagues

# Todo
- add `-y, --yarn` option. (use `yarn` instead of `npm` to download)
- add `-c, --cnpm` option. (use `cnpm` instead of `npm` to download)

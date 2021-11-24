# next-js + flask application template

[![Twitter](https://img.shields.io/twitter/follow/SciKnowEngine.svg?style=social&label=@SciKnowEngine)](https://twitter.com/sciknowengine/)

##  Acknowledgements and Purpose 

This template was constructed from two simple boilerplate GitHub projects to provide 
a simple NextJS client on top of a Flask python backend.  
 
* https://github.com/KumarAbhirup/dockerized
* https://github.com/GullyBurns/react-flask-docker-boilerplate

This application is intended to provide a useful starting point for research prototyping 
based on pythonic data science with full data-visualization capabiliities derived from
Next/React/Typescript technology.  

##  Setup

### Development environment

- Run

```
git clone https://github.com/GullyBurns/nextjs-template # to clone project
cd nextjs-template # enter in the project
docker-compose up
```

- Rename all the `.env.example` to `.env`.

- Create a `.env` file in the root of the directory.

- Visit `http://localhost:3000/`

### Linting

- Run `yarn lint` in indivisual `packages` to check for linting errors.
- Run `yarn lint:fix` to fix the linting errors.

## Info

- We are following the micro-services architechture. That means, to install npm modules, you'll have to run `yarn add` in the respective packages.
- To customize the linter, use `.eslintrc` and `.prettierrc` file. [Learn more](https://eslint.org)

## License

**MIT**

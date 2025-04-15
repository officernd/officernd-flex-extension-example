## Configuration

### To test locally:

Go to `config.service.ts`, then

-   Change `https://app.officernd.com` to `http://localhost:3030`
-   Change `https://identity.officernd.com` to `https://identity-staging.officernd.com`
-   Chage `clientId` and `clientSecret` to thir respective values you can find in Data & Extensibility > Developer Tools > The application you've added > View in the cogwheel options
-   Change `https://ec3a-78-130-149-149.ngrok-free.app` to your ngrok url

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

-   Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
-   Website - [https://nestjs.com](https://nestjs.com/)
-   Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

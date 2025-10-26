# end to end tests 

Launching end to end tests against a local development server:
```
npx playwright test
```

Launching end to end tests against a deploy preview:
```
PLAYWRIGHT_BASE_URL=https://deploy-preview-36--herdonthehill.netlify.app/ npx playwright test
```

Running a single end to end test with a specific browser engine:
```
npx playwright test letter.spec.ts --project chromium
```

## Load Tests

I was hoping to use a "preview server" but unlike the "deploy previews" that get built for pull requests, the preview server on netlify is password protected, so the playwright tests can't touch it.

1. create a pull request and wait for the preview to build and run
2. run `letter.spec.ts` agaist the deploy server to make sure it will pass
3. 
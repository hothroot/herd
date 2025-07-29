#!/usr/bin/env bash

. .env

curl -G https://api.5calls.org/v1/representatives?location=41%20Union%20St%20Boston%20MA%2002108 \
  -H "X-5Calls-Token: $FIVECALLS_API" 
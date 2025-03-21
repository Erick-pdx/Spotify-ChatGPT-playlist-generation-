#!/bin/sh

if [ -z "$REACT_APP_OPENAI_API_KEY" ]; then
  echo "REACT_APP_OPENAI_API_KEY is not set" >&2
  exit 1
fi

echo "REACT_APP_OPENAI_API_KEY is: $REACT_APP_OPENAI_API_KEY" >&2

# Generate the config.js in the build folder instead of public
sed "s/__OPENAI_API_KEY__/$REACT_APP_OPENAI_API_KEY/" public/config.js.template > build/config.js

echo "Generated build/config.js:" >&2
cat build/config.js >&2

# Now start the Express server
exec node server/index.js

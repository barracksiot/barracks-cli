FROM        node:7.9.0
MAINTAINER  Grégoire Weber <gregoire@barracks.io>

ENV         DEBUG                         0
ENV         BARRACKS_BASE_URL             "https://app.barracks.io"
ENV         BARRACKS_ENABLE_V2            0
ENV         BARRACKS_ENABLE_EXPERIMENTAL  0

COPY        package.json usr/local/lib/node_modules/barracks-cli/barracks-cli/
RUN         cd /usr/local/lib/node_modules/barracks-cli/barracks-cli/ &&\
            npm install &&\
            ln -s /usr/local/lib/node_modules/barracks-cli/barracks-cli/src/bin/barracks /usr/local/bin/barracks
COPY        src/ /usr/local/lib/node_modules/barracks-cli/barracks-cli/src/.

ENTRYPOINT  ["barracks"]

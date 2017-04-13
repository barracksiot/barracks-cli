FROM        node:7.9.0
MAINTAINER  Grégoire Weber <gregoire@barracks.io>

ENV         DEBUG                         0
ENV         BARRACKS_BASE_URL             "https://app.barracks.io"
ENV         BARRACKS_ENABLE_V2            0
ENV         BARRACKS_ENABLE_EXPERIMENTAL  0

RUN         mkdir /barracks-cli && mkdir /barracks-cli/src
COPY        src/ /barracks-cli/src/.
COPY        package.json /barracks-cli/
RUN         cd /barracks-cli/ && npm install

ENTRYPOINT  ["/barracks-cli/src/bin/barracks"]

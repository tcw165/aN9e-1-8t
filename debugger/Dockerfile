FROM alpine:edge

RUN apk update

# Install on-my-zsh
RUN apk add \
  zsh \
  curl \
  wget \
  git \
  tar
RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
# Install plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions

# Install common libraries
RUN apk add \
  sqlite \
  postgresql

EXPOSE 3333

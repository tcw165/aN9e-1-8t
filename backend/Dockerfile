FROM ruby:3.1-slim

RUN apt-get update

# Install on-my-zsh
RUN apt-get install -y --fix-missing \
  zsh \
  curl \
  wget \
  git \
  tar
RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
# Install plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions

# Install common libraries
RUN apt-get install -y --fix-missing \
  build-essential \
  libpq-dev \
  sqlite3 \
  postgresql-client

WORKDIR /app

# Copy the entire code from host to container
COPY . /app/
RUN bundle install

EXPOSE 3000

CMD ["/app/bin/rails", "server", "-b", "0.0.0.0"]

FROM node:19-slim

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
# Pull my .zshrc
RUN git clone https://github.com/tcw165/shell.git ~/.my-zshrc
RUN rm ~/.zshrc && ln -s ~/.my-zshrc/.zshrc ~/.zshrc && \
  # Apply zsh as default shell
  chsh -s $(which zsh)

# Install common libraries
RUN apt-get install -y --fix-missing \
  build-essential \
  tree \
  fzf

WORKDIR /app
# Copy the entire code from host to container
COPY . /app/
RUN npm install

EXPOSE 5500/tcp

CMD ["npm", "run", "dev"]

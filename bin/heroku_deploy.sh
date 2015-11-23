# Heroku site deployment for blew-infosys.herokuapp.com
#
# Grunt is used for the deployment tasks; see Gruntfile.js
#
# Jeffrey Carpenter <i8degrees@gmail.com>
# https://github.com/i8degrees/blew-infosys
#

# Install SASS Ruby gem; a dependency for the grunt-contrib-sass task plugin
echo "Installing SASS"

# FIXME(jeff): Implement means of determining the current system Ruby version
# number for variable substitution of its version in GEM_HOME
export GEM_HOME=$HOME/.gem/ruby/2.2.0
export PATH="$GEM_HOME/bin:$PATH"
# export GEM_HOME=${HOME}/.gem
# export PATH=${GEM_HOME}/bin:${PATH}

gem install sass --user-install --no-rdoc --no-ri

# Run grunt deployment tasks
echo "Executing deployment tasks..."

# FIXME(jeff): Figure out how to tell Heroku not to fail deployment on task
# warnings; this is why I am using --force here.
grunt --force heroku

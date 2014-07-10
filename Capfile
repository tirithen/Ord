require "capistrano/node-deploy"

# This comfiguration file helps you to deploy with ease
#
# 1. Make sure that your host is accessible with :user via SSH, that :user has sudo
#    permissions and that it support upstart jobs.
# 2. Install the gem capistrano-node-deploy
# 3. Edit below to fit your environment
#
# More documentation can be found at https://github.com/loopj/capistrano-node-deploy



# ----- Start of configuration parameters -----

# Application
set :application, "appdomain.com"
role :app, "#{application}"
set :app_environment, "PORT=80 MONGO_DB=mongodb://username:password@host:port/database_name"
set :node_env, "production"
set :node_user, "#{application}"

# Deploy from local repository
set :repository,  "./"
set :user, ENV['USER'] # Default to current user
set :scm, :git
set :deploy_to, "/var/htdocs/#{application}"
set :deploy_via, :copy

# ----- End of configuration parameters -----



# Hide contents in upstart files since it contains app_environment
after "node:create_upstart_config" do
  sudo "chmod 600 #{shared_path}/#{application}.conf"
  sudo "chmod 600 #{upstart_file_path}"
end

# Set file ownership to user
before "deploy:create_release_dir" do
  sudo "chown -R #{user}:#{user} #{deploy_to}"
end

# Set file ownership to node_user
after "deploy:finalize_update" do
  sudo "chown -R #{node_user}:#{node_user} #{deploy_to}"
end

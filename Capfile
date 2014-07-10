require "capistrano/node-deploy"

# 1. Install the gem capistrano-node-deploy
# 2. Edit below to fit your environment
# More documentation can be found at https://github.com/loopj/capistrano-node-deploy



# ----- Start of configuration parameters -----

# Application
set :application, "mojlighetsministeriet.se"
role :app, :application
set :app_environment, "PORT=80 MONGO_DB=mongodb://username:password@host:port/database_name"
set :node_env, "production"

# Deploy from local repository
set :repository,  "./"
#set :user, "username"
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

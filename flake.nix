{
  description = "Build script";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nixos-generators = {
      url = "github:nix-community/nixos-generators";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      nixos-generators,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        config =
          if builtins.pathExists (self + "/config.json") then
            builtins.fromJSON (builtins.readFile (self + "/config.json"))
          else
            { };

        pkgs = import nixpkgs {
          inherit system;
        };

        frontendBuilder =
          { environment, apiUrl }:
          pkgs.buildNpmPackage {
            pname = "kawsay-${environment}";
            version = "0.1.0";
            src = ./.;
            nodejs = pkgs.nodejs_24;
            npmDepsHash = "sha256-4dBGWK/ZxvCEDeodrJPeBAt3iwV+hKxAnA8LsCtuimc=";

            buildPhase = ''
              runHook preBuild
              export VITE_API_BASE_URL=${apiUrl}
              npm run build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              cp -r ./dist/. $out
              runHook postInstall
            '';
          };

        defaultUrls = {
          development = "http://localhost:5167";
          staging = "http://kawsay-test.eastus.cloudapp.azure.com:5167";
          production = "https://kawsay.example.com";
        };

      in
      {
        packages = {
          staging = frontendBuilder {
            environment = "staging";
            apiUrl = defaultUrls.staging;
          };
          production = frontendBuilder {
            environment = "production";
            apiUrl = defaultUrls.production;
          };
          development = frontendBuilder {
            environment = "development";
            apiUrl = defaultUrls.development;
          };
          default = self.packages.${system}.development;

          dockerImageStaging = pkgs.dockerTools.buildImage {
            name = "kawsay-frontend";
            tag = "staging";

            copyToRoot = pkgs.buildEnv {
              name = "image-root";
              paths = [ 
                pkgs.nginx 
                pkgs.fakeNss
                (pkgs.runCommand "setup-dirs" {} ''
                  mkdir -p $out/var/log/nginx
                  mkdir -p $out/var/cache/nginx
                  mkdir -p $out/tmp
                  mkdir -p $out/run
                '')
              ];
              pathsToLink = [ "/bin" "/etc" "/share" "/var" "/tmp" "/run" ];
            };

            config = {
              Cmd = [ "${pkgs.nginx}/bin/nginx" "-c" (pkgs.writeText "nginx.conf" ''
                # Global settings
                user root;
                daemon off;
                error_log /dev/stderr info;
                pid /run/nginx.pid;

                events {
                  worker_connections 1024;
                }

                http {
                  # Logging
                  access_log /dev/stdout;
                  error_log /dev/stderr info;

                  # MIME types
                  include ${pkgs.nginx}/conf/mime.types;
                  default_type application/octet-stream;

                  # Temp directories
                  client_body_temp_path /tmp/client_body;
                  proxy_temp_path /tmp/proxy;
                  fastcgi_temp_path /tmp/fastcgi;
                  uwsgi_temp_path /tmp/uwsgi;
                  scgi_temp_path /tmp/scgi;

                  server {
                    listen 80;
                    server_name localhost;
                    root ${self.packages.${system}.staging};
                    index index.html;

                    location / {
                      try_files $uri $uri/ /index.html;
                    }
                  }
                }
              '') ];
              ExposedPorts = {
                "80/tcp" = {};
              };
            };
          };
        };
      }
    );
}

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
        pkgs = import nixpkgs {
          inherit system;
        };

        frontendBuilder =
          { environment, apiUrl, academicStructureFlag, endOfModuleFlag }:
          pkgs.buildNpmPackage {
            pname = "kawsay-${environment}";
            version = "0.1.0";
            src = ./.;
            nodejs = pkgs.nodejs_24;
            npmDepsHash = "sha256-WG3a/vv0nHdgb5Lcen8x4/Bnq2PWszUoTggKhHx81cA=";

            buildPhase = ''
              runHook preBuild
              # Set environment variables for the build process
              export VITE_API_BASE_URL=${apiUrl}
              export VITE_FEATURE_ACADEMIC_STRUCTURE_ENABLED=${academicStructureFlag}
              export VITE_FEATURE_END_OF_MODULE_ENABLED=${endOfModuleFlag}

              echo "Building for ${environment} with API_URL=${apiUrl}"
              echo "VITE_FEATURE_ACADEMIC_STRUCTURE_ENABLED=${academicStructureFlag}"
              echo "VITE_FEATURE_END_OF_MODULE_ENABLED=${endOfModuleFlag}"

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
          production = "http://kawsay-test.eastus.cloudapp.azure.com:5167";
        };

      in
      {
        packages = {
          production = frontendBuilder {
            environment = "production";
            apiUrl = defaultUrls.production;
            academicStructureFlag = "false";
            endOfModuleFlag = "false";
          };

          staging = frontendBuilder {
            environment = "staging";
            apiUrl = defaultUrls.staging;
            academicStructureFlag = "true";
            endOfModuleFlag = "true";
          };

          development = frontendBuilder {
            environment = "development";
            apiUrl = defaultUrls.development;
            academicStructureFlag = "true";
            endOfModuleFlag = "true";
          };

          default = self.packages.${system}.development;

          dockerBuild = pkgs.dockerTools.buildImage {
            name = "1kawsay/frontend-kawsay";
            tag = "latest";

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
                    root ${self.packages.${system}.production};
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

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
          ];
          VITE_FEATURE_ACADEMIC_STRUCTURE_ENABLED = "true";
          VITE_FEATURE_END_OF_MODULE_ENABLED = "true";
        };

        apps = {
          dev = flake-utils.lib.mkApp {
            drv = pkgs.writeShellApplication {
              name = "kawsay-frontend-dev-runner";
              runtimeInputs = with pkgs; [ nodejs_24 ];
              text = ''
                # Ensure local node_modules are available
                if [ ! -d "node_modules" ]; then
                  echo "node_modules not found, running npm install..."
                  npm install
                fi
                echo "Starting Vite dev server..."
                npm run dev
              '';
            };
          };

          default = self.apps.${system}.dev;
        };
      }
    );
}
